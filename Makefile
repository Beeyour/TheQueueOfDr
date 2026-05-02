.PHONY: build up down logs restart clean

# Build Docker images
build:
	docker-compose build

# Start containers in detached mode
up:
	docker-compose up -d

# Stop and remove containers
down:
	docker-compose down

# Show logs for both services
logs:
	docker-compose logs -f

# Show logs for backend only
logs-backend:
	docker-compose logs -f backend

# Show logs for frontend only
logs-frontend:
	docker-compose logs -f frontend

# Restart (down then up)
restart: down up

# Clean up (remove containers, images, and volumes)
clean:
	docker-compose down -v --rmi all

# Status
status:
	docker-compose ps
