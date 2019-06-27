# Epochtalk [![Circle CI](https://circleci.com/gh/epochtalk/epochtalk.svg?circle-token=:circle-token)](https://circleci.com/gh/epochtalk/epochtalk) [![Gitter chat](http://img.shields.io/badge/gitter-epochtalk%2Fepochtalk-1dce73.svg?style=flat)](https://gitter.im/epochtalk/epochtalk)

#### **Warning this project is under active development, design is subject to change**

Next generation forum software. Epochtalk forum software utilizes technologies such as [AngularJS](https://angularjs.org), [Webpack](https://webpack.github.io), [Postgres](https://github.com/postgres/postgres) and [Bourbon](http://bourbon.io/) for improved performance and user experience as compared to existing forum software.

![Epochtalk Forums](http://i.imgur.com/D2Lizk5.png)

## Index
* [Features](#features)
* [Dependencies](#dependencies)
  * [System](#system)
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
* Designed with performance in mind. Epochtalk's backend utilizes [Postgres](http://www.postgresql.org/) as a database.
* Customizable Theming (Branding, coloring, fonts, sizes)
* Fully modular permissions system with roles

## System Dependencies
* [node](http://nodejs.org)
* [npm](https://www.npmjs.org/doc/README.html) (pre-packaged with node)
* [yarn](https://yarnpkg.com)
* [Postgres](http://www.postgresql.org/)
* [Redis](http://redis.io/)

## Installation

#### 1) Checkout repository using git:
```sh
$ git clone git@github.com:epochtalk/epochtalk.git
```

#### 2) Change directories and install dependencies using [yarn](https://yarnpkg.com)
```sh
$ cd epochtalk
$ yarn
```

#### 3) Copy the example.env file
This file specifies the server configurations and is necessary to run the
server.  You can edit the .env file later to specify the configurations as
outlined in the Configuration section.

```sh
$ cd .. # cd back to project root
$ cp example.env .env
```

#### 4) Checkout and Run Migrations
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

#### 5) Initialize First User
First ensure that [Postgres](http://www.postgresql.org/) is installed and running. Before running Epochtalk for the first time, it is necessary to setup the database and first user account. The CLI tool will create the first board and admin account for the forum. From the root directory of the project run the following command:
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

### Saas mode
This can be set in the .env file by setting the var SAAS_MODE to true. What this basically does is the emailer and images config are hidden in the admin/settings/general view. These configs can only be edited through the .env file or directly in the database only and requires a restart for the changes to take effect.

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
Epochtalk is an open source project and gladly welcomes public contributions. Contributions can be made by creating a discussion via the issues. New features or fixes can be contributed via pull requests. *Please note, all new packages must be added via yarn, not npm*

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
