# Epochtalk [![Circle CI](https://circleci.com/gh/epochtalk/epochtalk.svg?circle-token=:circle-token)](https://circleci.com/gh/epochtalk/epochtalk) [![Gitter chat](http://img.shields.io/badge/gitter-epochtalk%2Fepochtalk-1dce73.svg?style=flat)](https://gitter.im/epochtalk/epochtalk)

####**Warning this project is under active development, design is subject to change**

Next generation forum software. Epochtalk is a forum frontend designed to be paired with the [core-pg](https://github.com/epochtalk/core-pg) backend. Epochtalk forum software utilizes technologies such as [AngularJS](https://angularjs.org), [Webpack](https://webpack.github.io), [Postgres](https://github.com/postgres/postgres) and [Bourbon](http://bourbon.io/) for improved performance and user experience as compared to existing forum software.

![Epochtalk Forums](http://i.imgur.com/D2Lizk5.png)

## Index
* [Features](#features)
* [Dependencies](#dependencies)
  * [System](#system)
  * [Bower](#bower)
  * [NPM](#npm)
* [Installation](#installation)
* [Configuration](#configuration)
  * [Manual Configuration](#manual-configuration)
  * [Admin Panel Configuration](#admin-panel-configuration)
* [API](#api)
* [Editor](#editor)
  * [BBCode](#bbcode)
  * [Security](#security)
  * [Planned Features](#planned-features)
* [Contributions](#contributions)
* [Feedback](#feedback)
* [License](#license)

## Features
* Epochtalk is a single page web application created with [AngularJS](https://angularjs.org)
* Web/Mobile ready responsive design using [Bourbon](http://bourbon.io/)
* Code is bundled and loaded as needed, for performance, using [Webpack](https://webpack.github.io)
* Designed with performance in mind. Epochtalk's backend, [epochtalk-core-pg](https://github.com/epochtalk/core-pg), utilizes [Postgres](http://www.postgresql.org/) as a database.
* Customizable Theming (Branding, coloring, fonts, sizes)
* Fully modular permissions system with roles

## Dependencies
### System
* [node](http://nodejs.org)
* [npm](https://www.npmjs.org/doc/README.html) (pre-packaged with node)
* [bower](https://github.com/bower/bower)
* [Postgres](http://www.postgresql.org/)
* [Redis](http://redis.io/)

### Bower
* angular `1.4.4`
* angular-resource `1.4.4`
* angular-sanitize `1.4.4`
* angular-animate `1.4.4`
* angular-loading-bar `0.7.1`
* nestable [slickage/Nestable](http://github.com/slickage/Nestable)
* angular-ui-router `~0.2.15`
* angular-sortable-view" `~0.0.13`
* ng-tags-input `3.0.0`
* jquery `~2.1.4`

### NPM
* aws-sdk `^2.1.20`
* bcrypt `^0.8.0`
* bluebird `^3.1.5`
* boom `^3.1.2`
* bower `^1.7.5`
* change-case `^2.3.1`
* cheerio `^0.19.0`
* commander `^2.5.1`
* db-migrate `^0.9.23`
* deep-rename-keys `^0.1.0`
* del `^2.2.0`
* dot `^1.0.3`
* dotenv `^2.0.0`
* epochtalk-core-pg `epochtalk/core-pg`
* fs-extra `^0.26.4`
* good `^6.4.0`
* good-console `^5.3.0`
* good-file `^5.1.1`
* handlebars `^4.0.3`
* hapi `^12.1.0`
* hoek `^3.0.4`
* html-loader `^0.4.0`
* ip-address `^5.0.2`
* joi `^7.2.2`
* json `^9.0.3`
* jsonwebtoken `^5.0.0`
* lodash `^4.0.1`
* mkdirp `^0.5.0`
* mmmagic `^0.4.1`
* node-sass `^3.4.2`
* node-uuid `^1.4.1`
* nodemailer `^2.0.0`
* oclazyload `^1.0.6`
* pg `^4.2.0`
* redis `^2.4.2`
* request `^2.53.0`
* rolling-rate-limiter `^0.1.2`
* sanitize-html `^1.4.3`
* stream-meter `^1.0.3`
* through2 `^2.0.0`
* vision `^4.0.1`
* webpack `^1.12.2`


## Installation

#### 1) Checkout repository using git:
```sh
$ git clone git@github.com:epochtalk/epochtalk.git
```

#### 2) Change directories and install dependencies using [npm](https://www.npmjs.org/doc/README.html)
```sh
$ cd epochtalk
$ npm install
```

#### 3) Copy the example.env file
This file specifies the server configurations and is necessary to run the
server.  You can edit the .env file later to specify the configurations as
outlined in the Configuration section.

```sh
$ cp example.env .env
```

#### 4) Install frontend dependencies using [bower](https://github.com/bower/bower)
```sh
$ bower install
```

#### 5) Initialize
First ensure that [Postgres](http://www.postgresql.org/) is installed andrunning. Before running Epochtalk for the first time, it is necessary to setup the database and first user account. The CLI tool will create the first board and admin account for the fourm. From the root directory of the project run the following command:
```sh
$ node cli --create
```

#### 6) Start the Epochtalk server
Running the `npm run serve` command will start the Epochtalk webserver and compile all JavaScript and css. Once the server is running, the forum can be viewed at `http://localhost:8080`
```sh
$ npm run serve
```

#### 7) Log in and change admin account information
Login to the admin account using the username ``admin`` and password ``admin1234``. Visit your profile by clicking the link in the top right corner of the page, then change your username and password.

### Trouble Shooting
Since both [Epochtalk](https://github.com/epochtalk/epochtalk) and [core-pg](https://github.com/epochtalk/core-pg) are actively being developed, the database migrations can become out of sync. To resolve this you can checkout [core-pg](https://github.com/epochtalk/core-pg) and then from within the root directory of core-pg, you can run ``npm link``. Change directories into the ``node_modules`` of your checked out [Epochtalk](https://github.com/epochtalk/epochtalk) project and run ``npm link epochtalk-core-pg``. This will ensure that [Epochtalk](https://github.com/epochtalk/epochtalk) is using the latest master of [core-pg](https://github.com/epochtalk/core-pg) instead of the npm version. Then run ``npm run db-migrate`` from the root directory of your [Epochtalk](https://github.com/epochtalk/epochtalk) project to ensure all migrations are up to date.

## Configuration
Forum configurations can be set either manually or using the admin panel.

### Manual Configuration
The forum server configs can and must be set manually with a `.env` file in the root directory of the project.
```sh
DATABASE_URL="postgres://localhost/epochtalk_dev"
HOST="localhost"
PORT="8080"
PUBLIC_URL="http://localhost:8080"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_AUTH_PASS=""
```
### Admin Panel Configuration
Some configurations can also be set using the settings tab in the administration panel.
![Admin Settings](http://i.imgur.com/DNygrYN.png)

## API
The Epochtalk API can be accessed at `http://localhost:8080/api/` while the server is running. To see full documentation for the api visit the [Epochtalk API Documentation](https://github.com/epochtalk/epochtalk/wiki/Epochtalk-API-Documentation) wiki page.

##Editor
![Editor](http://i.imgur.com/exmYQyV.png)

Each post is crafted through a unique editor with a live content preview.

### BBCode

As for BBCode, the tags that are parsed are based off the SMF 1.0 BBCode spec but with some modifications as per the BitcoinTalk forum. Due to the fact that BBCode differs from forum to forum, a preview window is provided to the right of the main user input to preview what the post will look like once it has been sent to the server. The editor itself will parse the user input in real time with a 250 millisecond debounce. So user can continue to type and the text will not be parsed until 250 millisecond after the last keypress.

To view the list of supported BBCode tags click the ``Format`` button at the top right of the editor:

![Formatting](http://i.imgur.com/wpJZ5Uv.png)

### Security

All user typed HTML is escaped using their decimal encoding while any other HTML is cleaned using [punkave's](https://github.com/punkave) [sanitize-html](https://github.com/punkave/sanitize-html) library. All BBCode input is parsed through our modified [BBCode-Parser](https://github.com/epochtalk/bbcode-parser) library. This ensures that all content passed to the server is sanitized from any malicious code. Also, Angular's sanitization library also ensures that anything missed through the above process is yet again cleaned before it is shown on the client's browser.

*All inputs on the forum are cleaned to different degrees.*

Title like inputs are stripped of all html while description like inputs are allowed only formatting based html tags (```<b>```, ```<em>```, ```<table>``` but not ```<div>```, ```<img>```, and ```<span>```). Posts and Signatures are given the full treatment as described above but allow more html like ```<img>```.

### Anti-Abuse
Marked routes are protected from spam or abuse by tracking the number of times a user access an API endpoint. The first two uses of the endpoint are free of any penalties. Any use of the endpoint afterward is penalized with longer and longer cool down periods, starting from 1 minutes and ranging up to 65536 minutes or roughly 45 days from the last known incident. Proper use of the endpoint will trigger a function to remove all cool down periods. Improper use of the endpoint duing the cool down period will only increase the cool down period. 

### Planned Features:
* Markdown Support
* Medium Based Editor
* Hiding the preview window
* Moving the preview window to another location
* Full feature compatibility across all input methods (BBCode, Medium, Markdown)

## Contributions
Epochtalk is an open source project and we are planning to accept contributions. If you would like to contribute to Epochtalk please email [info@slickage.com](mailto:info@slickage.com).

## Feedback
Please leave us feedback using [github issues](https://github.com/epochtalk/epochtalk/issues)

## License
The MIT License (MIT)

Copyright (c) 2016 Epochtalk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
