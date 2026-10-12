import { Report } from "../types/Report";
import { api } from "./client";

type ReportInput = Pick<Report, "title" | "content">;

export const fetchReports = async (): Promise<Report[]> =>
  (await api.get("/reports")).data;

export const createReport = async (input: ReportInput): Promise<Report> =>
  (await api.post("/reports", input)).data;

export const updateReport = async (
  id: string,
  input: ReportInput
): Promise<Report> => (await api.put(`/reports/${id}`, input)).data;

export const saveOrder = async (ids: string[]): Promise<void> => {
  await api.put("/reports/order", { ids });
};
