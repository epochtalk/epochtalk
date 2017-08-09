# Dockerized instance of EpochTalk

## Docker Compose

The `docker-compose` deployment contains resources for:  Postgres, Redis, and
[Epoch](https://github.com/epochtalk/epoch).  The recipe for installation is
contained in the [docker-compose.yml](./docker-compose.yml) file

### Configuration

Create `docker.env` with whatever options you would like.

By default, `docker-compose` will expose port `8080` on the docker network.


### Bring up the EpochTalk service

`docker-compose up`

On the first run, this command will download and install containers for
dependencies, and build the EpochTalk image. Because of this, it will take a bit
longer to start.  Subsequent startups should be quicker.

This command currently runs in the foreground.  To exit, use `Ctrl+C`.

**If there are changes to the project, you should build the image again
before running. (See `Building the EpochTalk Image`)**


### Building the EpochTalk Image

`docker-compose build`

Builds the `epochtalk` image.  This must be done in order to include any new
changes to the project in the `epochtalk` image.

**You must stop and remove the EpochTalk service before running `docker-compose
up` again.  Otherwise, the old container (with the old image) will be used
again.**


### Stop and remove the EpochTalk service

`docker-compose down`

Stops all services and removes the stopped containers.  This allows you to use a
new image if you built one.
