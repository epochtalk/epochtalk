bbcode-parser
=============

Epochtalk BBCode Parser built specifically for Bitcointalk's BBCode (SMF Based)

This is based on the work of:  
Extendible BBCode Parser v1.0.0  
By Patrick Gillespie (patorjk@gmail.com)  
Website: http://patorjk.com/  

This is a bbcode parser that has been specifically built to read and parse the BBCode tags that come from the bitcointalk forum. Their BBCode is based off of SMF BBCode but with some modifications. It has also been modified to be used as a node module rather than a browser based library. It has also been further modified so that styles can be properly parsed by AngularJS.

The parsed output is, for the most part, standard HTML with a few changes to allow the HTML to be properly parsed by AngularJS using the custom style-fix directive. Since all style attributes are stripped out by AngularJS, special 'bbcode-' prefixed classes have been added to all HTML tags that also have style attributes. These prefix classes are used as 'style hints' for the style-fix directive which turn the prefixed classes into an ng-style attribute.

### Parsing example
```
[color=red]test[/color]
```
is parsed to:  
``` HTML
<span class="bbcode-color-red" style="color:red">test</span>
```
which the style-fix directive parses into:
```
<span ng-style="{ 'color': 'red' }">test</span>
```
The final result being (after AngularJS compiles and parses this):
```
<span ng-style="{ 'color': 'red' }" style="color:red">test</span>
```

Special attention has been given to ensure that any input is properly escaped and sanitized by both the BBCode parser, then the style-fix directive, and finally by AngularJS (ng-style) itself before being shown to the user.

### Attention to Time:
All time/date output has been modified so that the unix time is what is placed in the output. It has also been prefixed with 'ept-date=' so that the auto-date directive can find the time/date and display it as local time.

For Example:  
```
[time]1234567900[/time]
```
is parsed to:  
```
ept-date=1234567900
```
which the auto-date directive parses into:  
```
January 14, 1970, 8:56:07 PM
```

## Tags Not Supported:
BBCode Tag|Notes
----------|-----
[font][/font]|Won't even be parsed

## Tags Supported:
BBCode Tag|Parsed Result|Notes
----------|-------------|-----
[anchor={text}][/anchor]| ```<span id="post_{text}"><span>``` | _Anchor will appear as_ "post_{text}"
[abbr={text}][/abbr]|```<abbr title={text}></abbr>```|
[acronym={text}][/acronym]|```<acronym title={text}></acronym>```|
[b][/b]|```<b></b>```|
[bbcode][/bbcode]| | This is a noop
[black][/black]|```<span class="bbcode-color-black" style="color: black;"></span>```|
[blue][/blue]|```<span class="bbcode-color-blue" style="color: blue;"></span>```|
[br][/br]| ```<br />```|**Closing tag is required**
[btc][/btc]|```<span class="BTC">BTC</span>```|
[center][/center]|```<div align="center"></div>```|
[code][/code]|```<code></code>```|
[color={XXXXXX}][/color]|```<span class="bbcode-color-{XXXXXX}" style="color: {XXXXXX}"></span>```| RGB value
[color={#XXXXXX}][/color]|```<span class="bbcode-color-{_XXXXXX}" style="color: {#XXXXXX}"></span>```|RGB Value with #
[color={Color Name}][/color]|```<span class="bbcode-color-{Color Name}" style="color: {Color Name}"></span>```|Color Names allowed shown below
[email={Email Address}][/email]|```<a href="mailto: {Email Address}" target="_blank"></a>```|
[email]{email}[/email]|```<a href="mailto: {Email Address}" target="_blank"></a>```|
[ftp={FTP URL}][/ftp]|```<a href="{FTP URL}" target="_blank"></a>```|
[ftp]{FTP URL}[/ftp]|```<a href="{FTP URL}" target="_blank"></a>```|
[glow={XXXXXX}][/glow]|```<span class="bbcode-bgcolor-{XXXXXX}" style="background-color:{XXXXXX}"></span>```|
[glow={#XXXXXX}][/glow]|```<span class="bbcode-bgcolor-{#XXXXXX}" style="background-color:{#XXXXXX}"></span>```|
[glow={Color Name}][/glow]|```<span class="bbcode-bgcolor-{Color Name}" style="background-color:{Color Name}"></span>```|Color Names allowed shown below
[green][/green]|```<span class="bbcode-color-green" style="color: green;"></span>```|
[hr][/hr]|```<hr />```|**Closing tag is required**  
[html][/html]||This is a noop
[i][/i]|```<i></i>```|
[img alt={String} width={Number} height={Number}] {URL} [/img]|```<img src="{URL}" alt={String} width={Number} height={Number}></img>```|_alt, width, and height are all optional_
[iurl={URL}][/iurl]|```<a href="{URL}" />```|{URL} is always link text, [1]
[iurl]{URL}[/iurl]|```<a href="{URL}" />```|{URL} is always link text, [1]
[left][/left]|```<div class="bbcode-text-left" style="text-align: left;"></div>```|
[li][/li]|```<li></li>```|_parent can only be [list], [ol], [ul]_
[list {List Type}][/list]|```<ul class="bbcode-list-{List Type}" style="list-style-type:{List Type}"></ul>```|_List Type is optional_,  List Types allowed shown below, children can only be [li]
[ltr][/ltr]|```<div dir="ltr"></div>```|
[me={author}][/me]|```<div class="bbcode-color-red" style="color: red;">* {author} </div>```|
[move][/move]|```<div></div>```|deprecated tag, does nothing
[noparse][/noparse]||_does not parse inner contents_
[nobbc][/nobbc]||_does not parse inner contents_
[ol][/ol]|```<ol></ol>```|children can only be [li]
[pre][/pre]|```<pre></pre>```|
[php][/php]|```<pre></pre>```|not really useful anymore
[quote][/quote]|```<div class="quoteHeader">Quote</div><div class="quote"></div>```|
[quote={author}][/quote]|```<div class="quoteHeader">Quote From: {author}</div><div class="quote"></div>```|
[quote author={author}][/quote]|```<div class="quoteHeader">Quote From: {author}</div><div class="quote"></div>```|
[quote author={author} link={link} date={Number}][/quote]|```<div class="quoteHeader"><a href="{link}">Quote from: {author} on ept-date={Number}</a></div><div class="quote"></div>```| {Number} as milliseconds from epoch
[right][/right]|```<div class="bbcode-text-right" style="text-align: right;"></span>```|
[red][/red]|```<span class="bbcode-color-red" style="color: red;"></span>```|
[rtl][/rtl]|```<div dir="rtl"></div>```|
[s][/s]|```<del></del>```|
[shadow={color},{direction},{blur}][/shadow]|```<span class="bbcode-shadow-{color}{direction}{blur}" style="text-shadow: {color}{direction}{blur}"></span>```| [2] check bottom of grid
[size={size}][/size]|```<span class="bbcode-size-{size}" style="font-size:{size} !important; line-height: 1.3em;"></span>```| [3] check bottom of grid
[spoiler][/spoiler]|```<span class="spoiler"></span>```|
[sub][/sub]|```<sub></sub>```|
[sup][/sup]|```<sup></sup>```|
[tt][/tt]|```<tt></tt>```|
[time]{time}[/time]|```ept-date={time}```|[4] check bottom of grid
[table][/table]|```<table></table>```|Children can only be tbody, thead, tfoot, tr
[tbody][/tbody]|```<tbody></tbody>```|Parent can only be table, children can only be tr
[thead][/thead]|```<thead></thead>```|Parent can only be table, children can only be tr
[tfoot][/tfoot]|```<tfoot></tfoot>```|Parent can only be table, children can only be tr
[td][/td]|```<td valign="top"></td>```|Parent can only be tr
[th][/th]|```<th></th>```|Parent can only be tr
[tr][/tr]|```<tr></tr>```|Parent can only be table, tbody, tfoot, thead. Children can only be td, th
[u][/u]|```<u></u>```|
[ul][/ul]|```<ul></ul>```|Children can only be li
[url={URL}]{content}[/url]|```<a href="{URL}" target="_blank"></a>```|{content} is link text
[url]{URL}[/url]|```<a href="{URL}" target="_blank"></a>```|{URL} is always link text
[white][/white]|```<span class="bbcode-color-white" style="color: white;">```|

[1]: Meant for urls that stay within the domain and thus will not open the link in another tab.  
[2]: _color and direction are required but blur is optional_.  {color} is treated the same way as in the [color]. {direction} can be represented as either 'left, right, top, bottom' or as a number. {blur} must be a number  
[3]: {size} can be either an number followed by either px or pt. Or it can be one of the following: smaller, small, large, larger, x-large, x-larger  
[4]: {time} can be either a number (milliseconds since epoch), or a datetime string that can be parsed by JavaScript's Date object.  

#### Color Names supported for the above color based tags
Color Names| | | |
-----------|----------|-----------|----------|
red|green|blue|orange|
yellow|pink|black|white|
beige|brown|grey|gray|
silver|purple|maroon|lime|
limegreen|olive|navy|teal|
aqua||||

#### List Types supported for the above [list] tag
List Types||||
----------|----------|----------|----------|
none|disc|circle|square|
decimal|decimal-leading-zero|lower-roman|upper-roman|
lower-alpha|upper-alpha|lower-greek|lower-latin|
upper-latin|hebrew|armenian|georgian|
cjk-ideographic|hiragana|katakana|hiragana-iroha|
katakana-iroha||||
