# scheduler.py
import schedule
import time
from cleanup import cleanup_expired_users

def run_scheduler():
    print("Starting scheduler...")
    schedule.every(1).minutes.do(cleanup_expired_users)
    while True:
        schedule.run_pending()
        time.sleep(1)
