.PHONY: build up down restart logs status clean

# Build Docker images
build:
	docker-compose build --no-cache

# Start containers in detached mode
up:
	docker-compose up -d

# Stop and remove containers
down:
	docker-compose down

# Show logs for both services
logs:
	docker-compose logs -f

# Restart (down then up)
restart: down up

# Clean up
clean:
	docker-compose down -v --rmi all

# Status
status:
	docker-compose ps