# 공공직군 행정업무 슈퍼앱 Architecture

## 1. 기술 스택

### Frontend

- TypeScript
- Vite
- React
- npm 패키지 관리

### Backend

- Python
- FastAPI
- uv 기반 가상환경 및 의존성 관리
- Uvicorn ASGI 서버

### Database

- SQLite

## 2. 현재 프로젝트 상태

```text
day3_rpa/
  frontend/
    package.json
    package-lock.json
    node_modules/
  backend/
    pyproject.toml
    uv.lock
    .venv/
  docs/
    PRD.md
    Architecture.md
    Operation.md
    index.html
```

현재는 의존성 설치와 문서화 단계이며, 실제 애플리케이션 코드는 아직 작성하지 않는다.

## 3. 권장 프로젝트 구조

```text
day3_rpa/
  frontend/
    src/
      app/
      pages/
      features/
        schedule/
        excel-automation/
        complaint-chatbot/
        news/
      shared/
        api/
        components/
        styles/
        types/
    public/
    package.json
    vite.config.ts
    tsconfig.json

  backend/
    app/
      main.py
      api/
        routes/
          schedules.py
          excel.py
          complaints.py
          news.py
      core/
        config.py
        database.py
      models/
      schemas/
      services/
        schedule_service.py
        excel_service.py
        complaint_service.py
        news_service.py
      repositories/
      jobs/
        news_collector.py
      storage/
        uploads/
        generated/
    tests/
    pyproject.toml
    uv.lock

  docs/
```

## 4. 모듈별 역할

### 4.1 Frontend 모듈

#### `features/schedule`

- 캘린더 UI
- 일정 등록, 수정, 삭제 폼
- 팀원 및 일정 유형 필터
- 일정 충돌 표시

#### `features/excel-automation`

- 파일 업로드 UI
- 컬럼 선택 UI
- 분할, 병합 실행 화면
- 처리 결과 다운로드 화면

#### `features/complaint-chatbot`

- 민원 내용 입력 UI
- 매뉴얼 첨부 UI
- 챗봇 답변 표시
- 검토 필요 사항 표시

#### `features/news`

- 수집 뉴스 목록
- 날짜, 키워드 필터
- 기사 링크 이동
- 요약 표시

#### `shared/api`

- FastAPI 백엔드와 통신하는 공통 API 클라이언트
- 에러 응답 공통 처리

#### `shared/components`

- 버튼, 입력창, 모달, 테이블, 파일 업로드 등 공통 UI 컴포넌트

### 4.2 Backend 모듈

#### `api/routes`

- HTTP 엔드포인트 정의
- 요청 검증과 응답 반환 담당
- 비즈니스 로직은 서비스 계층에 위임

#### `services`

- 핵심 업무 로직 담당
- 일정 관리, 엑셀 처리, 민원 답변 생성, 뉴스 수집 로직을 모듈별로 분리

#### `repositories`

- SQLite 데이터 접근 로직 담당
- SQL 또는 ORM 사용 시 DB 조작 코드를 이 계층에 집중

#### `schemas`

- Pydantic 기반 요청, 응답 DTO 정의
- API 입출력 타입 안정성 확보

#### `models`

- DB 테이블 구조 또는 도메인 모델 정의

#### `jobs`

- 정기 실행 작업 정의
- 뉴스 수집 배치 작업 담당

#### `storage`

- 업로드 파일과 생성 파일 저장
- 민원 매뉴얼, 엑셀 업로드 파일, 처리 결과 파일 등을 분리 저장

## 5. 데이터 설계 초안

### `members`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 팀원 ID |
| name | text | 이름 |
| department | text | 부서 |
| role | text | 역할 |
| created_at | datetime | 생성일 |

### `schedules`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 일정 ID |
| member_id | integer | 팀원 ID |
| title | text | 일정 제목 |
| schedule_type | text | 휴가, 근무, 출장, 교육, 기타 |
| starts_at | datetime | 시작 일시 |
| ends_at | datetime | 종료 일시 |
| location | text | 장소 |
| memo | text | 메모 |

### `complaint_manuals`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 매뉴얼 ID |
| filename | text | 파일명 |
| content_text | text | 추출 텍스트 |
| uploaded_at | datetime | 업로드 일시 |

### `complaint_chat_logs`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 로그 ID |
| question | text | 민원 내용 |
| answer | text | 답변 초안 |
| created_at | datetime | 생성일 |

### `news_articles`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 기사 ID |
| title | text | 제목 |
| source | text | 출처 |
| url | text | 기사 URL |
| summary | text | 요약 |
| keyword | text | 수집 키워드 |
| published_at | datetime | 게시일 |
| collected_at | datetime | 수집일 |

## 6. API 설계 초안

### Schedule

- `GET /api/schedules`: 일정 목록 조회
- `POST /api/schedules`: 일정 생성
- `GET /api/schedules/{schedule_id}`: 일정 상세 조회
- `PUT /api/schedules/{schedule_id}`: 일정 수정
- `DELETE /api/schedules/{schedule_id}`: 일정 삭제

### Excel Automation

- `POST /api/excel/split`: 엑셀 분할
- `POST /api/excel/merge`: 엑셀 병합
- `GET /api/excel/download/{file_id}`: 결과 파일 다운로드

### Complaint Chatbot

- `POST /api/complaints/manuals`: 매뉴얼 업로드
- `GET /api/complaints/manuals`: 매뉴얼 목록 조회
- `POST /api/complaints/chat`: 민원 답변 초안 생성

### News

- `GET /api/news`: 뉴스 목록 조회
- `POST /api/news/collect`: 뉴스 수동 수집 실행
- `GET /api/news/keywords`: 수집 키워드 조회

## 7. 처리 흐름

### 엑셀 분할

1. 사용자가 엑셀 파일과 기준 컬럼을 업로드한다.
2. 백엔드는 파일을 임시 저장한다.
3. 기준 컬럼의 고유값별로 데이터를 분리한다.
4. 결과 파일을 생성한다.
5. 사용자가 결과 파일을 다운로드한다.
6. 임시 파일은 보관 정책에 따라 삭제한다.

### 민원 챗봇

1. 사용자가 민원 매뉴얼을 업로드한다.
2. 백엔드는 문서에서 텍스트를 추출해 저장한다.
3. 사용자가 민원 내용을 입력한다.
4. 백엔드는 관련 매뉴얼 문구를 검색한다.
5. 답변 초안과 검토 필요 사항을 생성한다.
6. 사용자는 초안을 검토 후 실제 답변에 활용한다.

### 뉴스 수집

1. 스케줄러가 매일 아침 실행된다.
2. 등록된 키워드로 뉴스 데이터를 수집한다.
3. URL 또는 제목 기준으로 중복을 제거한다.
4. SQLite에 저장한다.
5. 프론트엔드는 날짜별 뉴스 목록을 조회한다.

## 8. 보안 및 개인정보 고려사항

- 민원 내용과 매뉴얼에는 개인정보가 포함될 수 있으므로 접근 권한을 제한해야 한다.
- 업로드 파일은 처리 목적 외 장기 보관하지 않는다.
- 챗봇 답변에는 공식 답변이 아니라 검토용 초안이라는 안내를 표시한다.
- 운영 환경에서는 CORS 허용 도메인을 제한한다.
- 내부망 배포 시에도 관리자 권한과 일반 사용자 권한을 분리하는 것이 좋다.

## 9. 확장성 고려사항

- SQLite는 MVP에 적합하지만 동시 접속자 증가 시 PostgreSQL로 전환 가능하도록 DB 접근 계층을 분리한다.
- 민원 챗봇은 초기에는 단순 검색 기반으로 시작하고, 이후 벡터 검색과 LLM 연동으로 확장한다.
- 뉴스 수집은 포털 검색 API, RSS, 기관 보도자료 API 등으로 수집원을 확장할 수 있게 한다.
- 파일 처리 작업이 오래 걸리면 백그라운드 작업 큐를 도입한다.
