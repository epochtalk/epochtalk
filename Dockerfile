# Latest Ubuntu LTS
FROM ubuntu:14.04
MAINTAINER James Wang <james@slickage.com>
RUN apt-get update && \
    apt-get install --no-install-recommends -y software-properties-common && \
    apt-add-repository ppa:ansible/ansible && \
    apt-get update && \
    apt-get install -y ansible

RUN echo '[local]\nlocalhost\n' > /etc/ansible/hosts

# Retrieve your playbooks.  Here we have them stored in a git repo
RUN mkdir /srv/epoch
WORKDIR /srv/epoch
ADD site.yml /srv/epoch/

RUN ansible-galaxy install debops.debops
RUN ansible-galaxy install debops.nodejs
RUN ansible-galaxy install debops.postgresql

