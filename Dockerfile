FROM node:5-onbuild
MAINTAINER boka <boka@slickage.com>

# update/upgrade and install basic deps
RUN apt-get -y install redis-server
RUN npm install -g bower
RUN bower install --allow-root

# run the server
CMD service redis-server start \
  && npm run serve

EXPOSE 8080
