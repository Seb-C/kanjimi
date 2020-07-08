.PHONY: test e2e cypress dictionary kanjis kanjisvgs names browser db extension deploy

test:
	docker-compose exec -T --env NODE_TLS_REJECT_UNAUTHORIZED="0" server ./node_modules/.bin/ts-node -r tsconfig-paths/register ./node_modules/jasmine/bin/jasmine --config=jasmine.json

e2e:
	./node_modules/.bin/cypress run --browser=firefox --headless

cypress:
	./node_modules/.bin/cypress open
browser:
	./node_modules/.bin/web-ext --config=web-ext.js run --firefox-profile ./.firefox-profile --keep-profile-changes

dictionary:
	docker run -v ${PWD}:/kanjimi:delegated -w /kanjimi -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Dictionary.php
kanjis:
	docker run -v ${PWD}:/kanjimi:delegated -w /kanjimi -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Kanjis.php
kanjisvgs:
	docker run -v ${PWD}:/kanjimi:delegated -w /kanjimi -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/KanjiSVGs.php
names:
	docker run -v ${PWD}:/kanjimi:delegated -w /kanjimi -it --init --rm --network=host $$(docker build -q ./Dictionary) php ./Dictionary/Names.php

db:
	docker-compose exec database psql -h localhost -U test -d test

extension:
	./src/Extension/build.sh
deploy:
	./dist/production/deploy.sh
