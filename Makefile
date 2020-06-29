.PHONY: test e2e cypress dictionary kanjis names browser db deploy-landing-page docker-prod

test:
	docker-compose exec -T server ./node_modules/.bin/ts-node -r tsconfig-paths/register ./node_modules/jasmine/bin/jasmine --config=jasmine.json
e2e:
	./node_modules/.bin/cypress run --browser=firefox --headless

cypress:
	./node_modules/.bin/cypress open
browser:
	./node_modules/.bin/web-ext --config=web-ext.js run --firefox-profile ./firefox-profile --keep-profile-changes

dictionary:
	docker run -v ${PWD}:/app:delegated -w /app -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Dictionary.php
kanjis:
	docker run -v ${PWD}:/app:delegated -w /app -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Kanjis.php
names:
	docker run -v ${PWD}:/app:delegated -w /app -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Names.php

db:
	docker-compose exec database psql -h localhost -U test -d test

deploy-landing-page:
	# Does not work for now because the sftp of OVH does not allow SSH connexions
	# docker run -v ${PWD}:/app -w /app -it --rm instrumentisto/rsync-ssh rsync --port=21 -urv ./landing-page/ kanjimicak@ftp.cluster029.hosting.ovh.net:/home/kanjimicak/www --delete -vvv

docker-prod:
	docker build -t kanjimi-server -f ./docker/server/Dockerfile .
