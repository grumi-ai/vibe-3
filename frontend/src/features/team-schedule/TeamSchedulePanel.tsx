import { type FormEvent, useEffect, useState } from "react";
import { addDays, endOfMonth, endOfWeek, formatDate, startOfMonth, startOfWeek } from "../../shared/utils/date";
import {
  createMember,
  createSchedule,
  deleteMember,
  deleteSchedule,
  listMembers,
  listSchedules,
  updateMember,
  updateSchedule,
  type MemberItem,
  type ScheduleItem,
} from "./api";

type ViewMode = "members" | "schedules" | "week" | "month";

type MemberFormState = {
  name: string;
  role: string;
  phone: string;
  memo: string;
};

type ScheduleFormState = {
  member_id: string;
  title: string;
  schedule_type: string;
  starts_at: string;
  ends_at: string;
  location: string;
  memo: string;
};

const emptyMemberForm: MemberFormState = {
  name: "",
  role: "",
  phone: "",
  memo: "",
};

const emptyScheduleForm: ScheduleFormState = {
  member_id: "",
  title: "",
  schedule_type: "General",
  starts_at: "",
  ends_at: "",
  location: "",
  memo: "",
};

function resolveMemberName(schedule: ScheduleItem, members: MemberItem[]): string {
  return schedule.member_name ?? members.find((member) => member.id === schedule.member_id)?.name ?? "Unassigned";
}

function groupSchedulesByDay(schedules: ScheduleItem[]) {
  const groups = new Map<string, ScheduleItem[]>();
  for (const schedule of schedules) {
    const key = formatDate(schedule.starts_at);
    const items = groups.get(key) ?? [];
    items.push(schedule);
    groups.set(key, items);
  }
  for (const items of groups.values()) {
    items.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  }
  return groups;
}

export function TeamSchedulePanel() {
  const [activeView, setActiveView] = useState<ViewMode>("members");
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [memberFilterId, setMemberFilterId] = useState<string>("all");
  const [memberKeyword, setMemberKeyword] = useState("");
  const [memberActiveFilter, setMemberActiveFilter] = useState<string>("all");
  const [scheduleKeyword, setScheduleKeyword] = useState("");
  const [memberForm, setMemberForm] = useState<MemberFormState>(emptyMemberForm);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>(emptyScheduleForm);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const scheduleQuery =
    activeView === "week"
      ? { start: formatDate(startOfWeek(selectedDate)), end: formatDate(endOfWeek(selectedDate)) }
      : activeView === "month"
        ? { start: formatDate(startOfMonth(selectedDate)), end: formatDate(endOfMonth(selectedDate)) }
        : {};

  async function refreshMembers() {
    const isActive = memberActiveFilter === "all" ? null : memberActiveFilter === "active";
    const data = await listMembers({ keyword: memberKeyword.trim() || undefined, isActive });
    setMembers(data.items);
  }

  async function refreshSchedules() {
    const memberId = memberFilterId === "all" ? null : Number(memberFilterId);
    const data = await listSchedules({ ...scheduleQuery, memberId, keyword: scheduleKeyword.trim() || undefined });
    setSchedules(data.items);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([refreshMembers(), refreshSchedules()])
      .then(() => setError(null))
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load data.");
      })
      .finally(() => setLoading(false));
  }, [activeView, selectedDate, memberFilterId, memberKeyword, memberActiveFilter, scheduleKeyword]);

  function resetMemberForm() {
    setMemberForm(emptyMemberForm);
    setEditingMemberId(null);
  }

  function resetScheduleForm() {
    setScheduleForm(emptyScheduleForm);
    setEditingScheduleId(null);
  }

  async function handleMemberSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: memberForm.name.trim(),
        role: memberForm.role.trim(),
        phone: memberForm.phone.trim(),
        memo: memberForm.memo.trim(),
      };

      if (editingMemberId === null) {
        await createMember(payload);
        setMessage("Member created.");
      } else {
        await updateMember(editingMemberId, payload);
        setMessage("Member updated.");
      }

      await refreshMembers();
      resetMemberForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save member.");
    } finally {
      setLoading(false);
    }
  }

  async function handleScheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        member_id: scheduleForm.member_id ? Number(scheduleForm.member_id) : null,
        title: scheduleForm.title.trim(),
        schedule_type: scheduleForm.schedule_type.trim(),
        starts_at: scheduleForm.starts_at,
        ends_at: scheduleForm.ends_at,
        location: scheduleForm.location.trim(),
        memo: scheduleForm.memo.trim(),
      };

      if (editingScheduleId === null) {
        await createSchedule(payload);
        setMessage("Schedule created.");
      } else {
        await updateSchedule(editingScheduleId, payload);
        setMessage("Schedule updated.");
      }

      await refreshSchedules();
      resetScheduleForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save schedule.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMember(id: number) {
    if (!window.confirm("Deactivate this member?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteMember(id);
      await refreshMembers();
      await refreshSchedules();
      setMessage("Member deactivated.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete member.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSchedule(id: number) {
    if (!window.confirm("Delete this schedule?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteSchedule(id);
      await refreshSchedules();
      setMessage("Schedule deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete schedule.");
    } finally {
      setLoading(false);
    }
  }

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const monthStart = startOfMonth(selectedDate);
  const monthGridStart = startOfWeek(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(monthGridStart, index));
  const schedulesByDay = groupSchedulesByDay(schedules);

  return (
    <section className="teamSchedule">
      <header className="teamScheduleHeader">
        <div>
          <p className="eyebrow">TEAM SCHEDULE</p>
          <h2>Team member schedule management</h2>
          <p className="lead">
            Manage members, schedules, weekly list view, and monthly calendar view in one place.
          </p>
        </div>
        <div className="teamScheduleActions">
          {(["members", "schedules", "week", "month"] as ViewMode[]).map((view) => (
            <button key={view} type="button" className={activeView === view ? "tab active" : "tab"} onClick={() => setActiveView(view)}>
              {view}
            </button>
          ))}
        </div>
      </header>

      {message ? <p className="successText">{message}</p> : null}
      {error ? <p className="errorText">{error}</p> : null}
      {loading ? <p className="probeText">Loading...</p> : null}

      <div className="teamScheduleBody">
        {activeView === "members" ? (
          <div className="twoColumn">
            <section className="panelCard">
              <h3>{editingMemberId === null ? "Create member" : "Edit member"}</h3>
              <form className="stackForm" onSubmit={handleMemberSubmit}>
                <label>
                  Name
                  <input value={memberForm.name} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} required />
                </label>
                <label>
                  Role
                  <input value={memberForm.role} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })} />
                </label>
                <label>
                  Phone
                  <input value={memberForm.phone} onChange={(event) => setMemberForm({ ...memberForm, phone: event.target.value })} />
                </label>
                <label>
                  Memo
                  <textarea value={memberForm.memo} onChange={(event) => setMemberForm({ ...memberForm, memo: event.target.value })} rows={4} />
                </label>
                <div className="buttonRow">
                  <button type="submit" className="primaryButton">
                    {editingMemberId === null ? "Save" : "Update"}
                  </button>
                  {editingMemberId !== null ? (
                    <button type="button" className="ghostButton" onClick={resetMemberForm}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="panelCard">
              <h3>Member list</h3>
              <div className="filterBar">
                <input
                  placeholder="Search by name, role, phone"
                  value={memberKeyword}
                  onChange={(event) => setMemberKeyword(event.target.value)}
                />
                <select value={memberActiveFilter} onChange={(event) => setMemberActiveFilter(event.target.value)}>
                  <option value="all">All status</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>
                <button type="button" className="ghostButton" onClick={refreshMembers}>
                  Apply
                </button>
              </div>
              <div className="tableWrap">
                <table className="dataTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.role ?? "-"}</td>
                        <td>{member.phone ?? "-"}</td>
                        <td>{member.is_active ? "Active" : "Inactive"}</td>
                        <td>
                          <div className="rowActions">
                            <button
                              type="button"
                              className="ghostButton"
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setMemberForm({
                                  name: member.name,
                                  role: member.role ?? "",
                                  phone: member.phone ?? "",
                                  memo: member.memo ?? "",
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button type="button" className="dangerButton" onClick={() => handleDeleteMember(member.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={5}>No members yet.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {activeView === "schedules" ? (
          <div className="twoColumn">
            <section className="panelCard">
              <h3>{editingScheduleId === null ? "Create schedule" : "Edit schedule"}</h3>
              <form className="stackForm" onSubmit={handleScheduleSubmit}>
                <label>
                  Member
                  <select value={scheduleForm.member_id} onChange={(event) => setScheduleForm({ ...scheduleForm, member_id: event.target.value })}>
                    <option value="">Unassigned</option>
                    {members
                      .filter((member) => member.is_active)
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Title
                  <input value={scheduleForm.title} onChange={(event) => setScheduleForm({ ...scheduleForm, title: event.target.value })} required />
                </label>
                <label>
                  Type
                  <input value={scheduleForm.schedule_type} onChange={(event) => setScheduleForm({ ...scheduleForm, schedule_type: event.target.value })} />
                </label>
                <label>
                  Starts at
                  <input type="datetime-local" value={scheduleForm.starts_at} onChange={(event) => setScheduleForm({ ...scheduleForm, starts_at: event.target.value })} required />
                </label>
                <label>
                  Ends at
                  <input type="datetime-local" value={scheduleForm.ends_at} onChange={(event) => setScheduleForm({ ...scheduleForm, ends_at: event.target.value })} required />
                </label>
                <label>
                  Location
                  <input value={scheduleForm.location} onChange={(event) => setScheduleForm({ ...scheduleForm, location: event.target.value })} />
                </label>
                <label>
                  Memo
                  <textarea value={scheduleForm.memo} onChange={(event) => setScheduleForm({ ...scheduleForm, memo: event.target.value })} rows={4} />
                </label>
                <div className="buttonRow">
                  <button type="submit" className="primaryButton">
                    {editingScheduleId === null ? "Save" : "Update"}
                  </button>
                  {editingScheduleId !== null ? (
                    <button type="button" className="ghostButton" onClick={resetScheduleForm}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="panelCard">
              <h3>Schedule list</h3>
              <div className="filterBar">
                <input
                  placeholder="Search schedule title"
                  value={scheduleKeyword}
                  onChange={(event) => setScheduleKeyword(event.target.value)}
                />
                <select value={memberFilterId} onChange={(event) => setMemberFilterId(event.target.value)}>
                  <option value="all">All members</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="ghostButton" onClick={refreshSchedules}>
                  Apply
                </button>
              </div>
              <div className="tableWrap">
                <table className="dataTable">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Title</th>
                      <th>Range</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>{resolveMemberName(schedule, members)}</td>
                        <td>{schedule.title}</td>
                        <td>
                          {schedule.starts_at.replace("T", " ")} ~ {schedule.ends_at.replace("T", " ")}
                        </td>
                        <td>{schedule.schedule_type}</td>
                        <td>
                          <div className="rowActions">
                            <button
                              type="button"
                              className="ghostButton"
                              onClick={() => {
                                setEditingScheduleId(schedule.id);
                                setScheduleForm({
                                  member_id: schedule.member_id ? String(schedule.member_id) : "",
                                  title: schedule.title,
                                  schedule_type: schedule.schedule_type,
                                  starts_at: schedule.starts_at,
                                  ends_at: schedule.ends_at,
                                  location: schedule.location ?? "",
                                  memo: schedule.memo ?? "",
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button type="button" className="dangerButton" onClick={() => handleDeleteSchedule(schedule.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {schedules.length === 0 ? (
                      <tr>
                        <td colSpan={5}>No schedules yet.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {activeView === "week" ? (
          <section className="panelCard">
            <div className="calendarHeader">
              <h3>Weekly view</h3>
              <div className="buttonRow">
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
                  Previous
                </button>
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(new Date())}>
                  Today
                </button>
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
                  Next
                </button>
              </div>
            </div>
            <div className="filterBar">
              <input
                placeholder="Search schedule title"
                value={scheduleKeyword}
                onChange={(event) => setScheduleKeyword(event.target.value)}
              />
              <select value={memberFilterId} onChange={(event) => setMemberFilterId(event.target.value)}>
                <option value="all">All members</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button type="button" className="ghostButton" onClick={refreshSchedules}>
                Apply
              </button>
            </div>
            <div className="weekGrid">
              {weekDays.map((day) => {
                const key = formatDate(day);
                const items = schedulesByDay.get(key) ?? [];
                return (
                  <article key={key} className="dayColumn">
                    <header>
                      <p>{day.toLocaleDateString("en-US", { month: "numeric", day: "numeric", weekday: "short" })}</p>
                    </header>
                    <ul>
                      {items.map((schedule) => (
                        <li key={schedule.id}>
                          <strong>{schedule.title}</strong>
                          <span>
                            {schedule.starts_at.slice(11, 16)} - {schedule.ends_at.slice(11, 16)}
                          </span>
                          <span>{resolveMemberName(schedule, members)}</span>
                        </li>
                      ))}
                      {items.length === 0 ? <li className="emptyCell">No schedules</li> : null}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeView === "month" ? (
          <section className="panelCard">
            <div className="calendarHeader">
              <h3>Monthly view</h3>
              <div className="buttonRow">
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}>
                  Previous
                </button>
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(new Date())}>
                  Today
                </button>
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}>
                  Next
                </button>
              </div>
            </div>
            <div className="filterBar">
              <input
                placeholder="Search schedule title"
                value={scheduleKeyword}
                onChange={(event) => setScheduleKeyword(event.target.value)}
              />
              <select value={memberFilterId} onChange={(event) => setMemberFilterId(event.target.value)}>
                <option value="all">All members</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button type="button" className="ghostButton" onClick={refreshSchedules}>
                Apply
              </button>
            </div>

            <div className="monthGrid">
              {monthDays.map((day) => {
                const key = formatDate(day);
                const items = schedulesByDay.get(key) ?? [];
                const inCurrentMonth = day.getMonth() === selectedDate.getMonth();
                return (
                  <article key={key} className={inCurrentMonth ? "monthCell" : "monthCell muted"}>
                    <header>
                      <strong>{day.getDate()}</strong>
                    </header>
                    <ul>
                      {items.slice(0, 3).map((schedule) => (
                        <li key={schedule.id}>
                          <strong>{schedule.title}</strong>
                          <span>{schedule.starts_at.slice(11, 16)}</span>
                        </li>
                      ))}
                      {items.length > 3 ? <li className="moreItem">+{items.length - 3} more</li> : null}
                      {items.length === 0 ? <li className="emptyCell">No schedules</li> : null}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
