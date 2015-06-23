# Epochtalk [![Circle CI](https://circleci.com/gh/epochtalk/epochtalk.svg?circle-token=:circle-token)](https://circleci.com/gh/epochtalk/epochtalk) [![Gitter chat](http://img.shields.io/badge/gitter-epochtalk%2Fepochtalk-1dce73.svg?style=flat)](https://gitter.im/epochtalk/epochtalk)

####**Warning this project is under active development, design is subject to change**

Next generation forum software. Epochtalk is a forum frontend designed to be paired with the [core-pg](https://github.com/epochtalk/core-pg) backend. Epochtalk forum software utilizes technologies such as [AngularJS](https://angularjs.org), [Browserify](https://www.npmjs.org/package/browserify), [Postgres](https://github.com/postgres/postgres) and [Foundation](http://foundation.zurb.com) for improved performance and user experience as compared to existing forum software.

![Epochtalk Forums](http://i.imgur.com/iWEvbvF.png)

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
* [Planned Changes](#planned-changes)
* [Feedback](#feedback)
* [License](#license)

## Features
* Epochtalk is a single page web application created with [AngularJS](https://angularjs.org)
* Web/Mobile ready responsive design using [Foundation](http://foundation.zurb.com)
* JavaScript and CSS is bundled and minimized for performance using [Browserify](https://www.npmjs.org/package/browserify) and [Uglify-js](https://www.npmjs.org/package/uglify-js)
* Designed with performance in mind. Epochtalk's backend, [Epochtalk-Core-PG](https://github.com/epochtalk/core-pg), utilizes [Postgres](http://www.postgresql.org/) as a database.

## Dependencies
### System
* [node](http://nodejs.org)
* [npm](https://www.npmjs.org/doc/README.html) (pre-packaged with node)
* [bower](https://github.com/bower/bower)
* [Postgres](http://www.postgresql.org/)
* [foreman](http://ddollar.github.io/foreman)

### Bower
* angular `1.3.14`
* angular-resource `1.3.14`
* angular-sanitize `1.3.14`
* angular-animate `1.3.14`
* angular-loading-bar `0.7.1`
* foundation `5.5.1`
* nestable [slickage/Nestable](http://github.com/slickage/Nestable)
* angular-ui-router `~0.2.15`
* angular-ui-router-title `0.0.3`

### NPM
* async `^0.9.0`
* aws-sdk `^2.1.20`
* bcrypt `^0.8.0`
* bluebird `^2.6.4`
* boom `^2.6.1`
* brfs `^1.3.0`
* browserify `^8.1.3`
* cheerio `^0.18.0`
* commander `^2.5.1`
* db-migrate `^0.8.0`
* deep-rename-keys `^0.1.0`
* dot `^1.0.3`
* epochtalk-bbcode-parser `^1.0.0`
* epochtalk-core-pg `^0.9.11`
* fs-extra `^0.16.5`
* good `^5.1.1`
* good-console `^4.1.0`
* good-file `^4.0.1`
* hapi `^8.2.0`
* hoek `^2.12.0`
* joi `^6.0.8`
* json `^9.0.3`
* jsonwebtoken `^5.0.0`
* levelup `^0.19.0`
* lodash `^2.4.1`
* lout `^6.1.0`
* medium-editor `^1.8.14`
* memdown `^0.11.0`
* mkdirp `^0.5.0`
* mmmagic `^0.3.11`
* node-sass `^2.1.1`
* node-uuid `^1.4.1`
* nodemailer `^1.3.2`
* pg `^4.2.0`
* request `^2.53.0`
* sanitize-html `^1.4.3`
* stream-meter `^1.0.3`
* through2 `^0.6.3`
* yargs `^1.2.1`


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


#### 3) Install frontend dependencies using [bower](https://github.com/bower/bower)
```sh
$ bower install
```

#### 4) Run the Epochtalk CLI tool
First ensure that [Postgres](http://www.postgresql.org/) is installed an running. Before running Epochtalk for the first time, it is necessary to setup the database and first user account. The CLI tool will create the first board and admin account for the fourm. From the root directory of the project run the following command:
```sh
$ node cli/index.js --create
```

#### 5) Start the Epochtalk server
Ensure that [foreman](http://ddollar.github.io/foreman) is installed. Upon running the `foreman start` command Epochtalk will start its webserver and compile all JavaScript and css. Once compilation is complete the forum can be viewed at `http://localhost:8080`
```sh
$ foreman start -f Procfile.dev #for development
$ foreman start -f #for production
```

#### 6) Login and change admin account information
Login to the admin account using the username ``admin`` and password ``admin1234``. Visit your profile by clicking the link in the top right corner of the page, then change your username and password.

### Trouble Shooting
Since both [Epochtalk](https://github.com/epochtalk/epochtalk) and [core-pg](https://github.com/epochtalk/core-pg) are actively being developed, the database migrations can become out of sync. To resolve this you can checkout [core-pg](https://github.com/epochtalk/core-pg) and then from within the root directory of core-pg, you can run ``npm link``. Change directories into the ``node_modules`` of your checked out [Epochtalk](https://github.com/epochtalk/epochtalk) project and run ``npm link epochtalk-core-pg``. This will ensure that [Epochtalk](https://github.com/epochtalk/epochtalk) is using the latest master of [core-pg](https://github.com/epochtalk/core-pg) instead of the npm version. Then run ``npm run db-migrate`` from the root directory of your [Epochtalk](https://github.com/epochtalk/epochtalk) project to ensure all migrations are up to date.

## Configuration
Forum configurations can be set either manually or using the admin panel.
### Manual Configuration
The forum configs can be set manually with a [.env](http://ddollar.github.io/foreman/#ENVIRONMENT) file in the root directory of the project.
```sh
HOST=localhost
PORT=8080
LOG_ENABLED=true
PUBLIC_URL=http://localhost:8080
PRIVATE_KEY=Change this to something more secure
VERIFY_REGISTRATION=false
LOGIN_REQUIRED=false
WEBSITE_TITLE=Epochtalk Forums
WEBSITE_DESCRIPTION=Open source forum software
WEBSITE_KEYWORDS=open source, free forum, forum software, forum
WEBSITE_LOGO=
WEBSITE_FAVICON=
EMAILER_SENDER=info@example.com
EMAILER_HOST=smtp.gmail.com
EMAILER_PORT=465
EMAILER_USER=username
EMAILER_PASS=password
EMAILER_SECURE=true
IMAGES_STORAGE=local
IMAGES_MAX_SIZE=10485760
IMAGES_EXPIRATION=7200000
IMAGES_INTERVAL=900000
IMAGES_LOCAL_DIR=/public/images
IMAGES_LOCAL_PATH=/static/images
IMAGES_S3_ROOT=http://some.where
IMAGES_S3_DIR=images/
IMAGES_S3_BUCKET=bukkit
IMAGES_S3_REGION=region
IMAGES_S3_ACCESS_KEY=testkey
IMAGES_S3_SECRET_KEY=testkey
```
### Admin Panel Configuration
Configurations can also be set using the settings tab in the administration panel.
![Admin Settings](http://i.imgur.com/kIxs86V.png)

## API
The Epochtalk API can be accessed at `http://localhost:8080/api/` while the server is running. To see full documentation for the api visit the [Epochtalk API Documentation](https://github.com/epochtalk/epochtalk/wiki/Epochtalk-API-Documentation) wiki page.

##Editor
![Editor](http://i.imgur.com/5JPc0ui.png)

Each post is crafted through a unique editor with a live content preview.

### BBCode

As for BBCode, the tags that are parsed are based off the SMF 1.0 BBCode spec but with some modifications as per the BitcoinTalk forum. Due to the fact that BBCode differs from forum to forum, a preview window is provided to the right of the main user input to preview what the post will look like once it has been sent to the server. The editor itself will parse the user input in real time with a 250 millisecond debounce. So user can continue to type and the text will not be parsed until 250 millisecond after the last keypress.

To view the list of supported BBCode tags click the ``formatting`` button at the top right of the editor:

![Formatting](http://i.imgur.com/4GQwfmh.png)

### Security

All user typed HTML is escaped using their decimal encoding while any other HTML is cleaned using [punkave's](https://github.com/punkave) [sanitize-html](https://github.com/punkave/sanitize-html) library. All BBCode input is parsed through our modified [BBCode-Parser](https://github.com/epochtalk/bbcode-parser) library. This ensures that all content passed to the server is sanitized from any malicious code. Also, Angular's sanitization library also ensures that anything missed through the above process is yet again cleaned before it is shown on the client's browser.

*All inputs on the forum are cleaned to different degrees.*

Title like inputs are stripped of all html while description like inputs are allowed only formatting based html tags (```<b>```, ```<em>```, ```<table>``` but not ```<div>```, ```<img>```, and ```<span>```). Posts and Signatures are given the full treatment as described above but allow more html like ```<img>```.

### Planned Features:
* Markdown Support
* Medium Based Editor
* Hiding the preview window
* Moving the preview window to another location
* Full feature compatibility across all input methods (BBCode, Medium, Markdown)

## Contributions
Epochtalk is an open source project and we are planning to accept contributions. If you would like to contribute to Epochtalk please email [info@slickage.com](mailto:info@slickage.com).

## Planned Changes
* Redesign of frontend user interface (Current UI is temporary). Design is currently a low priority until the all the forum features are fully fleshed out.
* Dockerizing Epochtalk

To see planned backend changes, visit the core-pg [issues page](https://github.com/epochtalk/core-pg/issues)

## Feedback
Please leave us feedback using [github issues](https://github.com/epochtalk/epochtalk/issues)

## License
The MIT License (MIT)

Copyright (c) 2015 Epochtalk

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
