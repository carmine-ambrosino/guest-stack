# scheduler.py
import schedule
import time
from config import Config
from cleanup import cleanup_expired_users

def run_scheduler():
    print("Starting scheduler...")
    schedule.every(Config.TIME_SCHED).minutes.do(cleanup_expired_users)
    while True:
        schedule.run_pending()
        time.sleep(1)
