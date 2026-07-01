import { apiGet } from "./client";

export type SystemHealth = {
  service: string;
  status: string;
  database: {
    status: string;
    sqlite_version: string;
    database_path: string;
  };
};

export async function getSystemHealth(): Promise<SystemHealth> {
  return apiGet<SystemHealth>("/api/health");
}
