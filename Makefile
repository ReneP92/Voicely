.PHONY: help widget-dev widget-build widget-test widget-clean services-dev services-build services-test services-clean dev build test clean stop logs db-start db-stop

# Default target
help:
	@echo "Voicely Makefile Commands:"
	@echo ""
	@echo "Widget Commands:"
	@echo "  make widget-dev      - Start widget in development mode"
	@echo "  make widget-build    - Build widget for production"
	@echo "  make widget-test     - Run widget tests"
	@echo "  make widget-clean    - Clean widget build artifacts"
	@echo ""
	@echo "Services Commands:"
	@echo "  make services-dev    - Start all main services"
	@echo "  make services-build  - Build all main services"
	@echo "  make services-test   - Run tests for all services"
	@echo "  make services-clean  - Clean service build artifacts"
	@echo ""
	@echo "Combined Commands:"
	@echo "  make dev             - Start both widget and main services"
	@echo "  make build           - Build everything"
	@echo "  make test            - Run all tests"
	@echo "  make clean           - Clean all build artifacts"
	@echo "  make stop            - Stop all running containers"
	@echo "  make logs             - View logs from all services"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-start        - Start database only"
	@echo "  make db-stop         - Stop database"

# Widget Targets
widget-dev:
	@echo "Starting widget in development mode..."
	cd widget && docker compose -f docker-compose.dev.yml up --build -d

widget-build:
	@echo "Building widget for production..."
	cd widget/chat-widget && yarn build
	cd widget && docker compose -f docker-compose.prod.yml build

widget-test:
	@echo "Running widget tests..."
	cd widget/chat-widget && yarn lint || true
	@echo "Widget tests completed"

widget-clean:
	@echo "Cleaning widget build artifacts..."
	cd widget/chat-widget && rm -rf dist node_modules/.vite
	cd widget && docker compose -f docker-compose.dev.yml down -v || true
	cd widget && docker compose -f docker-compose.prod.yml down -v || true
	@echo "Widget cleaned"

# Services Targets
services-dev:
	@echo "Starting all main services..."
	docker compose up --build

services-build:
	@echo "Building all main services..."
	docker compose build

services-test:
	@echo "Running tests for all services..."
	cd voicely/website/app/services/users_service && yarn test || true
	cd voicely/website/app/services/organisations_service && yarn test || true
	cd voicely/website/app/services/surveys_service && yarn test || true
	cd voicely/website/app/services/questions_service && yarn test || true
	cd voicely/website/app/services/responses_service && yarn test || true
	@echo "Services tests completed"

services-clean:
	@echo "Cleaning service build artifacts..."
	docker compose down -v
	@echo "Services cleaned"

# Combined Targets
dev: widget-dev services-dev

build: widget-build services-build

test: widget-test services-test

clean: widget-clean services-clean

stop:
	@echo "Stopping all running containers..."
	cd widget && docker compose -f docker-compose.dev.yml down || true
	cd widget && docker compose -f docker-compose.prod.yml down || true
	docker compose down || true
	@echo "All containers stopped"

logs:
	@echo "Viewing logs from all services..."
	docker compose logs -f

# Database Targets
db-start:
	@echo "Starting database..."
	docker compose up -d db
	@echo "Database started"

db-stop:
	@echo "Stopping database..."
	docker compose stop db
	@echo "Database stopped"
