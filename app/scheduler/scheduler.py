import schedule
import time
import logging
from config import Config
from app.cleanup import cleanup_expired_users

def run_scheduler():
    logging.info("Scheduler started.")
    
    schedule.every(Config.TIME_SCHED).minutes.do(cleanup_expired_users)

    try:
        while True:
            schedule.run_pending()
            time.sleep(1)  # Loop frequency
    except KeyboardInterrupt:
        logging.info("Scheduler interrupted.")
    except Exception as e:
        logging.error(f"Scheduler error: {e}")
    finally:
        logging.info("Scheduler stopped.")
