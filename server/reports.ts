import { Router } from "express";
import { requireAdmin } from "./auth";
import { supabase } from "./supabase";

const FIELDS = "id, title, content, position";
const MAX_TITLE = 200;
const MAX_CONTENT = 200_000;

const isText = (v: unknown, max: number): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= max;

export const reports = Router();

reports.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("reports")
    .select(FIELDS)
    .order("position")
    .order("created_at");
  if (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load reports" });
    return;
  }
  res.json(data);
});

reports.post("/", requireAdmin, async (req, res) => {
  const { title, content } = req.body ?? {};
  if (!isText(title, MAX_TITLE) || !isText(content, MAX_CONTENT)) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }

  // New reports go to the end.
  const { data: last } = await supabase
    .from("reports")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("reports")
    .insert({
      title,
      content,
      position: (last?.position ?? -1) + 1,
      created_by: req.user!.id,
    })
    .select(FIELDS)
    .single();
  if (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create report" });
    return;
  }
  res.status(201).json(data);
});

// Save a new order. Body: { ids: string[] } with every report id, top first.
reports.put("/order", requireAdmin, async (req, res) => {
  const ids: unknown = req.body?.ids;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
    res.status(400).json({ error: "ids must be an array of strings" });
    return;
  }

  const results = await Promise.all(
    ids.map((id, position) =>
      supabase.from("reports").update({ position }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed) {
    console.error(failed.error);
    res.status(500).json({ error: "Failed to save order" });
    return;
  }
  res.status(204).end();
});

reports.put("/:id", requireAdmin, async (req, res) => {
  const { title, content } = req.body ?? {};
  if (!isText(title, MAX_TITLE) || !isText(content, MAX_CONTENT)) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }

  const { data, error } = await supabase
    .from("reports")
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select(FIELDS)
    .maybeSingle();
  if (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update report" });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(data);
});

reports.delete("/:id", requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", req.params.id);
  if (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete report" });
    return;
  }
  res.status(204).end();
});
