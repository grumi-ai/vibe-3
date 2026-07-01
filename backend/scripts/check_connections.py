import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.main import create_app
from app.schemas.news import NewsCollectRequest
from app.schemas.schedule import ScheduleCreate
from app.services import news_service, schedule_service
from app.services.health_service import get_system_health


def main() -> None:
    app = create_app()
    health = get_system_health()
    schedule = schedule_service.create_schedule(
        ScheduleCreate(
            title="DB 연결 확인 일정",
            schedule_type="근무",
            starts_at="2026-07-01T09:00:00",
            ends_at="2026-07-01T18:00:00",
            memo="스캐폴드 점검용 데이터",
        )
    )
    news_result = news_service.collect_news(NewsCollectRequest().keywords)

    print("BE app:", app.title)
    print("FE-BE endpoint: /api/health")
    print("BE-DB status:", health["database"]["status"])
    print("SQLite version:", health["database"]["sqlite_version"])
    print("Database path:", health["database"]["database_path"])
    print("Schedule repository insert id:", schedule.id)
    print("News repository collected:", len(news_result["items"]))


if __name__ == "__main__":
    main()
