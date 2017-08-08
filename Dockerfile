FROM node:7.10.0
MAINTAINER Bronson Oka <boka@slickage.com>
RUN npm install -g bower

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install --log-level warn && npm cache clean --force
COPY modules/package.json /usr/src/app/modules/
RUN npm --prefix ./modules install --log-level warn
COPY bower.json /usr/src/app/
RUN bower install --allow-root

RUN npm install epochtalk-core-pg --log-level warn

COPY . /usr/src/app

CMD until node cli connect; do sleep 1; done; npm run serve
EXPOSE 8080
