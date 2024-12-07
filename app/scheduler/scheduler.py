import schedule
import time
import logging
from config import Config
from backend.cleanup import cleanup_expired_users

def run_scheduler():
    """Funzione principale dello scheduler."""
    logging.info("Scheduler started.")
    
    # Registra i task periodici
    schedule.every(Config.TIME_SCHED).minutes.do(cleanup_expired_users)

    try:
        while True:
            schedule.run_pending()
            time.sleep(1)  # Frequenza del loop
    except KeyboardInterrupt:
        logging.info("Scheduler interrupted.")
    except Exception as e:
        logging.error(f"Scheduler error: {e}")
    finally:
        logging.info("Scheduler stopped.")
