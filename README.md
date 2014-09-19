# EpochTalk [![Gitter chat](http://img.shields.io/badge/gitter-slickage%2Fepochtalk-1dce73.svg?style=flat)](https://gitter.im/slickage/epochtalk)[![Build Status](http://img.shields.io/travis/slickage/epochtalk.svg?style=flat)](https://travis-ci.org/slickage/epochtalk)

####**Warning this project is under active development, design is subject to change**

Next generation forum software. EpochTalk is a forum frontend designed to be paired with EpochCore [Backend](https://github.com/epochtalk/core). The EpochTalk frontend utilizes technologies such as [AngularJS](https://angularjs.org), [Browserify](https://www.npmjs.org/package/browserify) and [Foundation](http://foundation.zurb.com) for improved performance and user experience as compared to existing forum software.

## Features
* EpochTalk is a single page web application created with [AngularJS](https://angularjs.org)
* Web/Mobile ready responsive design using [Foundation](http://foundation.zurb.com)
* JavaScript and CSS is bundled and minimized for performance using [Browserify](https://www.npmjs.org/package/browserify), [Cssify](https://www.npmjs.org/package/cssify), and [Uglify-js](https://www.npmjs.org/package/uglify-js)
* Designed with performance in mind. EpochTalk's backend, [EpochCore](https://github.com/epochtalk/core), utilizes [leveldb](https://github.com/rvagg/node-levelup) for improved read/write speed and small database size.


## Dependencies
* [node](http://nodejs.org)
* [npm](https://www.npmjs.org/doc/README.html) (pre-packaged with node)


## Installation

1) Checkout repository using git:
```sh
$ git clone git@github.com:epochtalk/frontend.git
```

2) Change directories and install dependencies using [npm](https://www.npmjs.org/doc/README.html)
```sh
$ cd frontend
$ npm install
```

3) Seed Test Data **(Optional)**

EpochTalk is currently in alpha release, the easiest way to view the state of the software is to seed the forum with test data using the EpochTalk [admin tool](https://github.com/epochtalk/admin). While still within the `frontend` directory run the following commands:
```sh
$ npm install git+ssh://git@github.com/epochtalk/admin.git -g
$ epoch --seed
```

4) Start the EpochTalk Server

```sh
$ npm run start
```
Upon running the `start` command EpochTalk will start its webserver and compile all JavaScript and css. Once compilation is complete the forum can be viewed at `http://localhost:8080`

## API
The EpochTalk API can be accessed at `http://localhost:8080/api/` when the server is running.

TODO...

##TODO (Planned Changes)
* Redesign of frontend user interface (Current UI is temporary). Design is currently a low priority until the EpochCore backend is in a more stable state.
* Functionality to create Boards/Threads/Posts via the UI (Currently supported via the API)
* Implementation of Admin and User Views

See our github issues flagged with the [TODO label](https://github.com/epochtalk/frontend/issues?q=is%3Aopen+is%3Aissue+label%3ATODO)

To see planned backend changes, visit the EpochCore [issues page](https://github.com/epochtalk/core/issues?q=is%3Aopen+is%3Aissue+label%3ATODO)

##Feedback
Please leave us feedback using [github issues](https://github.com/epochtalk/frontend/issues)

##License
The MIT License (MIT)

Copyright (c) 2014 EpochTalk

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