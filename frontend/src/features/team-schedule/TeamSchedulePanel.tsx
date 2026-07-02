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
  department: string;
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
  department: "",
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
  return schedule.member_name ?? members.find((member) => member.id === schedule.member_id)?.name ?? "미배정";
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

function isSameDay(left: Date, right: Date): boolean {
  return formatDate(left) === formatDate(right);
}

function normalizeScheduleTypeClass(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "general" || normalized === "일반") {
    return "general";
  }
  if (normalized === "vacation" || normalized === "휴가") {
    return "vacation";
  }
  if (normalized === "business" || normalized === "출장") {
    return "business";
  }
  if (normalized === "work" || normalized === "근무") {
    return "work";
  }
  return normalized.replace(/\s+/g, "-");
}

function formatScheduleTypeLabel(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "general" || normalized === "일반") {
    return "일반";
  }
  if (normalized === "vacation" || normalized === "휴가") {
    return "휴가";
  }
  if (normalized === "business" || normalized === "출장") {
    return "출장";
  }
  if (normalized === "work" || normalized === "근무") {
    return "근무";
  }
  return value;
}

function formatKoreanDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString("ko-KR", options);
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
        setError(fetchError instanceof Error ? fetchError.message : "데이터를 불러오지 못했습니다.");
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
        department: memberForm.department.trim(),
        role: memberForm.role.trim(),
        phone: memberForm.phone.trim(),
        memo: memberForm.memo.trim(),
      };

      if (editingMemberId === null) {
        await createMember(payload);
        setMessage("구성원을 등록했습니다.");
      } else {
        await updateMember(editingMemberId, payload);
        setMessage("구성원 정보를 수정했습니다.");
      }

      await refreshMembers();
      resetMemberForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "구성원 저장에 실패했습니다.");
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
        setMessage("일정을 등록했습니다.");
      } else {
        await updateSchedule(editingScheduleId, payload);
        setMessage("일정을 수정했습니다.");
      }

      await refreshSchedules();
      resetScheduleForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "일정 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMember(id: number) {
    if (!window.confirm("이 구성원을 비활성화하시겠습니까?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteMember(id);
      await refreshMembers();
      await refreshSchedules();
      setMessage("구성원을 비활성화했습니다.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "구성원 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSchedule(id: number) {
    if (!window.confirm("이 일정을 삭제하시겠습니까?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteSchedule(id);
      await refreshSchedules();
      setMessage("일정을 삭제했습니다.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "일정 삭제에 실패했습니다.");
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
  const today = new Date();
  const activeMembersCount = members.filter((member) => member.is_active).length;
  const inactiveMembersCount = members.length - activeMembersCount;
  const monthLabel = formatKoreanDate(selectedDate, { year: "numeric", month: "long" });
  const weekLabel = `${formatKoreanDate(weekStart, { month: "long", day: "numeric" })} - ${formatKoreanDate(weekDays[6], {
    month: "long",
    day: "numeric",
  })}`;
  const viewLabel =
    activeView === "members"
      ? "구성원 관리"
      : activeView === "schedules"
        ? "일정 목록"
        : activeView === "week"
          ? "주간 뷰"
          : "월간 뷰";
  const periodLabel = activeView === "month" ? monthLabel : activeView === "week" ? weekLabel : "전체 범위";
  const visibleScheduleCount = schedules.length;

  return (
    <section className="teamSchedule">
      <header className="teamScheduleHeader">
        <div>
          <p className="eyebrow">팀 일정</p>
          <h2>팀 구성원 일정 관리</h2>
          <p className="lead">구성원, 일정, 주간 리스트 뷰, 월간 캘린더 뷰를 한 곳에서 관리합니다.</p>
        </div>
        <div className="teamScheduleActions">
          {(["members", "schedules", "week", "month"] as ViewMode[]).map((view) => (
            <button
              key={view}
              type="button"
              className={activeView === view ? "tab active" : "tab"}
              onClick={() => setActiveView(view)}
            >
              {view === "members" ? "구성원" : view === "schedules" ? "일정 목록" : view === "week" ? "주간 뷰" : "월간 뷰"}
            </button>
          ))}
        </div>
      </header>

      {message ? <p className="successText">{message}</p> : null}
      {error ? <p className="errorText">{error}</p> : null}
      {loading ? <p className="probeText">불러오는 중...</p> : null}

      <div className="scheduleOverview">
        <article className="overviewCard overviewAccentGreen">
          <p className="overviewLabel">전체 구성원</p>
          <strong>{members.length}</strong>
          <span>활성 {activeMembersCount}명 · 비활성 {inactiveMembersCount}명</span>
        </article>
        <article className="overviewCard overviewAccentBlue">
          <p className="overviewLabel">보이는 일정</p>
          <strong>{visibleScheduleCount}</strong>
          <span>{viewLabel} 기준으로 조회 중입니다.</span>
        </article>
        <article className="overviewCard overviewAccentAmber">
          <p className="overviewLabel">현재 범위</p>
          <strong>{periodLabel}</strong>
          <span>{memberFilterId === "all" ? "전체 구성원" : "선택한 구성원 필터를 적용했습니다."}</span>
        </article>
      </div>

      <div className="teamScheduleBody">
        {activeView === "members" ? (
          <div className="twoColumn">
            <section className="panelCard">
              <h3>{editingMemberId === null ? "구성원 등록" : "구성원 수정"}</h3>
              <form className="stackForm" onSubmit={handleMemberSubmit}>
                <label>
                  이름
                  <input value={memberForm.name} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} required />
                </label>
                <label>
                  부서
                  <input
                    value={memberForm.department}
                    onChange={(event) => setMemberForm({ ...memberForm, department: event.target.value })}
                    placeholder="예: 기획팀"
                  />
                </label>
                <label>
                  직책
                  <input value={memberForm.role} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })} />
                </label>
                <label>
                  연락처
                  <input value={memberForm.phone} onChange={(event) => setMemberForm({ ...memberForm, phone: event.target.value })} />
                </label>
                <label>
                  메모
                  <textarea value={memberForm.memo} onChange={(event) => setMemberForm({ ...memberForm, memo: event.target.value })} rows={4} />
                </label>
                <div className="buttonRow">
                  <button type="submit" className="primaryButton">
                    {editingMemberId === null ? "저장" : "수정"}
                  </button>
                  {editingMemberId !== null ? (
                    <button type="button" className="ghostButton" onClick={resetMemberForm}>
                      취소
                    </button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="panelCard">
              <h3>구성원 목록</h3>
              <div className="filterBar">
                <input placeholder="이름, 직책, 연락처로 검색" value={memberKeyword} onChange={(event) => setMemberKeyword(event.target.value)} />
                <select value={memberActiveFilter} onChange={(event) => setMemberActiveFilter(event.target.value)}>
                  <option value="all">전체 상태</option>
                  <option value="active">활성만</option>
                  <option value="inactive">비활성만</option>
                </select>
                <button type="button" className="ghostButton" onClick={refreshMembers}>
                  적용
                </button>
              </div>
              <div className="tableWrap">
                <table className="dataTable">
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>부서</th>
                      <th>직책</th>
                      <th>연락처</th>
                      <th>상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td>{member.name}</td>
                        <td>{member.department ?? "-"}</td>
                        <td>{member.role ?? "-"}</td>
                        <td>{member.phone ?? "-"}</td>
                        <td>{member.is_active ? "활성" : "비활성"}</td>
                        <td>
                          <div className="rowActions">
                            <button
                              type="button"
                              className="ghostButton"
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setMemberForm({
                                  name: member.name,
                                  department: member.department ?? "",
                                  role: member.role ?? "",
                                  phone: member.phone ?? "",
                                  memo: member.memo ?? "",
                                });
                              }}
                            >
                              수정
                            </button>
                            <button type="button" className="dangerButton" onClick={() => handleDeleteMember(member.id)}>
                              비활성화
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={6}>등록된 구성원이 없습니다.</td>
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
              <h3>{editingScheduleId === null ? "일정 등록" : "일정 수정"}</h3>
              <form className="stackForm" onSubmit={handleScheduleSubmit}>
                <label>
                  구성원
                  <select value={scheduleForm.member_id} onChange={(event) => setScheduleForm({ ...scheduleForm, member_id: event.target.value })}>
                    <option value="">미배정</option>
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
                  제목
                  <input value={scheduleForm.title} onChange={(event) => setScheduleForm({ ...scheduleForm, title: event.target.value })} required />
                </label>
                <label>
                  유형
                  <input
                    value={scheduleForm.schedule_type}
                    onChange={(event) => setScheduleForm({ ...scheduleForm, schedule_type: event.target.value })}
                    placeholder="예: 일반, 휴가, 출장, 근무"
                  />
                </label>
                <label>
                  시작 시간
                  <input type="datetime-local" value={scheduleForm.starts_at} onChange={(event) => setScheduleForm({ ...scheduleForm, starts_at: event.target.value })} required />
                </label>
                <label>
                  종료 시간
                  <input type="datetime-local" value={scheduleForm.ends_at} onChange={(event) => setScheduleForm({ ...scheduleForm, ends_at: event.target.value })} required />
                </label>
                <label>
                  장소
                  <input value={scheduleForm.location} onChange={(event) => setScheduleForm({ ...scheduleForm, location: event.target.value })} />
                </label>
                <label>
                  메모
                  <textarea value={scheduleForm.memo} onChange={(event) => setScheduleForm({ ...scheduleForm, memo: event.target.value })} rows={4} />
                </label>
                <div className="buttonRow">
                  <button type="submit" className="primaryButton">
                    {editingScheduleId === null ? "저장" : "수정"}
                  </button>
                  {editingScheduleId !== null ? (
                    <button type="button" className="ghostButton" onClick={resetScheduleForm}>
                      취소
                    </button>
                  ) : null}
                </div>
              </form>
            </section>

            <section className="panelCard">
              <h3>일정 목록</h3>
              <div className="filterBar">
                <input placeholder="일정 제목 검색" value={scheduleKeyword} onChange={(event) => setScheduleKeyword(event.target.value)} />
                <select value={memberFilterId} onChange={(event) => setMemberFilterId(event.target.value)}>
                  <option value="all">전체 구성원</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="ghostButton" onClick={refreshSchedules}>
                  적용
                </button>
              </div>
              <div className="tableWrap">
                <table className="dataTable">
                  <thead>
                    <tr>
                      <th>구성원</th>
                      <th>제목</th>
                      <th>기간</th>
                      <th>유형</th>
                      <th>작업</th>
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
                        <td>{formatScheduleTypeLabel(schedule.schedule_type)}</td>
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
                              수정
                            </button>
                            <button type="button" className="dangerButton" onClick={() => handleDeleteSchedule(schedule.id)}>
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {schedules.length === 0 ? (
                      <tr>
                        <td colSpan={5}>등록된 일정이 없습니다.</td>
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
              <div>
                <p className="sectionEyebrow">주간 뷰</p>
                <h3>주간 일정 보기</h3>
                <p className="calendarSubhead">{weekLabel}</p>
              </div>
              <div className="buttonRow">
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
                  이전
                </button>
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(new Date())}>
                  오늘
                </button>
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
                  다음
                </button>
              </div>
            </div>
            <div className="filterBar">
              <input placeholder="일정 제목 검색" value={scheduleKeyword} onChange={(event) => setScheduleKeyword(event.target.value)} />
              <select value={memberFilterId} onChange={(event) => setMemberFilterId(event.target.value)}>
                <option value="all">전체 구성원</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button type="button" className="ghostButton" onClick={refreshSchedules}>
                적용
              </button>
            </div>
            <div className="weekGrid">
              {weekDays.map((day) => {
                const key = formatDate(day);
                const items = schedulesByDay.get(key) ?? [];
                const dayLabel = day.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", weekday: "short" });
                const isToday = isSameDay(day, today);
                return (
                  <article key={key} className={isToday ? "dayColumn today" : "dayColumn"}>
                    <header className="dayColumnHeader">
                      <p>{dayLabel}</p>
                      <span>{items.length}건</span>
                    </header>
                    <ul>
                      {items.map((schedule) => (
                        <li
                          key={schedule.id}
                          className={`scheduleItem scheduleType-${normalizeScheduleTypeClass(schedule.schedule_type)}`}
                        >
                          <strong>{schedule.title}</strong>
                          <span>
                            {schedule.starts_at.slice(11, 16)} - {schedule.ends_at.slice(11, 16)}
                          </span>
                          <span>{resolveMemberName(schedule, members)}</span>
                        </li>
                      ))}
                      {items.length === 0 ? <li className="emptyCell">일정 없음</li> : null}
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
              <div>
                <p className="sectionEyebrow">월간 뷰</p>
                <h3>월간 일정 보기</h3>
                <p className="calendarSubhead">{monthLabel}</p>
              </div>
              <div className="buttonRow">
                <button
                  type="button"
                  className="ghostButton"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                >
                  이전
                </button>
                <button type="button" className="ghostButton" onClick={() => setSelectedDate(new Date())}>
                  오늘
                </button>
                <button
                  type="button"
                  className="ghostButton"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                >
                  다음
                </button>
              </div>
            </div>
            <div className="filterBar">
              <input placeholder="일정 제목 검색" value={scheduleKeyword} onChange={(event) => setScheduleKeyword(event.target.value)} />
              <select value={memberFilterId} onChange={(event) => setMemberFilterId(event.target.value)}>
                <option value="all">전체 구성원</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button type="button" className="ghostButton" onClick={refreshSchedules}>
                적용
              </button>
            </div>

            <div className="monthGrid">
              {monthDays.map((day) => {
                const key = formatDate(day);
                const items = schedulesByDay.get(key) ?? [];
                const inCurrentMonth = day.getMonth() === selectedDate.getMonth();
                const isToday = isSameDay(day, today);
                return (
                  <article key={key} className={inCurrentMonth ? (isToday ? "monthCell today" : "monthCell") : "monthCell muted"}>
                    <header className="monthCellHeader">
                      <strong>{day.getDate()}</strong>
                      <span>{items.length}건</span>
                    </header>
                    <ul>
                      {items.slice(0, 3).map((schedule) => (
                        <li
                          key={schedule.id}
                          className={`scheduleItem scheduleType-${normalizeScheduleTypeClass(schedule.schedule_type)}`}
                        >
                          <strong>{schedule.title}</strong>
                          <span>{schedule.starts_at.slice(11, 16)}</span>
                        </li>
                      ))}
                      {items.length > 3 ? <li className="moreItem">+{items.length - 3}건 더 있음</li> : null}
                      {items.length === 0 ? <li className="emptyCell">일정 없음</li> : null}
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
