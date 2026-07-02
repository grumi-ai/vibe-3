from apscheduler.schedulers.background import BackgroundScheduler

from app.jobs.news_collector import run_daily_news_collection


def create_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone="Asia/Seoul")
    scheduler.add_job(
        run_daily_news_collection,
        "cron",
        hour=9,
        minute=0,
        id="daily_policy_news_collection",
        replace_existing=True,
        max_instances=1,
    )
    return scheduler
