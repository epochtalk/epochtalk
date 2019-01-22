FROM node:10.15.0
MAINTAINER Bronson Oka <boka@slickage.com>

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN yarn && yarn cache clean --force
COPY modules/package.json /usr/src/app/modules/
RUN (cd ./modules && yarn)

RUN yarn add https://github.com/epochtalk/core-pg.git#bfd0a9ba58f651b7f37188ba87d61e9a4ec6373b


COPY . /usr/src/app

CMD until node cli connect; do sleep 1; done; npm run serve
EXPOSE 8080
