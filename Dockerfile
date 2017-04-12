FROM node:onbuild
MAINTAINER Bronson Oka <boka@slickage.com>
RUN npm install -g bower
RUN bower install --allow-root
RUN npm --prefix ./modules install
RUN npm install epochtalk-core-pg
CMD npm run db-migrate && npm run serve
EXPOSE 8080
