#!/usr/bin/env bash

echo load .env
if [ -f .env ]
then
  export $(echo $(cat .env | xargs))
fi

echo git pull
git pull

echo docker compose --profile $SRV_PROFILE down
docker compose --profile $SRV_PROFILE down

echo docker compose --profile $SRV_PROFILE build app
docker compose --profile $SRV_PROFILE build app

echo docker compose --profile $SRV_PROFILE up -d
docker compose --profile $SRV_PROFILE up -d
