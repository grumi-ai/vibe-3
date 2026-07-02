# 공공직군 행정업무 슈퍼앱 기술 요구사항 및 구조

## 1. 기술 스택

- Frontend: React, TypeScript, Vite
- Backend: FastAPI, Python
- Database: SQLite
- Scheduler: APScheduler
- 뉴스 크롤링: requests, BeautifulSoup4

## 2. 전체 구조

```text
day3_rpa/
  frontend/
    src/
      app/
      pages/
      features/
      shared/
  backend/
    app/
      api/
        routes/
      core/
      crawlers/
      jobs/
      models/
      repositories/
      schemas/
      services/
      storage/
  docs/
```

## 3. 프론트엔드 모듈 역할

- `pages/DashboardPage.tsx`
  - 전체 화면의 통합 진입점
  - 연결 상태, 일정, 엑셀, 민원, 뉴스 섹션을 배치
- `features/team-schedule`
  - 구성원과 일정 CRUD
  - 주간/월간 캘린더 뷰
- `features/excel-automation`
  - 파일 업로드, 분할, 병합 UI
- `features/complaint-chatbot`
  - 민원 매뉴얼 업로드와 질문 기반 답변 초안 생성
- `features/news`
  - 정책 뉴스 수집 UI와 실행 이력 표시
- `shared/api`
  - 백엔드 호출 공통화
- `shared/components`
  - 연결 상태, 백엔드 URL 설정, 기능 스캐폴드

## 4. 백엔드 모듈 역할

- `api/routes`
  - HTTP 엔드포인트 등록
- `services`
  - 비즈니스 로직
- `repositories`
  - SQLite 접근과 CRUD
- `schemas`
  - 요청/응답 모델
- `core/database.py`
  - DB 초기화 및 마이그레이션 보정
- `jobs/scheduler.py`
  - 뉴스 수집 스케줄러
- `crawlers/korea_policy_briefing.py`
  - 정책 뉴스 수집기

## 5. 주요 데이터 모델

### members

- 구성원 기본 정보와 활성 상태를 저장한다.
- `phone`, `memo`, `is_active`, `created_at`, `updated_at`를 포함한다.

### schedules

- 구성원별 일정 정보를 저장한다.
- `member_id`는 선택값이며 미배정 일정도 허용한다.

### complaint_manuals

- 민원 매뉴얼 파일명과 추출 텍스트를 저장한다.
- 업로드 파일은 PDF, DOCX, TXT, MD, CSV, JSON, LOG를 우선 지원한다.

### complaint_chat_logs

- 질문과 생성된 답변 초안을 기록한다.

### news_articles / news_crawl_runs

- 뉴스 본문과 수집 실행 이력을 저장한다.

## 6. API 요약

### Health

- `GET /api/health`
- `GET /api/db/health`

### Team Schedule

- `GET /api/members`
- `POST /api/members`
- `PUT /api/members/{member_id}`
- `DELETE /api/members/{member_id}`
- `GET /api/schedules`
- `POST /api/schedules`
- `PUT /api/schedules/{schedule_id}`
- `DELETE /api/schedules/{schedule_id}`

### Excel Automation

- `POST /api/excel/upload`
- `POST /api/excel/split`
- `POST /api/excel/merge`
- `GET /api/excel/download/{file_id}`

### Complaint Chatbot

- `GET /api/complaints/manuals`
- `POST /api/complaints/manuals`
- `POST /api/complaints/manuals/upload`
- `POST /api/complaints/chat`

### News

- `GET /api/news`
- `POST /api/news/collect`
- `GET /api/news/crawl-runs`
- `GET /api/news/keywords`

## 7. 동작 흐름

1. 프론트엔드가 공통 API 클라이언트를 통해 백엔드에 요청한다.
2. 백엔드는 서비스 레이어에서 입력 검증과 비즈니스 로직을 수행한다.
3. 레포지토리가 SQLite에 읽기/쓰기 작업을 처리한다.
4. 결과는 JSON 또는 다운로드 파일로 프론트엔드에 반환된다.

## 8. 설계 의도

- 스캐폴드 단계에서 기능을 모듈 단위로 분리해 후속 확장을 쉽게 한다.
- SQLite 기반 로컬 MVP로 시작하되, DB 교체가 가능하도록 계층을 나눴다.
- 민원 챗봇은 초기에는 매뉴얼 검색 기반 응답으로 구현하고, 추후 LLM 연동으로 확장 가능하다.
