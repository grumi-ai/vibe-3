import { apiGet } from "../../shared/api/client";

export type ScheduleItem = {
  id: number;
  title: string;
  schedule_type: string;
  starts_at: string;
  ends_at: string;
};

export async function fetchSchedules(): Promise<{ items: ScheduleItem[] }> {
  return apiGet<{ items: ScheduleItem[] }>("/api/schedules");
}
