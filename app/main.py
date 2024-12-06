# main.py
from multiprocessing import Process
from app import app
from scheduler import run_scheduler

if __name__ == "__main__":
    # Avvia API Flask
    flask_process = Process(target=app.run, kwargs={"debug": False, "use_reloader": False})
    
    # Avvia scheduler
    scheduler_process = Process(target=run_scheduler)
    
    flask_process.start()
    scheduler_process.start()
    
    flask_process.join()
    scheduler_process.join()
