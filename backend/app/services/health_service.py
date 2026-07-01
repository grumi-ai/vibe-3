from app.repositories.health_repository import check_database


def get_system_health() -> dict[str, object]:
    return {
        "service": "public-admin-super-app-api",
        "status": "ok",
        "database": check_database(),
    }
