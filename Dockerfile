FROM node:5-onbuild
MAINTAINER boka <boka@slickage.com>

# update/upgrade and install basic deps
RUN apt-get -y install redis-server

# install bower
RUN npm install -g bower

# install bower dependencies
RUN bower install --allow-root

# install npm dependencies
RUN npm install

# run the server
CMD service redis-server start \
  && npm run serve

EXPOSE 8080
