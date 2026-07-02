from app.services.health_service import get_system_health


def read_health() -> dict[str, object]:
    return get_system_health()


def read_database_health() -> dict[str, object]:
    return get_system_health()["database"]
