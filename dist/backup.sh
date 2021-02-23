#!/bin/bash

set -e

s3cmd sync --no-preserve --skip-existing s3://kanjimi-storage/ ./dist/backup/
