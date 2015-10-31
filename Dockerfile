from debian:jessie
MAINTAINER boka <boka@slickage.com>

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# update/upgrade and install basic deps
RUN apt-get -y update \
  && apt-get -y upgrade \
  && apt-get -y install \
    build-essential \
    curl \
    git \
    libpq-dev \
    postgresql \
    postgresql-contrib \
    python \
    redis-server \
    ruby \
  && gem install foreman

ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 0.12.2

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash \
  && source $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default

ENV NODE_PATH $NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# install bower
RUN npm install -g bower

# set up postgres
USER postgres

RUN /etc/init.d/postgresql start \
  && psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" \
  && createdb -O docker docker

USER root

# Adjust PostgreSQL configuration so that remote connections to the
# database are possible. 
RUN echo "host all  all    0.0.0.0/0  md5" >> /etc/postgresql/9.4/main/pg_hba.conf

# And add ``listen_addresses`` to ``/etc/postgresql/9.3/main/postgresql.conf``
RUN echo "listen_addresses='*'" >> /etc/postgresql/9.4/main/postgresql.conf

# get the epochtalk project and configure .env
RUN git clone https://github.com/epochtalk/epochtalk.git \
  && cd epochtalk \
  && cp example.env .env \
  && echo "DATABASE_URL=\"postgres://docker:docker@localhost:5432/docker\"" >> .env \
  && echo "HOST=0.0.0.0" >> .env \
  && npm install

EXPOSE 8080

ENTRYPOINT /etc/init.d/postgresql start \
  && service redis-server start \
  && sleep 1 \
  && redis-cli ping \
  && cd epochtalk \
  && cat .env \
  && bower install --allow-root \
  && foreman start build \
  && foreman start initialize \
  && foreman start server
