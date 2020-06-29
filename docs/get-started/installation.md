---
title: Installation
---
<!-- change the title to Using in using.md -->
# Installation

Getting started is easy, first make sure you have the system dependencies installed!

### System Dependencies
* [node](http://nodejs.org)
* [yarn](https://yarnpkg.com)
* [Postgres](http://www.postgresql.org/)
* [Redis](http://redis.io/)
* [Nginx](https://nginx.org/en/docs/)

#### 1) Checkout repository using git:
```sh
$ git clone git@github.com:epochtalk/epochtalk.git
```

### 2) SSL and Nginx setup

Install an SSL cert and edit the nginx .conf file (located /etc/nginx/default.conf) with server info and SSL cert info

#### 3) Change directories and install dependencies using [yarn](https://yarnpkg.com)
```sh
$ cd epochtalk
$ yarn
```

#### 4) Copy the example.env file
This file specifies the server configurations and is necessary to run the
server.  You can edit the .env file later to specify the configurations as
outlined in the Configuration section.

```sh
$ cd .. # cd back to project root
$ cp example.env .env
```

#### 5) Checkout and Run Migrations
**Note**: If you do not have brew installed, you must manually install [Elixir](https://elixir-lang.org/install.html)
```sh
$ cd .. # (or just change directories outside of the epochtalk directory)
$ brew install elixir # this installs elixir so we can run epoch migrations
$ git clone git@github.com:epochtalk/epoch.git
$ cd epoch
$ mix deps.get # install project deps
$ mix ecto.setup # create and migrate epochtalk database
$ cd ../epochtalk # change directories back to epochtalk root
```

#### 6) Initialize First User
First ensure that [Postgres](http://www.postgresql.org/) is installed and running. Before running Epochtalk for the first time, it is necessary to setup the database and first user account. The CLI tool will create the first board and admin account for the forum. From the root directory of the project run the following command:
```sh
$ node cli --create
```

#### 7) Start the Epochtalk server
Running the `npm run serve` command will start the Epochtalk webserver and compile all JavaScript and css. Once the server is running, the forum can be viewed at `http://localhost:8080`
```sh
$ yarn run serve
```

#### 8) Log in and change admin account information
Login to the admin account using the username ``admin`` and password ``admin1234``. Visit your profile by clicking the link in the top right corner of the page, then change your username and password.
