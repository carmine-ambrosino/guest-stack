from multiprocessing import Process
import signal
import logging
import sys
from app.app import app
from config import Config
from scheduler.scheduler import run_scheduler

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def start_flask():
    logging.info("Starting Flask server...")
    app.run(debug=Config.DEBUG, host=Config.FLASK_HOST, port=Config.FLASK_PORT, use_reloader=Config.RELOADER)

def start_scheduler():
    logging.info("Starting scheduler...")
    run_scheduler()

def signal_handler(sig, frame):
    logging.info("Shutting down processes...")
    sys.exit(0)

if __name__ == "__main__":
    # Setting (Ctrl+C, kill)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Process
    flask_process = Process(target=start_flask)
    scheduler_process = Process(target=start_scheduler)

    flask_process.start()
    scheduler_process.start()

    try:
        flask_process.join()
        scheduler_process.join()
    except KeyboardInterrupt:
        logging.info("KeyboardInterrupt received. Exiting...")
        flask_process.terminate()
        scheduler_process.terminate()
