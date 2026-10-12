import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  fetchReports: vi.fn(),
  createReport: vi.fn(),
  updateReport: vi.fn(),
  saveOrder: vi.fn(),
}));
vi.mock("../api/reports", () => api);

const { useReportStore } = await import("./reportStore");

const report = (id: string) => ({ id, title: id, content: "" });

describe("moveReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useReportStore.setState({
      reports: ["a", "b", "c", "d"].map(report),
      error: null,
    });
  });

  it("moves within the full list and saves every id", async () => {
    api.saveOrder.mockResolvedValue(undefined);
    await useReportStore.getState().moveReport("d", "a");

    const ids = useReportStore.getState().reports.map((r) => r.id);
    expect(ids).toEqual(["d", "a", "b", "c"]);
    expect(api.saveOrder).toHaveBeenCalledWith(["d", "a", "b", "c"]);
  });

  it("puts the old order back if saving fails", async () => {
    api.saveOrder.mockRejectedValue(new Error("down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await useReportStore.getState().moveReport("d", "a");

    const state = useReportStore.getState();
    expect(state.reports.map((r) => r.id)).toEqual(["a", "b", "c", "d"]);
    expect(state.error).toBe("Failed to save order");
  });
});

describe("setSummary", () => {
  it("adds the summary to one report only", () => {
    useReportStore.setState({ reports: ["a", "b"].map(report) });
    useReportStore.getState().setSummary("b", "<p>s</p>");
    const [a, b] = useReportStore.getState().reports;
    expect(a.summary).toBeUndefined();
    expect(b.summary).toBe("<p>s</p>");
  });
});
