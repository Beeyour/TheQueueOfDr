.PHONY: build up down restart logs status clean

build:
	docker-compose build --no-cache

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose down && docker-compose up -d

logs:
	docker-compose logs -f

status:
	docker-compose ps

clean:
	docker-compose down -v --rmi all