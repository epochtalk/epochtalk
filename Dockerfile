FROM node:10.15.0
MAINTAINER Bronson Oka <boka@slickage.com>

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY modules/package.json /usr/src/app/modules/
RUN npm --prefix ./modules install

RUN npm install epochtalk-core-pg

COPY . /usr/src/app

CMD until node cli connect; do sleep 1; done; npm run serve
EXPOSE 8080
