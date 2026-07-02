# 공공직군 행정업무 슈퍼앱 Architecture

## 목차

- [1. 기술 스택](#1-기술-스택)
- [2. 전체 구조](#2-전체-구조)
- [3. 모듈 역할](#3-모듈-역할)
- [4. 데이터 모델](#4-데이터-모델)
- [5. API 개요](#5-api-개요)
- [6. 설계 원칙](#6-설계-원칙)
- [7. 확장 방향](#7-확장-방향)

## 1. 기술 스택

### Frontend

- React
- TypeScript
- Vite
- 브라우저 상태 관리 및 화면 렌더링

### Backend

- Python
- FastAPI
- Uvicorn
- SQLite 연결 및 API 제공

### Database

- SQLite
- 단일 파일 기반 로컬 DB

## 2. 전체 구조

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
  docs/
```

## 3. 모듈 역할

### 3.1 Frontend

#### `pages`

- 화면 단위 진입점
- 대시보드 및 기능 페이지 조합

#### `features/team-schedule`

- 팀원 관리
- 일정 등록/수정/삭제
- 주간 뷰
- 월간 뷰
- 검색/필터

#### `features/excel-automation`

- 파일 업로드
- 컬럼 기준 분리/병합
- 결과 다운로드

#### `features/complaint-chatbot`

- 민원 매뉴얼 업로드
- 질문 입력
- 답변 초안 출력

#### `features/news`

- 뉴스 목록
- 키워드 필터
- 수집 상태 확인

#### `shared/api`

- 공통 API 호출 함수
- 헬스 체크 API

#### `shared/components`

- 공통 카드
- 상태 표시
- 공통 스캐폴드

#### `shared/utils`

- 날짜 계산
- 포맷 변환

### 3.2 Backend

#### `api/routes`

- HTTP 엔드포인트 정의
- 요청 라우팅
- 응답 반환

#### `services`

- 비즈니스 규칙 처리
- 저장소 호출 전후 로직 처리

#### `repositories`

- SQLite 쿼리 수행
- 데이터 CRUD 담당

#### `schemas`

- 요청/응답 데이터 모델
- Pydantic 기반 검증

#### `models`

- DB 스키마 정의

#### `jobs`

- 정기 실행 작업
- 뉴스 수집 같은 스케줄 작업

## 4. 데이터 모델

### members

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 팀원 ID |
| name | text | 이름 |
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
| member_id | integer | 팀원 ID |
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
| filename | text | 파일명 |
| content_text | text | 추출 텍스트 |
| uploaded_at | datetime | 업로드 시각 |

### complaint_chat_logs

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 로그 ID |
| question | text | 질문 |
| answer | text | 답변 |
| created_at | datetime | 생성 시각 |

### news_articles

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 기사 ID |
| title | text | 제목 |
| source | text | 출처 |
| url | text | 기사 링크 |
| summary | text | 요약 |
| keyword | text | 수집 키워드 |
| published_at | datetime | 게시 시각 |
| collected_at | datetime | 수집 시각 |

## 5. API 개요

### Health

- `GET /api/health`
- `GET /api/db/health`

### Team Schedule

- `GET /api/members`
- `POST /api/members`
- `GET /api/members/{member_id}`
- `PUT /api/members/{member_id}`
- `DELETE /api/members/{member_id}`
- `GET /api/schedules`
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

- `GET /api/news`
- `POST /api/news/collect`
- `GET /api/news/keywords`

## 6. 설계 원칙

- 프론트엔드는 화면과 상태 표현에 집중한다.
- 서비스 계층은 도메인 규칙을 담당한다.
- 저장소 계층은 DB 접근만 담당한다.
- 일정 조회는 날짜 범위를 기준으로 재사용한다.
- SQLite MVP에서 시작하되, 향후 PostgreSQL 전환 가능 구조를 유지한다.

## 7. 확장 방향

- 권한 관리 고도화
- 외부 캘린더 연동
- 뉴스 수집 키워드 관리 고도화
- 민원 챗봇의 검색형과 생성형 분리 강화
- PostgreSQL 및 Docker 전환
