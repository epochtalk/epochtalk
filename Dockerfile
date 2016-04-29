FROM node:5-onbuild
MAINTAINER boka <boka@slickage.com>
RUN npm install -g bower
RUN bower install --allow-root
CMD npm run db-migrate && npm run serve
EXPOSE 8080
