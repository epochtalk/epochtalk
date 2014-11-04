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
The EpochTalk API can be accessed at `http://localhost:8080/api/` when the server is running. The following api routes are supported:

###Boards
| Route | Type | Params | Description |
|-------|------|--------|-------------|
|`/api/boards`|POST| Board Obj |Used to create a new board|
|`/api/boards`|GET|N/A|Returns a categorized list of all boards with categories|
|`/api/boards/all`|GET|N/A|Returns an uncategorized list of all boards|
|`/api/boards/{id}`|POST|Updated Board Obj|Used to update a specific board|
|`/api/boards/{id}`|GET|N/A|Returns a specific board|
|`/api/boards/{id}`|DELETE|N/A|Used to delete a specific board|
All POST parameters must follow the [Board Schema](https://github.com/epochtalk/core#board-schema)

###Threads
| Route | Type | Params | Description |
|-------|------|--------|-------------|
|`/api/threads`|POST|Thread Obj|Used to create a new thread|
|`/api/threads`|GET|board_id, limit, page|Returns a list of threads by board|
|`/api/thread/{id}`|GET|N/A|Returns a specific thread|
All POST parameters must follow the [Thread Schema](https://github.com/epochtalk/core#thread-schema)

###Posts
| Route | Type | Params | Description |
|-------|------|--------|-------------|
|`/api/posts`|POST|Post Obj|Used to create a new post|
|`/api/posts`|GET|thread_id, limit, page|Returns a list of posts by thread|
|`/api/posts/{id}`|GET|N/A|Returns a specific post|
|`/api/posts/{id}`|POST|Updated Post Obj|Used to update a specific post|
|`/api/posts/{id}`|DELETE|N/A|Used to delete a specific post|
All POST parameters must follow the [Post Schema](https://github.com/epochtalk/core#post-schema)

###Users
| Route | Type | Params | Description |
|-------|------|--------|-------------|
|`/api/users`|POST|User Obj|Used to create a new user|
|`/api/users/{id}`|GET|N/A|Returns a specific user|
All POST parameters must follow the [User Schema](https://github.com/epochtalk/core#user-schema)

##Editor
![Editor](http://i.imgur.com/KYiJS9J.png)

Each post is crafted through a unique editor that can parses BBCode or with an intuitive Medium inspired text selection tool. The tool itself is from [daviferreira](https://github.com/daviferreira/medium-editor).

![medium](http://i.imgur.com/25AM51Z.png)

The selection tool allows the user to highlight a section of text and a popup will appear with a list of options available to the user. The default list of options as they appear are:
* bold
* italics
* underline
* Hyperlink
* Header 1
* Header 2
* Blockquote

Additional options can be added, they are as follows: 
* superscript
* subscript
* strikethrough
* unordered list
* ordered list
* pre
* justify left
* justify full
* justify center
* justify right
* image
* indent
* outdent

As for BBCode, the codes that are parsed is based off the SMF 1.0 BBCode spec but with some modifications as per the BitcoinTalk forum. Because BBCode differs from forum to forum, a preview window is provided to the right of the main user input to show what the post would like once it has been sent to the server. The editor itself will parse the user input in real time with a 250 millisecond debounce. So user can continue to type and the text will not be parsed until 250 millisecond after the last keypress. 

The two systems can be used together since medium tool currently does not support some of the features that BBCode can do (Mainly colored text). It is suggested to use the Medium tool with BBCode added whenever the Medium tool falls short. 

### Security

All user typed HTML is escaped using their decimal encoding while any HTML generated by the Medium tool is cleaned using [punkave's](https://github.com/punkave) [sanitize-html](https://github.com/punkave/sanitize-html) library. All BBCode input is parsed through our modified [BBCode-Parser](https://github.com/epochtalk/bbcode-parser) library. This ensures that all content passed to the server is sanitized from any malicious code. Also, Angular's sanitization library also ensures that anything missed through the above process is yet again cleaned before it is shown on the client's browser.

*All inputs on the forum is cleaned to different degrees.*

Title like inputs are stripped of all html while description like inputs are allowed only formatting based html tags (```<b>```, ```<em>```, ```<table>``` but not ```<div>```, ```<img>```, and ```<span>```). Posts and Signatures are given the full treatment as described as above but allow more html like ```<img>```.

### Planned Features: 
* Markdown Support
* Hiding the preview window
* Moving the preview window to another location
* Full Screen Editor
* Full feature compatibility across all input methods (BBCode, Medium, Markdown)


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