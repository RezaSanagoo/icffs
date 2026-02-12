.PHONY: help migrate makemigrations runserver test shell createsuperuser

help:
	@echo "Available commands:"
	@echo "  make migrate          - Run database migrations"
	@echo "  make makemigrations   - Create migration files"
	@echo "  make runserver        - Run development server"
	@echo "  make test             - Run tests"
	@echo "  make shell            - Open Django shell"
	@echo "  make createsuperuser  - Create admin user"

migrate:
	python manage.py migrate

makemigrations:
	python manage.py makemigrations

runserver:
	python manage.py runserver

test:
	python manage.py test

shell:
	python manage.py shell

createsuperuser:
	python manage.py createsuperuser

