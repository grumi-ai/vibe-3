from fastapi import FastAPI

from app.api.routes import complaints, excel, health, members, news, schedules


def register_routes(app: FastAPI) -> None:
    app.add_api_route("/api/health", health.read_health, methods=["GET"], tags=["health"])
    app.add_api_route("/api/db/health", health.read_database_health, methods=["GET"], tags=["health"])
    app.add_api_route("/api/members", members.list_members, methods=["GET"], tags=["members"])
    app.add_api_route("/api/members", members.create_member, methods=["POST"], tags=["members"])
    app.add_api_route("/api/members/{member_id}", members.get_member, methods=["GET"], tags=["members"])
    app.add_api_route("/api/members/{member_id}", members.update_member, methods=["PUT"], tags=["members"])
    app.add_api_route(
        "/api/members/{member_id}",
        members.delete_member,
        methods=["DELETE"],
        tags=["members"],
    )
    app.add_api_route("/api/schedules", schedules.list_schedules, methods=["GET"], tags=["schedules"])
    app.add_api_route("/api/schedules", schedules.create_schedule, methods=["POST"], tags=["schedules"])
    app.add_api_route(
        "/api/schedules/{schedule_id}",
        schedules.get_schedule,
        methods=["GET"],
        tags=["schedules"],
    )
    app.add_api_route(
        "/api/schedules/{schedule_id}",
        schedules.update_schedule,
        methods=["PUT"],
        tags=["schedules"],
    )
    app.add_api_route(
        "/api/schedules/{schedule_id}",
        schedules.delete_schedule,
        methods=["DELETE"],
        tags=["schedules"],
    )
    app.add_api_route("/api/excel/split", excel.split_excel, methods=["POST"], tags=["excel"])
    app.add_api_route("/api/excel/merge", excel.merge_excel, methods=["POST"], tags=["excel"])
    app.add_api_route(
        "/api/excel/download/{file_id}",
        excel.download_excel_result,
        methods=["GET"],
        tags=["excel"],
    )
    app.add_api_route(
        "/api/complaints/manuals",
        complaints.create_manual,
        methods=["POST"],
        tags=["complaints"],
    )
    app.add_api_route(
        "/api/complaints/manuals",
        complaints.list_manuals,
        methods=["GET"],
        tags=["complaints"],
    )
    app.add_api_route(
        "/api/complaints/chat",
        complaints.create_chat_response,
        methods=["POST"],
        tags=["complaints"],
    )
    app.add_api_route("/api/news", news.list_news, methods=["GET"], tags=["news"])
    app.add_api_route("/api/news/collect", news.collect_news, methods=["POST"], tags=["news"])
    app.add_api_route("/api/news/crawl-runs", news.list_crawl_runs, methods=["GET"], tags=["news"])
    app.add_api_route("/api/news/keywords", news.list_keywords, methods=["GET"], tags=["news"])
