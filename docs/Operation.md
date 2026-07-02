# 공공직군 행정업무 슈퍼앱 운영 문서

## 1. 실행 환경

- Windows PowerShell
- Node.js 및 npm
- Python 3.14 이상
- `uv`

## 2. 실행 방법

### 2.1 백엔드

```powershell
cd C:\Users\admin\Desktop\day3_rpa\backend
uv sync
uv run uvicorn app.main:app --reload
```

### 2.2 프론트엔드

```powershell
cd C:\Users\admin\Desktop\day3_rpa\frontend
npm.cmd install
npm.cmd run dev
```

## 3. 접속 주소

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## 4. 기능 사용법

### 4.1 팀원 스케줄 관리

1. 구성원을 먼저 등록한다.
2. 일정을 등록하고 구성원을 연결한다.
3. 주간 뷰와 월간 뷰에서 일정을 확인한다.
4. 필요하면 구성원을 수정하거나 비활성화한다.

### 4.2 엑셀 업무 자동화

1. 파일 선택 후 업로드 버튼으로 `backend/app/storage/uploads`에 저장한다.
2. 분할할 파일명과 기준 컬럼명을 입력한다.
3. 병합할 파일명을 줄바꿈 또는 쉼표로 입력한다.
4. 생성된 결과 파일은 다운로드 링크로 확인한다.

### 4.3 민원 대응 챗봇

1. PDF, DOCX, TXT, MD, CSV, JSON, LOG 형식의 민원 매뉴얼 파일을 업로드한다.
2. 민원 질문을 입력한다.
3. 요약, 응답 스크립트, 체크리스트, 주의 문구를 확인한다.

### 4.4 뉴스 기사 수집

1. 대상 날짜를 선택한다.
2. 수집 버튼으로 수동 수집을 실행한다.
3. 실행 이력과 저장된 기사 목록을 확인한다.

## 5. 자주 발생하는 오류

### 5.1 `npm` 실행 오류

#### 증상

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

#### 원인

PowerShell이 `npm.ps1` 실행을 차단한 경우다.

#### 해결

`npm` 대신 `npm.cmd`를 사용한다.

```powershell
npm.cmd install
```

### 5.2 `uv`를 찾을 수 없음

#### 증상

```text
uv: The term 'uv' is not recognized
```

#### 원인

`uv`가 설치되지 않았거나 PATH에 없다.

#### 해결

- `uv` 설치 여부를 확인한다.
- 필요하면 사용자 PATH에 `C:\Users\admin\.local\bin`을 추가한다.

### 5.3 SQLite DB 초기화 실패

#### 증상

- `/api/db/health`가 실패한다.
- DB 파일이 생성되지 않는다.

#### 원인

백엔드가 아직 한 번도 실행되지 않았거나 초기화 과정에서 중간에 실패했을 수 있다.

#### 해결

1. 백엔드를 다시 실행한다.
2. `/api/health`와 `/api/db/health`를 순서대로 확인한다.

### 5.4 FE-BE 연결 실패

#### 증상

- 화면에서 API 호출 실패 메시지가 보인다.

#### 원인

- 백엔드가 꺼져 있음
- CORS 설정 오류
- 프론트엔드 API base URL 설정 오류

#### 해결

1. 백엔드를 먼저 실행한다.
2. 프론트엔드의 API base URL을 확인한다.
3. 브라우저에서 `http://localhost:8000/api/health`를 직접 호출해 본다.

### 5.5 엑셀 작업 실패

#### 증상

- 파일을 찾을 수 없다는 오류가 나온다.
- 기준 컬럼을 찾지 못했다는 오류가 나온다.

#### 원인

- 입력 파일이 `backend/app/storage/uploads`에 없음
- 기준 컬럼명이 실제 헤더와 다름

#### 해결

1. 파일을 먼저 업로드한다.
2. CSV 또는 XLSX의 실제 헤더명을 확인한다.

### 5.6 민원 챗봇 응답이 빈약함

#### 증상

- 일반적인 안내만 나온다.

#### 원인

- 등록된 민원 매뉴얼이 부족함
- 질문과 매뉴얼의 키워드가 잘 맞지 않음

#### 해결

1. 매뉴얼 파일을 더 많이 업로드한다.
2. 파일명과 본문에 핵심 키워드를 넣는다.

## 6. 운영 체크리스트

- 백엔드 health endpoint 정상 응답
- SQLite health endpoint 정상 응답
- 구성원 CRUD 동작 확인
- 일정 CRUD 동작 확인
- 엑셀 업로드/분할/병합/다운로드 확인
- 민원 매뉴얼 업로드 및 챗봇 응답 확인
- 뉴스 수집 이력 확인
