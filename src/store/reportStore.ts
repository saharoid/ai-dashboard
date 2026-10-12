import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import { Report } from "../types/Report";
import * as reportsApi from "../api/reports";

type ReportInput = Pick<Report, "title" | "content">;

interface ReportStore {
  reports: Report[];
  loading: boolean;
  error: string | null;
  selectedReport: Report | null;
  editorOpen: boolean;
  searchQuery: string;

  loadReports: () => Promise<void>;
  addReport: (input: ReportInput) => Promise<void>;
  updateReport: (id: string, input: ReportInput) => Promise<void>;
  moveReport: (activeId: string, overId: string) => Promise<void>;
  setEditorOpen: (open: boolean) => void;
  selectReport: (report: Report | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useReportStore = create<ReportStore>()((set, get) => ({
  reports: [],
  loading: false,
  error: null,
  selectedReport: null,
  editorOpen: false,
  searchQuery: "",

  loadReports: async () => {
    set({ loading: true, error: null });
    try {
      set({ reports: await reportsApi.fetchReports() });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to load reports" });
    } finally {
      set({ loading: false });
    }
  },

  addReport: async (input) => {
    const created = await reportsApi.createReport(input);
    set((state) => ({ reports: [...state.reports, created] }));
  },

  updateReport: async (id, input) => {
    const updated = await reportsApi.updateReport(id, input);
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? updated : r)),
    }));
  },

  // Move within the full list, so reports hidden by search keep their place.
  moveReport: async (activeId, overId) => {
    const before = get().reports;
    const from = before.findIndex((r) => r.id === activeId);
    const to = before.findIndex((r) => r.id === overId);
    if (from < 0 || to < 0 || from === to) return;

    const after = arrayMove(before, from, to);
    set({ reports: after });
    try {
      await reportsApi.saveOrder(after.map((r) => r.id));
    } catch (e) {
      console.error(e);
      set({ reports: before, error: "Failed to save order" });
    }
  },

  setEditorOpen: (open) => set({ editorOpen: open }),
  selectReport: (report) => set({ selectedReport: report }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
