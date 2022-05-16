#!/usr/bin/env bash

if [ ! -f .env ]
then
  export $(cat .env | xargs)
fi

git pull

docker-compose down
docker-compose build app
docker-compose --profile $SRV_PROFILE up -d
