.PHONY: migrate test e2e cypress lint dictionary kanjis names browser db

migrate:
	docker-compose exec server ./node_modules/.bin/ts-node -r tsconfig-paths/register ./src/Server/migrate.ts
test:
	docker-compose exec server ./node_modules/.bin/ts-node -r tsconfig-paths/register ./node_modules/jasmine/bin/jasmine --config=jasmine.json
e2e:
	./node_modules/.bin/cypress run --browser=firefox --headless
cypress:
	./node_modules/.bin/cypress open
lint:
	docker-compose exec server ./node_modules/.bin/tslint './src/*.ts' './tests/*.ts'
dictionary:
	docker run -v ${PWD}:/app -w /app -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Dictionary.php
kanjis:
	docker run -v ${PWD}:/app -w /app -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Kanjis.php
names:
	docker run -v ${PWD}:/app -w /app -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Names.php
browser:
	./node_modules/.bin/web-ext --config=web-ext.js run --firefox-profile ./firefox-profile --keep-profile-changes
db:
	docker-compose exec database psql -h localhost -U test -d test
