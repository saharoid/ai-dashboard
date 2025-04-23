// src/store/reportStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Report {
  id: string;
  title: string;
  content: string;
}

interface ReportStore {
  reports: Report[];
  selectedReport: Report | null;
  editorOpen: boolean;

  setEditorOpen: (open: boolean) => void;
  setReports: (reports: Report[]) => void;
  addReport: (report: Report) => void;
  updateReport: (updated: Report) => void;
  deleteReport: (id: string) => void;
  selectReport: (report: Report | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set) => ({
      reports: [],
      selectedReport: null,
      editorOpen: false,

      setEditorOpen: (open) => set({ editorOpen: open }),

      setReports: (reports) => set({ reports }),

      addReport: (report) =>
        set((state) => ({
          reports: [...state.reports, { ...report, id: uuidv4() }],
        })),

      updateReport: (updated) =>
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === updated.id ? updated : r
          ),
        })),

      deleteReport: (id) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== id),
        })),

      selectReport: (report) => set({ selectedReport: report }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'report-store', // key in localStorage
      partialize: (state) => ({
        reports: state.reports,
      }),
    }
  )
);
