FROM node:onbuild
MAINTAINER Bronson Oka <boka@slickage.com>
RUN npm install -g bower
RUN bower install --allow-root
RUN npm --prefix ./modules install
CMD npm run db-migrate && npm run serve
EXPOSE 8080
