FROM node:10.16.3
MAINTAINER Bronson Oka <boka@slickage.com>

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN yarn && yarn cache clean --force

COPY . /usr/src/app

CMD until node cli connect; do sleep 1; done; npm run serve
EXPOSE 8080
