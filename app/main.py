from multiprocessing import Process
import signal
import logging
import sys
from app.app import app
from config import Config
from scheduler.scheduler import run_scheduler

# Configura il logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def start_flask():
    """Avvia il server Flask."""
    logging.info("Starting Flask server...")
    app.run(debug=Config.DEBUG, host=Config.FLASK_HOST, port=Config.FLASK_PORT, use_reloader=Config.RELOADER)

def start_scheduler():
    """Avvia lo scheduler."""
    logging.info("Starting scheduler...")
    run_scheduler()

def signal_handler(sig, frame):
    """Gestione dei segnali per terminare i processi."""
    logging.info("Shutting down processes...")
    sys.exit(0)

if __name__ == "__main__":
    # Imposta i segnali di terminazione (Ctrl+C, kill)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Processi per Flask e Scheduler
    flask_process = Process(target=start_flask)
    scheduler_process = Process(target=start_scheduler)

    # Avvio dei processi
    flask_process.start()
    scheduler_process.start()

    # Attendi la terminazione dei processi
    try:
        flask_process.join()
        scheduler_process.join()
    except KeyboardInterrupt:
        logging.info("KeyboardInterrupt received. Exiting...")
        flask_process.terminate()
        scheduler_process.terminate()
