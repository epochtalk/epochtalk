* start up the thing

    * `docker build -t [image] . && docker run -d -P --name [container] [image]`

* stop the thing

    * `docker stop [contianer]`

    * `docker rm [container]`

    * `docker rmi [image]`

* what ip is the server accessible from?

    * `docker-machine ip default`

* is the container running / what port is the server on?

    * `docker ps`

* is the server done loading up?

    * `docker logs [container]`
