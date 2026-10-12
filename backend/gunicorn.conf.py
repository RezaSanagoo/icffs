"""Gunicorn configuration for the Django backend."""

# The deployment runner loads this file without always passing an app URI.
# Setting wsgi_app prevents Gunicorn from falling back to the invalid ':application'.
wsgi_app = "config.wsgi:application"
chdir = "/app"
bind = "0.0.0.0:8000"
workers = 1
threads = 2
timeout = 120
