# Gunicorn Configuration for JanSetu AI on Render (512MB RAM constraint)
import os

bind = "0.0.0.0:" + os.getenv("PORT", "5000")
workers = 1
threads = 2
timeout = 120
graceful_timeout = 30
max_requests = 100
max_requests_jitter = 15
worker_class = "gthread"
preload_app = False
