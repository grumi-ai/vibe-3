# 공공직군 행정업무 슈퍼앱 기술 아키텍처

## 1. 기술 스택

- Frontend: TypeScript + Vite + React
- Backend: Python + FastAPI
- Python 패키지 관리: `uv`
- Database: SQLite

## 2. 시스템 구조

```text
day3_rpa/
  frontend/
    src/
      app/
      pages/
      features/
        team-schedule/
        excel-automation/
        complaint-chatbot/
        news/
      shared/
        api/
        components/
        styles/
        utils/
  backend/
    app/
      api/
        routes/
      core/
      models/
      repositories/
      schemas/
      services/
      jobs/
      crawlers/
  docs/
```

## 3. 모듈 역할

### 3.1 Frontend

- `pages`: 전체 화면 조합, 대시보드, 통합 상태 확인
- `features/team-schedule`: 팀원 CRUD, 일정 CRUD, 주간/월간 뷰
- `features/excel-automation`: 파일 업로드, 분리/병합 UI
- `features/complaint-chatbot`: 매뉴얼 업로드, 질문 입력, 응답 표시
- `features/news`: 기사 목록, 수집 상태, 키워드 확인
- `shared/api`: 공통 API 클라이언트와 health 체크
- `shared/components`: 공통 카드, 상태 표시, 설정 패널
- `shared/utils`: 날짜 계산, 포맷 변환, 범위 계산

### 3.2 Backend

- `api/routes`: HTTP 엔드포인트 정의
- `services`: 비즈니스 로직 처리
- `repositories`: SQLite CRUD 및 조회 처리
- `schemas`: 요청/응답 모델 검증
- `models`: 테이블 스키마 정의
- `jobs`: 정기 수집, 스케줄 실행
- `crawlers`: 뉴스 원천 수집 로직

## 4. 데이터 모델

### members

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 팀원 ID |
| name | text | 이름 |
| department | text | 부서 |
| role | text | 역할 |
| phone | text | 연락처 |
| memo | text | 메모 |
| is_active | integer | 활성 여부 |
| created_at | datetime | 생성 시각 |
| updated_at | datetime | 수정 시각 |

### schedules

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 일정 ID |
| member_id | integer | 팀원 ID, 미지정 가능 |
| title | text | 일정 제목 |
| schedule_type | text | 휴가, 근무, 출장 등 |
| starts_at | datetime | 시작 시각 |
| ends_at | datetime | 종료 시각 |
| location | text | 장소 |
| memo | text | 메모 |

### complaint_manuals

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 매뉴얼 ID |
| filename | text | 원본 파일명 |
| content_text | text | 추출 텍스트 |
| uploaded_at | datetime | 업로드 시각 |

### complaint_chat_logs

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 로그 ID |
| question | text | 질문 |
| answer | text | 응답 |
| created_at | datetime | 생성 시각 |

### news_articles

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 기사 ID |
| title | text | 제목 |
| source | text | 출처 |
| agency | text | 기관 |
| url | text | 기사 링크 |
| summary | text | 요약 |
| content | text | 본문 또는 발췌 |
| keyword | text | 수집 키워드 |
| published_at | datetime | 게시 시각 |
| target_date | text | 수집 기준일 |
| collected_at | datetime | 수집 시각 |

### news_crawl_runs

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 실행 ID |
| target_date | text | 대상 날짜 |
| status | text | 성공/실패 상태 |
| total_count | integer | 총 수집 건수 |
| success_count | integer | 성공 건수 |
| failed_count | integer | 실패 건수 |
| error_message | text | 오류 메시지 |
| started_at | datetime | 시작 시각 |
| finished_at | datetime | 종료 시각 |

## 5. API 개요

### Health

- `GET /api/health`
- `GET /api/db/health`

### Team Schedule

- `GET /api/members?keyword=&isActive=`
- `POST /api/members`
- `GET /api/members/{member_id}`
- `PUT /api/members/{member_id}`
- `DELETE /api/members/{member_id}`
- `GET /api/schedules?start=&end=&memberId=&keyword=`
- `POST /api/schedules`
- `GET /api/schedules/{schedule_id}`
- `PUT /api/schedules/{schedule_id}`
- `DELETE /api/schedules/{schedule_id}`

### Excel Automation

- `POST /api/excel/split`
- `POST /api/excel/merge`
- `GET /api/excel/download/{file_id}`

### Complaint Chatbot

- `POST /api/complaints/manuals`
- `GET /api/complaints/manuals`
- `POST /api/complaints/chat`

### News

- `GET /api/news?targetDate=`
- `POST /api/news/collect`
- `GET /api/news/keywords`
- `GET /api/news/crawl-runs`

## 6. 데이터 흐름

1. 사용자가 FE에서 팀원 또는 일정 정보를 입력한다.
2. FE는 공통 API 클라이언트를 통해 FastAPI 엔드포인트를 호출한다.
3. 서비스 계층이 입력값 검증과 비즈니스 규칙을 처리한다.
4. 저장소 계층이 SQLite에 읽기/쓰기 작업을 수행한다.
5. 응답은 FE로 돌아가고, 화면은 즉시 갱신된다.

## 7. 운영 방향

- SQLite 기반 MVP로 시작한다.
- 저장 데이터가 늘어나면 PostgreSQL로 이전할 수 있도록 레이어를 분리한다.
- 뉴스 수집과 같은 배치성 작업은 `jobs` 계층에서 관리한다.
- FE-BE, BE-DB 점검용 health endpoint를 유지한다.
- 민원 챗봇은 추후 외부 LLM 연동으로 확장 가능하도록 인터페이스를 분리한다.

