import { apiGet, apiJson } from "../../shared/api/client";

export type MemberItem = {
  id: number;
  name: string;
  department: string | null;
  role: string | null;
  phone: string | null;
  memo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

export type ScheduleItem = {
  id: number;
  member_id: number | null;
  member_name: string | null;
  title: string;
  schedule_type: string;
  starts_at: string;
  ends_at: string;
  location: string | null;
  memo: string | null;
};

export type MemberPayload = {
  name: string;
  department: string;
  role: string;
  phone: string;
  memo: string;
};

export type SchedulePayload = {
  member_id: number | null;
  title: string;
  schedule_type: string;
  starts_at: string;
  ends_at: string;
  location: string;
  memo: string;
};

export async function listMembers(query?: { keyword?: string; isActive?: boolean | null }): Promise<{ items: MemberItem[] }> {
  const params = new URLSearchParams();
  if (query?.keyword) params.set("keyword", query.keyword);
  if (query?.isActive !== undefined && query.isActive !== null) params.set("isActive", String(query.isActive));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiGet<{ items: MemberItem[] }>(`/api/members${suffix}`);
}

export async function createMember(payload: MemberPayload): Promise<MemberItem> {
  return apiJson<MemberItem>("/api/members", "POST", payload);
}

export async function updateMember(id: number, payload: MemberPayload & { is_active?: boolean }): Promise<MemberItem> {
  return apiJson<MemberItem>(`/api/members/${id}`, "PUT", payload);
}

export async function deleteMember(id: number): Promise<void> {
  await apiJson<void>(`/api/members/${id}`, "DELETE");
}

export async function listSchedules(query?: {
  start?: string;
  end?: string;
  memberId?: number | null;
  keyword?: string;
}): Promise<{ items: ScheduleItem[] }> {
  const params = new URLSearchParams();
  if (query?.start) params.set("start", query.start);
  if (query?.end) params.set("end", query.end);
  if (query?.memberId !== undefined && query.memberId !== null) params.set("memberId", String(query.memberId));
  if (query?.keyword) params.set("keyword", query.keyword);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiGet<{ items: ScheduleItem[] }>(`/api/schedules${suffix}`);
}

export async function createSchedule(payload: SchedulePayload): Promise<ScheduleItem> {
  return apiJson<ScheduleItem>("/api/schedules", "POST", payload);
}

export async function updateSchedule(id: number, payload: SchedulePayload): Promise<ScheduleItem> {
  return apiJson<ScheduleItem>(`/api/schedules/${id}`, "PUT", payload);
}

export async function deleteSchedule(id: number): Promise<void> {
  await apiJson<void>(`/api/schedules/${id}`, "DELETE");
}
