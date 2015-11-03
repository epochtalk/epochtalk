# Dockerized instance of EpochTalk

## Quickstart example

1. Create the Docker EpockTalk instance:

  `docker build -t epochtalk . && docker run -d -P --name epochtalk epochtalk`

2. Wait until the build is finished by checking:

  `docker logs epochtalk`

3. Access the server by finding the right ip/port:

  `echo $(docker-machine ip default):$(docker port epochtalk 8080 | cut -f 2 -d :)`

## Dockumentation

* start up the thing

    * `docker build -t [image] . && docker run -d -P --name [container] [image]`

* stop the thing

    * `docker stop [contianer]`

    * `docker rm [container]`

    * `docker rmi [image]`

* full ip/port details

    * `echo $(docker-machine ip [machine]):$(docker port [container] 8080 | cut -f 2 -d :)`

* what ip is the server accessible from?

    * `docker-machine ip default`

* is the container running / what port is the server on?

    * `docker ps`

* is the server done loading up?

    * `docker logs [container]`
