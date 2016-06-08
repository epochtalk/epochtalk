FROM node:5-onbuild
MAINTAINER boka <boka@slickage.com>
RUN npm update epochtalk-core-pg
RUN npm install -g bower
RUN bower install --allow-root
CMD npm run db-migrate && npm --prefix ./modules upgrade && npm run serve
EXPOSE 8080
