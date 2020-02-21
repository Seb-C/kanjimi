#!/bin/sh

docker run -v "$PWD":/app -w /app -it --init --rm --network="host" $(docker build -q ./Dictionary) php ./Dictionary/toCSV.php
