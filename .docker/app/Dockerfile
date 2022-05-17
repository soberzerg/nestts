FROM node:16

RUN apt-get update && apt-get install -y yarn

COPY . /var/www/

WORKDIR /var/www

RUN cd /var/www && yarn && yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]