# 공공직군 행정업무 슈퍼앱 Operation

## 목차

- [1. 실행 전제](#1-실행-전제)
- [2. 실행 환경](#2-실행-환경)
- [3. 실행 방법](#3-실행-방법)
- [4. 접속 주소](#4-접속-주소)
- [5. 사용 방법](#5-사용-방법)
- [6. 자주 발생하는 에러](#6-자주-발생하는-에러)
- [7. 운영 점검](#7-운영-점검)
- [8. 배포 전 체크리스트](#8-배포-전-체크리스트)

## 1. 실행 전제

- Windows PowerShell 기준
- Node.js 및 npm 설치 필요
- Python 및 `uv` 설치 필요
- 프로젝트 루트는 `C:\Users\admin\Desktop\day3_rpa`

## 2. 실행 환경

### Frontend

- Vite dev server
- 기본 포트 `5173`

### Backend

- FastAPI
- Uvicorn
- 기본 포트 `8000`

### Database

- SQLite
- DB 파일은 `backend/data/app.db`

## 3. 실행 방법

### 3.1 Backend

```powershell
cd C:\Users\admin\Desktop\day3_rpa\backend
uv sync
uv run uvicorn app.main:app --reload
```

### 3.2 Frontend

```powershell
cd C:\Users\admin\Desktop\day3_rpa\frontend
npm.cmd install
npm.cmd run dev
```

## 4. 접속 주소

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## 5. 사용 방법

### 5.1 팀원 일정 관리

1. 팀원을 등록한다.
2. 일정을 등록한다.
3. 주간 뷰에서 이번 주 일정을 확인한다.
4. 월간 뷰에서 한 달 일정을 확인한다.
5. 팀원 검색과 일정 검색으로 필요한 데이터를 좁힌다.

### 5.2 엑셀 업무 자동화

1. 엑셀 파일을 업로드한다.
2. 기준 컬럼을 선택한다.
3. 분리 또는 병합 작업을 실행한다.
4. 결과 파일을 다운로드한다.

### 5.3 민원 대응 챗봇

1. 민원 매뉴얼 파일을 업로드한다.
2. 민원 질문을 입력한다.
3. 대응 초안을 확인한다.
4. 필요 시 추가 질문을 이어간다.

### 5.4 뉴스 기사 수집

1. 수집 키워드를 확인한다.
2. 최신 뉴스 목록을 조회한다.
3. 기사 링크를 통해 원문을 확인한다.
4. 정기 수집 작업 결과를 점검한다.

## 6. 자주 발생하는 에러

### 6.1 `npm` 실행 실패

#### 증상

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

#### 원인

PowerShell에서 `npm.ps1` 실행이 차단된 경우다.

#### 해결

`npm` 대신 `npm.cmd`를 사용한다.

```powershell
npm.cmd install
```

### 6.2 `uv` 명령이 동작하지 않음

#### 증상

```text
uv: The term 'uv' is not recognized
```

#### 원인

`uv`가 설치되지 않았거나 PATH에 없다.

#### 해결

- `uv` 설치 확인
- 필요 시 `C:\Users\admin\.local\bin`을 PATH에 추가

### 6.3 SQLite DB 파일 없음

#### 증상

- API 호출 시 DB 관련 오류 발생
- `backend/data/app.db`가 없거나 비어 있음

#### 원인

백엔드가 아직 실행되지 않았거나 DB 초기화가 안 된 경우다.

#### 해결

백엔드를 먼저 실행하고 `/api/db/health`를 확인한다.

### 6.4 FE-BE 연결 실패

#### 증상

- 프론트 화면에서 연결 실패 메시지 표시

#### 원인

- 백엔드가 꺼져 있음
- CORS 설정 문제
- 프록시 설정 문제

#### 해결

- 백엔드를 먼저 실행
- Vite 프록시 설정 확인
- `http://localhost:8000/api/health` 직접 호출 확인

## 7. 운영 점검

- 매일 아침 뉴스 수집 상태 확인
- 팀원 일정 데이터 백업 여부 확인
- 엑셀 파일 처리 실패 로그 확인
- 민원 챗봇의 업로드 파일 크기 및 형식 확인
- DB 파일을 정기적으로 백업

## 8. 배포 전 체크리스트

- 프론트 빌드 성공 여부 확인
- 백엔드 문법 오류 여부 확인
- DB 스키마 초기화 여부 확인
- 주요 API 응답 확인
- 화면 빈 상태와 오류 상태 확인
