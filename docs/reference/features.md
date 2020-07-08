---
title: Features
---

# Features
### Editor
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
