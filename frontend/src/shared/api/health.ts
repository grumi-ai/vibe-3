import { apiGet } from "./client";

export type SystemHealth = {
  service: string;
  status: string;
  database: {
    status: string;
    sqlite_version: string;
    database_path: string;
    tables: string[];
  };
};

export async function getSystemHealth(): Promise<SystemHealth> {
  return apiGet<SystemHealth>("/api/health");
}

export type DatabaseHealth = SystemHealth["database"];

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  return apiGet<DatabaseHealth>("/api/db/health");
}
