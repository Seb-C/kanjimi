#!/bin/bash

set -e

s3cmd sync s3://kanjimi-storage ./dist/backup
