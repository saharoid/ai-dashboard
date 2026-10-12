import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Fake Supabase: tokens map to users, queries return queued results.
const fake = vi.hoisted(() => {
  const state = {
    roles: {} as Record<string, string>,
    queue: [] as unknown[],
    updates: [] as unknown[],
  };
  const chain = (table: string) => {
    const next = () =>
      table === "profiles"
        ? { data: { role: state.roles.current }, error: null }
        : state.queue.shift() ?? { data: null, error: null };
    const q: Record<string, unknown> = {};
    for (const m of ["select", "eq", "order", "limit", "insert", "delete"]) {
      q[m] = () => q;
    }
    q.update = (values: unknown) => {
      state.updates.push(values);
      return q;
    };
    q.maybeSingle = async () => next();
    q.single = async () => next();
    q.then = (ok: (v: unknown) => unknown, fail: (e: unknown) => unknown) =>
      Promise.resolve(next()).then(ok, fail);
    return q;
  };
  const supabase = {
    auth: {
      getUser: async (token: string) => {
        const role = { "admin-token": "admin", "viewer-token": "viewer" }[token];
        if (!role) return { data: { user: null }, error: new Error("bad") };
        state.roles.current = role;
        return { data: { user: { id: `${role}-id`, email: `${role}@x.dev` } }, error: null };
      },
    },
    from: chain,
  };
  return { state, supabase };
});

vi.mock("./supabase", () => ({ supabase: fake.supabase }));

const { app } = await import("./app");

const admin = { Authorization: "Bearer admin-token" };
const viewer = { Authorization: "Bearer viewer-token" };
const REPORT_ID = "11111111-1111-1111-1111-111111111111";

// A fake OpenAI streaming reply made of the given chunks.
const sse = (chunks: string[]) =>
  new Response(
    chunks
      .map((c) => `data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`)
      .join("") + "data: [DONE]\n\n",
    { status: 200, headers: { "Content-Type": "text/event-stream" } }
  );

beforeEach(() => {
  fake.state.queue = [];
  fake.state.updates = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("auth", () => {
  it("health needs no token", async () => {
    await request(app).get("/api/health").expect(200, { ok: true });
  });

  it("rejects missing and bad tokens", async () => {
    await request(app).get("/api/me").expect(401);
    await request(app).get("/api/me").set({ Authorization: "Bearer nope" }).expect(401);
  });

  it("returns the role from profiles", async () => {
    const res = await request(app).get("/api/me").set(viewer).expect(200);
    expect(res.body).toMatchObject({ email: "viewer@x.dev", role: "viewer" });
  });
});

describe("reports", () => {
  it("lets viewers read but not write", async () => {
    fake.state.queue.push({ data: [{ id: REPORT_ID, title: "A" }], error: null });
    const res = await request(app).get("/api/reports").set(viewer).expect(200);
    expect(res.body).toHaveLength(1);

    await request(app).post("/api/reports").set(viewer).send({ title: "t", content: "c" }).expect(403);
    await request(app).put("/api/reports/order").set(viewer).send({ ids: [] }).expect(403);
  });

  it("validates new reports", async () => {
    await request(app).post("/api/reports").set(admin).send({ title: "" }).expect(400);
  });

  it("creates a report at the end of the list", async () => {
    fake.state.queue.push(
      { data: { position: 4 }, error: null },
      { data: { id: REPORT_ID, title: "t", content: "c", position: 5 }, error: null }
    );
    const res = await request(app)
      .post("/api/reports")
      .set(admin)
      .send({ title: "t", content: "c" })
      .expect(201);
    expect(res.body.position).toBe(5);
  });

  it("answers 404 for malformed ids", async () => {
    await request(app).put("/api/reports/not-a-uuid").set(admin).send({ title: "t", content: "c" }).expect(404);
  });
});

describe("AI", () => {
  it("streams a draft as plain text", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sse(["Hel", "lo ", "world"]));
    vi.stubGlobal("fetch", fetchMock);

    const res = await request(app).post("/api/draft").set(admin).send({ prompt: "hi" }).expect(200);
    expect(res.text).toBe("Hello world");
    expect(fetchMock.mock.calls[0][0]).toBe("http://openai.test/v1/chat/completions");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ stream: true });
  });

  it("is admin only", async () => {
    await request(app).post("/api/draft").set(viewer).send({ prompt: "hi" }).expect(403);
  });

  it("returns 502 when OpenAI fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await request(app).post("/api/draft").set(admin).send({ prompt: "hi" }).expect(502);
  });

  it("saves the summary as HTML without touching content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sse(["- one\n", "- two\n"])));
    fake.state.queue.push({ data: { content: "<p>report</p>" }, error: null });

    const res = await request(app).post(`/api/reports/${REPORT_ID}/summarize`).set(admin).expect(200);
    expect(res.text).toBe("- one\n- two\n");
    await vi.waitFor(() => expect(fake.state.updates).toHaveLength(1));
    expect(fake.state.updates[0]).toEqual({
      summary: "<ul>\n<li>one</li>\n<li>two</li>\n</ul>\n",
    });
  });
});
