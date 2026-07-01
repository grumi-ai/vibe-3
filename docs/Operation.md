# 공공직군 행정업무 슈퍼앱 Operation

## 1. 현재 운영 상태

현재 프로젝트는 초기 구성 단계이다.

- 프론트엔드 의존성 설치 완료
- 백엔드 `uv` 가상환경 생성 완료
- FastAPI 및 Uvicorn 설치 완료
- 실제 애플리케이션 코드는 아직 작성되지 않음
- SQLite CLI는 설치되어 있지 않지만 Python 내장 `sqlite3` 모듈 사용 가능

## 2. 환경 정보

### Frontend

- Node.js: `v24.18.0`
- npm: `11.16.0`
- React: `19.2.7`
- Vite: `8.1.2`
- TypeScript: `6.0.3`

### Backend

- uv: `0.11.25`
- Python: uv 관리 CPython `3.14.6`
- FastAPI: `0.138.2`
- Uvicorn: `0.49.0`

### Database

- SQLite: Python 내장 `sqlite3` 모듈 기준 `3.53.1`

## 3. 기본 실행 준비

### 3.1 프론트엔드

PowerShell 실행 정책 때문에 `npm` 대신 `npm.cmd`를 사용하는 것을 권장한다.

```powershell
cd C:\Users\admin\Desktop\day3_rpa\frontend
npm.cmd install
```

현재는 Vite 설정 파일과 React 진입 코드가 없으므로 `npm.cmd run dev` 실행 스크립트는 아직 구성되지 않았다.

### 3.2 백엔드

이 환경에서는 `uv` 기본 캐시 경로 접근 권한 문제가 발생할 수 있으므로 프로젝트 내부 캐시를 지정한다.

```powershell
$env:UV_CACHE_DIR='C:\Users\admin\Desktop\day3_rpa\.uv-cache'
cd C:\Users\admin\Desktop\day3_rpa\backend
uv venv
uv sync
```

가상환경 활성화가 필요한 경우:

```powershell
cd C:\Users\admin\Desktop\day3_rpa\backend
.\.venv\Scripts\activate
```

현재는 FastAPI 앱 진입 파일이 없으므로 `uvicorn app.main:app --reload`는 아직 실행할 수 없다.

## 4. 향후 실행 명령

실제 코드 작성 후 예상 실행 명령은 다음과 같다.

### Frontend

```powershell
cd C:\Users\admin\Desktop\day3_rpa\frontend
npm.cmd run dev
```

### Backend

```powershell
$env:UV_CACHE_DIR='C:\Users\admin\Desktop\day3_rpa\.uv-cache'
cd C:\Users\admin\Desktop\day3_rpa\backend
uv run uvicorn app.main:app --reload
```

### 예상 접속 주소

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Backend API 문서: `http://localhost:8000/docs`

## 5. 자주 발생하는 에러

### 5.1 PowerShell에서 `npm` 실행 실패

#### 증상

```text
이 시스템에서 스크립트를 실행할 수 없으므로 npm.ps1 파일을 로드할 수 없습니다.
```

#### 원인

PowerShell 실행 정책이 `.ps1` 스크립트 실행을 제한한다.

#### 해결

`npm` 대신 `npm.cmd`를 사용한다.

```powershell
npm.cmd install
```

### 5.2 `python --version` 실행 실패

#### 증상

```text
python.exe 프로그램을 실행하지 못했습니다.
```

#### 원인

PATH에 실제 Python이 아니라 Microsoft Store alias가 잡혀 있다.

#### 해결

이 프로젝트에서는 시스템 Python 대신 `uv`를 사용한다.

```powershell
uv run python --version
```

### 5.3 `uv` 캐시 접근 권한 오류

#### 증상

```text
Failed to initialize cache
액세스가 거부되었습니다.
```

#### 원인

기본 uv 캐시 디렉터리에 접근 권한 문제가 있다.

#### 해결

프로젝트 내부 캐시 경로를 지정한다.

```powershell
$env:UV_CACHE_DIR='C:\Users\admin\Desktop\day3_rpa\.uv-cache'
```

### 5.4 `sqlite3` 명령어 없음

#### 증상

```text
sqlite3 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다.
```

#### 원인

SQLite CLI가 PATH에 설치되어 있지 않다.

#### 해결

초기 개발은 Python 내장 `sqlite3` 모듈을 사용한다. CLI가 꼭 필요하면 별도 설치가 필요하다.

## 6. 사용법 초안

### 팀원 스케쥴 관리

1. 캘린더 화면에서 팀 전체 일정을 확인한다.
2. 일정 유형 또는 팀원으로 필터링한다.
3. 새 일정을 등록한다.
4. 기존 일정을 수정하거나 삭제한다.

### 엑셀 업무 자동화

1. 엑셀 파일을 업로드한다.
2. 분할 또는 병합 작업을 선택한다.
3. 분할 작업은 기준 컬럼을 선택한다.
4. 처리 결과 파일을 다운로드한다.

### 민원 대응 챗봇

1. 민원 매뉴얼을 업로드한다.
2. 민원 내용을 입력한다.
3. 대응 요약과 답변 초안을 확인한다.
4. 담당자가 최종 검토 후 실제 응대에 활용한다.

### 뉴스 기사 수집

1. 수집 키워드를 등록한다.
2. 매일 아침 자동 수집된 뉴스 목록을 확인한다.
3. 날짜 또는 키워드로 필터링한다.
4. 필요한 기사는 원문 링크로 이동한다.

## 7. 운영 원칙

- 민원 관련 데이터는 최소한으로 저장한다.
- 업로드 파일은 처리 후 삭제하는 정책을 기본으로 한다.
- 챗봇 답변은 담당자 검토용 초안으로만 사용한다.
- 뉴스 수집 기능은 각 수집원 이용약관과 정책을 준수해야 한다.
- SQLite DB 파일은 정기적으로 백업한다.

## 8. 백업 및 복구 초안

### 백업 대상

- SQLite DB 파일
- 민원 매뉴얼 원본 또는 추출 텍스트
- 운영 설정 파일

### 백업 주기

- MVP 단계: 매일 1회 로컬 또는 내부 저장소 백업
- 운영 단계: 업무 중요도에 따라 시간 단위 백업 검토

### 복구 절차

1. 서비스를 중지한다.
2. 기존 DB 파일을 별도 보관한다.
3. 백업 DB 파일을 지정 위치에 복사한다.
4. 서비스를 재시작한다.
5. 주요 화면과 API 응답을 확인한다.
