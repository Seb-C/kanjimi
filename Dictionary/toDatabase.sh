#!/bin/sh

docker run -v "$PWD":/app -w /app --rm --network="host" -it $(docker build -q ./Dictionary) php ./Dictionary/toDatabase.php
