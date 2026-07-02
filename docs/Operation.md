# 공공직군 행정업무 슈퍼앱 운영 문서

## 1. 실행 전 준비

- Windows PowerShell
- Node.js 및 npm
- Python 3.14 이상
- `uv`

## 2. 로컬 실행

### 2.1 Backend

```powershell
cd C:\Users\admin\Desktop\day3_rpa\backend
uv sync
uv run uvicorn app.main:app --reload
```

### 2.2 Frontend

```powershell
cd C:\Users\admin\Desktop\day3_rpa\frontend
npm.cmd install
npm.cmd run dev
```

## 3. 접속 주소

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## 4. 주요 사용 방법

### 4.1 팀원 일정 관리

1. 팀원을 먼저 등록한다.
2. 일정을 등록하고 담당 팀원을 연결한다.
3. 주간 뷰에서 표 형식으로 일정을 확인한다.
4. 월간 뷰에서 달력 형식으로 일정을 확인한다.
5. 필요하면 팀원 또는 키워드로 필터링한다.

### 4.2 엑셀 업무 자동화

1. 엑셀 또는 CSV 파일을 업로드한다.
2. 분리 또는 병합 기준 컬럼을 선택한다.
3. 결과 파일을 다운로드한다.

### 4.3 민원 대응 챗봇

1. 민원 매뉴얼 파일을 업로드한다.
2. 민원 상황을 질문으로 입력한다.
3. 생성된 응대 문구와 스크립트를 확인한다.

### 4.4 뉴스 기사 수집

1. 자동 수집 상태를 확인한다.
2. 필요 시 수동 수집을 실행한다.
3. 기사 목록과 키워드, 수집 이력을 확인한다.

## 5. 자주 발생하는 에러

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

백엔드가 아직 실행되지 않았거나 초기화가 중간에 실패했다.

#### 해결

1. 백엔드를 먼저 실행한다.
2. `/api/health`와 `/api/db/health`를 순서대로 확인한다.

### 5.4 FE-BE 연결 실패

#### 증상

- 화면에서 API 호출 실패 메시지가 보인다.

#### 원인

- 백엔드가 꺼져 있음
- CORS 설정 오류
- 프론트 API base URL 설정 오류

#### 해결

1. 백엔드를 먼저 실행한다.
2. 프론트의 API base URL을 확인한다.
3. 브라우저에서 `http://localhost:8000/api/health`를 직접 호출해 본다.

## 6. 운영 체크리스트

- 백엔드 health endpoint 정상 응답
- SQLite health endpoint 정상 응답
- 팀원 CRUD 동작 확인
- 일정 CRUD 동작 확인
- 주간/월간 뷰 렌더링 확인
- 엑셀 업로드/처리 응답 확인
- 민원 매뉴얼 업로드 및 질의응답 확인
- 뉴스 수집 이력 확인

