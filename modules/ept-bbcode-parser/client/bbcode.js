/*
    Copyright (C) 2011 Patrick Gillespie, http://patorjk.com/

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
*/

/*
    Extendible BBCode Parser v1.0.0
    By Patrick Gillespie (patorjk@gmail.com)
    Website: http://patorjk.com/

    Edited by:
    Edward Kim
    Slickage Studios
    For Epochtalk

    This module allows you to parse BBCode and to extend to the mark-up language
    to add in your own tags.
*/

var XBBCODE = (function() {
  "use strict";

  // -----------------------------------------------------------------------------
  // Set up private variables
  // -----------------------------------------------------------------------------

  var me = {},
      imgPattern = /^((?:https?|file|c):(?:\/{1,3}|\\{1})|\/)[-a-zA-Z0-9:;@#%&()~_?\+=\/\\\.]*$/,
      urlPattern = /^(?:https?|file|c):(?:\/{1,3}|\\{1})[-a-zA-Z0-9:;@#%&()~_?\+=\/\\\.]*$/,
      ftpPattern = /^(?:ftps?|c):(?:\/{1,3}|\\{1})[-a-zA-Z0-9:;@#%&()~_?\+=\/\\\.]*$/,
      colorNamePattern = /^(?:red|green|blue|orange|yellow|pink|black|white|beige|brown|grey|gray|silver|purple|maroon|lime|limegreen|olive|navy|teal|aqua)$/,
      colorCodePattern = /^#?[a-fA-F0-9]{6}$/,
      emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/,
      fontFacePattern = /^([a-z][a-z0-9_]+|"[a-z][a-z0-9_\s]+")$/i,
      sizePattern = /([1-9][\d]?p[xt]|(?:x-)?small(?:er)?|(?:x-)?large[r]?)/,
      anchorPattern = /[#]?([A-Za-z][A-Za-z0-9_-]*)/,
      smfQuotePattern = /(?:board=\d+;)?((?:topic|threadid)=[\dmsg#\.\/]{1,40}(?:;start=[\dmsg#\.\/]{1,40})?|action=profile;u=\d+)/,
      eptQuotePattern = /^\/threads\/[a-z0-9\-]*\/posts[a-z0-9?\=\-#\&]*/i,
      tags,
      tagList,
      tagsNoParseList = [],
      bbRegExp,
      pbbRegExp,
      pbbRegExp2,
      openTags,
      closeTags;

  /* -----------------------------------------------------------------------------
   * tags
   * This object contains a list of tags that your code will be able to understand.
   * Each tag object has the following properties:
   *
   *   openTag - A function that takes in the tag's parameters (if any) and its
   *             contents, and returns what its HTML open tag should be.
   *             Example: [color=red]test[/color] would take in "=red" as a
   *             parameter input, and "test" as a content input.
   *             It should be noted that any BBCode inside of "content" will have
   *             been processed by the time it enter the openTag function.
   *
   *   closeTag - A function that takes in the tag's parameters (if any) and its
   *              contents, and returns what its HTML close tag should be.
   *
   *   displayContent - Defaults to true. If false, the content for the tag will
   *                    not be displayed. This is useful for tags like IMG where
   *                    its contents are actually a parameter input.
   *
   *   restrictChildrenTo - A list of BBCode tags which are allowed to be nested
   *                        within this BBCode tag. If this property is omitted,
   *                        any BBCode tag may be nested within the tag.
   *
   *   restrictParentsTo - A list of BBCode tags which are allowed to be parents of
   *                       this BBCode tag. If this property is omitted, any BBCode
   *                       tag may be a parent of the tag.
   *
   *   noParse - true or false. If true, none of the content WITHIN this tag will be
   *             parsed by the XBBCode parser.
   *
   *
   *
   * LIMITIONS on adding NEW TAGS:
   *  - Tag names should be alphanumeric (including underscores) and all tags should have an opening tag
   *    and a closing tag.
   *    The [*] tag is an exception because it was already a standard
   *    bbcode tag. Technecially tags don't *have* to be alphanumeric, but since
   *    regular expressions are used to parse the text, if you use a non-alphanumeric
   *    tag names, just make sure the tag name gets escaped properly (if needed).
   * --------------------------------------------------------------------------- */

  // tags to add:
  // chrissy (wtf)
  // kissy (wtf)
  // flash (not supported)

  /* Allowed Color Codes:
   * red
   * green
   * blue
   * orange
   * yellow
   * pink
   * black
   * white
   * beige
   * brown
   * grey
   * gray
   * silver
   * purple
   * maroon
   * lime
   * limegreen
   * olive
   * navy
   * teal
   * aqua
   */

  /* hard coded colors:
   * Black
   * Blue
   * Green
   * Red
   * White
   */

  tags = {
    "anchor": {
      openTag: function(params, content) {
        var id = params || '';
        id = id.substr(1) || '';
        if ( !anchorPattern.test(id) ) { id = ''; }
        return '<span id="post_' + id + '">';
      },
      closeTag: function(params, content) { return '</span>'; }
    },
    "abbr": {
      openTag: function(params,content) {
        var title = params || '';
        title = title.substr(1) || '';
        title = title.replace(/<.*?>/g,'');
        return '<abbr title="' + title + '">';
      },
      closeTag: function(params,content) {
          return '</abbr>';
      }
    },
    "acronym": {
      openTag: function(params,content) {
        var title = params || '';
        title = title.substr(1) || '';
        title = title.replace(/<.*?>/g,'');
        return '<acronym title="' + title + '">';
      },
      closeTag: function(params,content) {
          return '</acronym>';
      }
    },
    "b": {
      openTag: function(params,content) { return '<b>'; },
      closeTag: function(params,content) { return '</b>'; }
    },
    /*
      This tag does nothing and is here mostly to be used as a classification for
      the bbcode input when evaluating parent-child tag relationships
    */
    "bbcode": {
      openTag: function(params,content) { return ''; },
      closeTag: function(params,content) { return ''; }
    },
    "black": {
      openTag: function(params,content) {
        return '<span class="bbcode-color-black" style="color: black;">';
      },
      closeTag: function(params,content) {
        return '</span>';
      }
    },
    "blue": {
      openTag: function(params,content) {
        return '<span class="bbcode-color-blue" style="color: blue;">';
      },
      closeTag: function(params,content) {
        return '</span>';
      }
    },
    "br": {
      openTag: function(params,content) { return '<br />'; },
      closeTag: function(params,content) { return ''; }
    },
    "btc": {
      openTag: function(params,content) {
        return '<span class="BTC">BTC</span>';
      },
      closeTag: function(params,content) {
        return '';
      }
    },
    "center": {
      openTag: function(params,content) {
        return '<div align="center">';
      },
      closeTag: function(params,content) {
        return '</div>';
      }
    },
    "code": {
      openTag: function(params,content) {
        return '<code>';
      },
      closeTag: function(params,content) {
        return '</code>';
      },
      noParse: true
    },
    "color": {
      openTag: function(params,content) {
        var simpleColor = '';
        var colorCode = params || '=black';
        colorCode = colorCode.substr(1) || "black";
        colorCode = colorCode.toLowerCase();
        colorCode = colorCode.trim();
        colorNamePattern.lastIndex = 0;
        colorCodePattern.lastIndex = 0;
        if ( !colorNamePattern.test( colorCode ) ) {
          if ( !colorCodePattern.test( colorCode ) ) {
            colorCode = 'black';
            simpleColor = 'black';
          }
          else {
            if (colorCode.substr(0,1) !== "#") {
              simpleColor = '_' + colorCode;
              colorCode = '#' + colorCode;
            }
            else {
              simpleColor = '_' + colorCode.substr(1);
            }
          }
        }
        else { simpleColor = colorCode; }
        return '<span class="bbcode-color-' + simpleColor + '" style="color:' + colorCode + '">';
      },
      closeTag: function(params,content) {
          return '</span>';
      }
    },
    "email": {
      openTag: function(params,content) {
        var myEmail;
        if (!params) {
          myEmail = content.replace(/<.*?>/g,'');
        }
        else {
          myEmail = params.substr(1);
        }

        myEmail = myEmail.trim();
        emailPattern.lastIndex = 0;
        if ( !emailPattern.test( myEmail ) ) {
          return '<a>';
        }

        return '<a href="mailto:' + myEmail + '" target="_blank">';
      },
      closeTag: function(params,content) {
        return '</a>';
      }
    },
    "ftp": {
      openTag: function(params,content) {
        var thisFtp = "";
        if (!params) {
          thisFtp = content.replace(/<.*?>/g,'');
        }
        else {
          thisFtp = params.substr(1);
        }

        thisFtp = thisFtp.trim();
        ftpPattern.lastIndex = 0;
        if ( !ftpPattern.test( thisFtp ) ) {
          return '<a target="_blank">';
        }
        return '<a href="' + thisFtp + '" target="_blank">';
      },
      closeTag: function(params,content) {
        return '</a>';
      }
    },
    // "font": {
    //   openTag: function(params,content) {
    //     var faceCode = params || '=inherit';
    //     faceCode = params.substr(1);
    //     faceCode = faceCode.trim();
    //     fontFacePattern.lastIndex = 0;
    //     if ( !fontFacePattern.test( faceCode ) ) {
    //       faceCode = "inherit";
    //     }
    //     return '<span style="font-family:' + faceCode + '">';
    //   },
    //   closeTag: function(params,content) { return '</span>'; }
    // },
    "glow": {
      openTag: function(params, content) {
        var options = params || '';
        options = params.substr(1) || '';
        options = options.replace(/<.*?>/g,'');

        var simpleColor = '';
        var color = options.split(',')[0];
        color = color.trim();
        color = color.toLowerCase();
        colorNamePattern.lastIndex = 0;
        colorCodePattern.lastIndex = 0;
        if ( !colorNamePattern.test( color ) ) {
          if ( !colorCodePattern.test( color ) ) {
            color = 'inherit';
            simpleColor = 'inherit';
          }
          else {
            if (color.substr(0,1) !== "#") {
              simpleColor = '_' + color;
              color = '#' + color;
            }
            else {
              simpleColor = '_' + color.substr(1);
            }
          }
        }
        else { simpleColor = color; }

        return '<span class="bbcode-bgcolor-' + simpleColor +'" style="background-color: ' + color + '">';
      },
      closeTag: function(params, content) { return '</span>'; }
    },
    "green": {
      openTag: function(params,content) {
        return '<span class="bbcode-color-green" style="color: green;">';
      },
      closeTag: function(params,content) {
        return '</span>';
      }
    },
    "hr": {
      openTag: function(params,content) { return '<hr />'; },
      closeTag: function(params,content) { return ''; }
    },
    "html": {
      openTag: function(params,content) { return ''; },
      closeTag: function(params,content) { return ''; }
    },
    "i": {
      openTag: function(params,content) { return '<i>'; },
      closeTag: function(params,content) { return '</i>'; }
    },
    "img": {
      openTag: function(params,content) {
        // url
        var myUrl = content;
        myUrl = myUrl.trim();
        imgPattern.lastIndex = 0;
        if (!imgPattern.test( myUrl ) ) { myUrl = ""; }
        if (!params) { return '<img src="' + myUrl + '" />'; }

        // params
        var options = params;
        options = options.trim();
        options = options.replace(/<.*?>/g,'');
        var alt, width, height;

        // validate params counts
        if ((options.match(/alt=/gi) || []).length > 1) {
          return '<img src="' + myUrl + '" />';
        }

        if ((options.match(/width=/gi) || []).length > 1) {
          return '<img src="' + myUrl + '" />';
        }

        if ((options.match(/height=/gi) || []).length > 1) {
          return '<img src="' + myUrl + '" />';
        }

        // pull out parameters through regex
        var regexArray = /^(alt=.+?|width=[0-9]+?|height=[0-9]+?)?\s*(alt=.+?|width=[0-9]+?|height=[0-9]+?)?\s*(alt=.+?|width=[0-9]+?|height=[0-9]+?)$/i.exec(options);

        // check that array exists
        if (regexArray) {
          // parse author link date
          // the regex array output is weird:
          // [0] = the matched output as a whole so skip that
          for (var i = 1; i < regexArray.length; i++) {
            var value = regexArray[i] || '';
            value = value.trim();
            if (/alt=/i.test(value)) {
              alt = value.substr(4);
            }
            else if (/width=/i.test(value)) {
              width = value.substr(6);
            }
            else if (/height=/i.test(value)) {
              height = value.substr(7);
            }
          }
        }

        var tag = '<img src="' + myUrl + '" ';
        if (alt) { tag += 'alt="' + alt + '" '; }
        if (width) { tag += 'width="' + width + '" '; }
        if (height) { tag += 'height="' + height + '" '; }
        tag += '/>';
        return tag;
      },
      closeTag: function(params,content) { return ''; },
      displayContent: false
    },
    "iurl": {
      openTag: function(params,content) {
        var myUrl;

        if (!params) {
          myUrl = content.replace(/<.*?>/g,"");
        }
        else {
          myUrl = params.substr(1);
        }

        myUrl = myUrl.trim();
        urlPattern.lastIndex = 0;
        if ( !urlPattern.test( myUrl ) ) {
          myUrl = "#";
        }
        return '<a href="' + myUrl + '" />';
      },
      closeTag: function(params,content) {
          return '';
      }
    },
    "left": {
      openTag: function(params,content) {
        return '<div class="bbcode-text-left" style="text-align: left;">';
      },
      closeTag: function(params,content) {
        return '</div>';
      }
    },
    "li": {
      openTag: function(params,content) { return "<li>"; },
      closeTag: function(params,content) { return "</li>"; },
      restrictParentsTo: ["list","ul","ol"]
    },
    "list": {
      openTag: function(params,content) {
        var tag = '<ul>';

        // clean input
        var type = params || '';
        type = type.trim();
        type = type.replace(/<.*?>/g,'');

        // check for type= param
        if (type.indexOf('type=') === 0) {

          // parse type
          type = type.replace('type=', '');
          type = type.trim();

          // check type validity
          if (/(none|disc|circle|square|decimal|decimal-leading-zero|lower-roman|upper-roman|lower-alpha|upper-alpha|lower-greek|lower-latin|upper-latin|hebrew|armenian|georgian|cjk-ideographic|hiragana|katakana|hiragana-iroha|katakana-iroha)/i.test(type)) {
            tag = '<ul class="bbcode-list-' + type + '" style="list-style-type: ' + type + '">';
          }
        }

        return tag;
      },
      closeTag: function(params,content) { return '</ul>'; },
      restrictChildrenTo: ["*", "li"]
    },
    "ltr": {
      openTag: function(params,content) { return '<div dir="ltr">'; },
      closeTag: function(params,content) { return '</div>'; }
    },
    "me": {
      openTag: function(params, content) {
        var name = params || '';
        name = name.substr(1);
        name = name.replace(/<.*?>/g,"");
        name = name.trim();
        if (content) { name = name + " "; }
        return '<div class="bbcode-color-red" style="color: red;">* ' + name + ' ';
      },
      closeTag: function(params, content) { return '</div>'; }
    },
    "move": {
      openTag: function(params, content) { return '<div>'; },
      closeTag: function(params, content) { return '</div>'; }
    },
    "noparse": {
      openTag: function(params,content) { return ''; },
      closeTag: function(params,content) { return ''; },
      noParse: true
    },
    "nobbc": {
      openTag: function(params,content) { return ''; },
      closeTag: function(params,content) { return ''; },
      noParse: true
    },
    "ol": {
      openTag: function(params,content) { return '<ol>'; },
      closeTag: function(params,content) { return '</ol>'; },
      restrictChildrenTo: ["*", "li"]
    },
    "pre": {
      openTag: function(params,content) { return '<pre>'; },
      closeTag: function(params,content) { return '</pre>'; }
    },
    "php": {
      openTag: function(params,content) { return '<pre>'; },
      closeTag: function(params,content) { return '</pre>'; },
      noParse: true
    },
    "quote": {
      openTag: function(params,content) {
        // default: no author, link or date
        var quoteHeader = '<div class="quoteHeader">Quote</div>';
        var quote = '<div class="quote">';

        // clean params
        var options = params || '';
        options = options.trim();
        options = options.replace(/<.*?>/g,'');

        // case 1: no params
        if (options === '') { return quoteHeader + quote; }

        // case 2: author from =params
        if (options.indexOf('=') === 0) {
          var equalsAuthor = options.substr(1);
          quoteHeader = '<div class="quoteHeader">';
          quoteHeader += 'Quote From: ' + equalsAuthor;
          quoteHeader += '</div>';
          return quoteHeader + quote;
        }

        // case 3: author="author"
        if (/author="/i.test(options)) {
          var refString = options.toLowerCase();
          var quoteAuthor = options.substr(refString.indexOf('author="')+7);
          quoteAuthor = quoteAuthor.replace(/"/g, '');
          quoteHeader = '<div class="quoteHeader">';
          quoteHeader += 'Quote From: ' + quoteAuthor;
          quoteHeader += '</div>';
          return quoteHeader + quote;
        }

        // case 4 & 5: parameters = author || author, link, and date
        var author, link, date;

        // validate that there is only one author, and optional link and date
        var authorCount = options.match(/author=/gi) || [];
        if (authorCount.length > 1 || authorCount.length === 0) {
          return quoteHeader + quote;
        }
        if ((options.match(/link=/gi) || []).length > 1) {
          return quoteHeader + quote;
        }
        if ((options.match(/date=/gi) || []).length > 1) {
          return quoteHeader + quote;
        }

        // pull out parameters through regex
        var regexArray = /^(author=.+?|link=.+?|date=[0-9]+?)?\s*(author=.+?|link=.+?|date=[0-9]+?)?\s*(author=.+?|link=.+?|date=[0-9]+?)$/i.exec(options);

        // check that array exists
        if (regexArray) {
          // parse author link date
          // the regex array output is weird:
          // [0] = the matched output as a whole so skip that
          for (var i = 1; i < regexArray.length; i++) {
            var value = regexArray[i] || '';
            value = value.trim();
            if (/author=/i.test(value)) {
              author = value.substr(7);
            }
            else if (/link=/i.test(value)) {
              link = value.substr(5);
              if (!smfQuotePattern.test(link) &&
                  !eptQuotePattern.test(link)) {
                link = undefined;
              }
            }
            else if (/date=/i.test(value)) {
              date = Number(value.substr(5));
            }
          }
        }

        // author
        if (author) {
          quoteHeader = '<div class="quoteHeader">';
          quoteHeader += 'Quote From: ' + author;
          quoteHeader += '</div>';
        }

        // author link date
        if (author && link && date) {
          quoteHeader = '<div class="quoteHeader">';
          quoteHeader += '<a href="' + link + '">';
          quoteHeader += 'Quote from: ' + author + ' on ept-date=' + date;
          quoteHeader += '</a>';
          quoteHeader += '</div>';
        }

        return quoteHeader + quote;
      },
      closeTag: function(params,content) { return '</div>'; }
    },
    "right": {
      openTag: function(params,content) {
        return '<div class="bbcode-text-right" style="text-align: right;">';
      },
      closeTag: function(params,content) {
        return '</div>';
      }
    },
    "red": {
      openTag: function(params,content) {
        return '<span class="bbcode-color-red" style="color: red;">';
      },
      closeTag: function(params,content) {
        return '</span>';
      }
    },
    "rtl": {
      openTag: function(params,content) { return '<div dir="rtl">'; },
      closeTag: function(params,content) { return '</div>'; }
    },
    "s": {
      openTag: function(params,content) { return '<del>'; },
      closeTag: function(params,content) { return '</del>'; }
    },
    "shadow": {
      openTag: function(params, content) {
        var shadow = '';
        var color = '';
        var direction = '';
        var blur = '';
        var dirPattern = /^(?:left|right|top|bottom)$/;
        var numberPattern = /^[0-9]\d{0,2}$/;

        // params = color, direction, blur
        var options = params || '';
        options = params.substr(1) || '';
        options = options.replace(/<.*?>/g,'');
        if (options.indexOf(',') < 0) { return '<span>'; }

        // color
        color = options.split(',')[0];
        color = color.trim();
        color = color.toLowerCase();
        colorNamePattern.lastIndex = 0;
        colorCodePattern.lastIndex = 0;
        if ( !colorNamePattern.test( color ) ) {
          if ( !colorCodePattern.test( color ) ) {
            color = "black";
          }
          else {
            if (color.substr(0,1) !== "#") {
              color = "#" + color;
            }
          }
        }

        // direction
        direction = options.split(',')[1] || '';
        direction = direction.trim();
        // check if direction or angle
        if (!direction) { direction = ' 0 0'; }
        // direction
        else if (dirPattern.test(direction)) {
          // direction
          if (direction === 'left') {
            direction = ' -2px 2px';
          }
          else if (direction === 'right') {
            direction = ' 2px 2px';
          }
          else if (direction === 'top') {
            direction = ' 0 -2px';
          }
          else if (direction === 'bottom') {
            direction = ' 0 2px';
          }
          else {
            direction = ' 0 0';
          }
        }
        // angle
        else if (numberPattern.test(direction)) {
          var angle = direction;
          var radian = angle * 0.0174532925;
          direction = ' ' + Math.round(4*Math.cos(radian)) + 'px';
          direction += ' ' + Math.round(-4*Math.sin(radian)) + 'px';
        }
        else { direction = ' 0 0'; }

        // blur
        blur = options.split(',')[2] || '';
        blur = blur.trim();
        if (!blur) { blur = ' 0'; }
        else if (numberPattern.test(blur)) { blur = ' ' + blur + 'px'; }
        else { blur = ' 0'; }

        // final output
        shadow = color + direction + blur;
        var simpleShadow = shadow.replace(/\s/gi, '_');
        simpleShadow = simpleShadow.replace(/#/gi, '_');
        return '<span class="bbcode-shadow-' + simpleShadow + '" style="text-shadow: ' + shadow + '">';
      },
      closeTag: function(params, content) { return '</span>'; }
    },
    "size": {
      openTag: function(params,content) {
        var size = params || '';
        size = size.substr(1) || "inherit";
        size = size.trim();
        sizePattern.lastIndex = 0;
        if (!sizePattern.test(size)) {
          size = "inherit";
        }
        return '<span class="bbcode-size-' + size + '" style="font-size: ' + size + ' !important; line-height: 1.3em;">';
      },
      closeTag: function(params,content) { return '</span>'; }
    },
    "spoiler": {
      openTag: function(params,content) { return '<span class="spoiler">'; },
      closeTag: function(params,content) { return '</span>'; }
    },
    "sub": {
      openTag: function(params,content) { return '<sub>'; },
      closeTag: function(params,content) { return '</sub>'; }
    },
    "sup": {
      openTag: function(params,content) { return '<sup>'; },
      closeTag: function(params,content) { return '</sup>'; }
    },
    "tt": {
      openTag: function(params,content) { return '<tt>'; },
      closeTag: function(params,content) { return '</tt>'; }
    },
    "time": {
      openTag: function(params, content) {
        var date = content || '';
        if (Number(date)) {
          date = 'ept-date=' + date;
        }
        else {
          date = new Date(date).getTime();
          date = 'ept-date=' + date;
        }
        return date;
      },
      closeTag: function(params, content) { return ''; },
      displayContent: false
    },
    "table": {
      openTag: function(params,content) { return '<table>'; },
      closeTag: function(params,content) { return '</table>'; },
      restrictChildrenTo: ["tbody","thead", "tfoot", "tr"]
    },
    "tbody": {
      openTag: function(params,content) { return '<tbody>'; },
      closeTag: function(params,content) { return '</tbody>'; },
      restrictChildrenTo: ["tr"],
      restrictParentsTo: ["table"]
    },
    "tfoot": {
      openTag: function(params,content) { return '<tfoot>'; },
      closeTag: function(params,content) { return '</tfoot>'; },
      restrictChildrenTo: ["tr"],
      restrictParentsTo: ["table"]
    },
    "thead": {
      openTag: function(params,content) { return '<thead>'; },
      closeTag: function(params,content) { return '</thead>'; },
      restrictChildrenTo: ["tr"],
      restrictParentsTo: ["table"]
    },
    "td": {
      openTag: function(params,content) { return '<td valign="top">'; },
      closeTag: function(params,content) { return '</td>'; },
      restrictParentsTo: ["tr"]
    },
    "th": {
      openTag: function(params,content) { return '<th>'; },
      closeTag: function(params,content) { return '</th>'; },
      restrictParentsTo: ["tr"]
    },
    "tr": {
      openTag: function(params,content) { return '<tr>'; },
      closeTag: function(params,content) { return '</tr>'; },
      restrictChildrenTo: ["td","th"],
      restrictParentsTo: ["table","tbody","tfoot","thead"]
    },
    "u": {
      openTag: function(params,content) {
        return '<u>';
      },
      closeTag: function(params,content) {
        return '</u>';
      }
    },
    "ul": {
      openTag: function(params,content) { return '<ul>'; },
      closeTag: function(params,content) { return '</ul>'; },
      restrictChildrenTo: ["*", "li"]
    },
    "url": {
      openTag: function(params,content) {
        var myUrl;

        if (!params) {  myUrl = content.replace(/<.*?>/g,''); }
        else { myUrl = params.substr(1); }

        myUrl = myUrl.trim();
        urlPattern.lastIndex = 0;
        if ( !urlPattern.test( myUrl ) ) {
          myUrl = "#";
        }

        return '<a href="' + myUrl + '" target="_blank">';
      },
      closeTag: function(params,content) {
        return '</a>';
      }
    },
    "white": {
      openTag: function(params,content) {
        return '<span class="bbcode-color-white" style="color: white;">';
      },
      closeTag: function(params,content) {
        return '</span>';
      }
    },
    /*
      The [*] tag is special since the user does not define a closing [/*] tag when writing their bbcode.
      Instead this module parses the code and adds the closing [/*] tag in for them. None of the tags you
      add will act like this and this tag is an exception to the others.
    */
    "*": {
      openTag: function(params,content) { return "<li>"; },
      closeTag: function(params,content) { return "</li>"; },
      restrictParentsTo: ["list","ul","ol"]
    }
  };

  // create tag list and lookup fields
  function initTags() {
    tagList = [];
    var prop,
        ii,
        len;

    for (prop in tags) {
      if (tags.hasOwnProperty(prop)) {
        if (prop === "*") {
          tagList.push("\\" + prop);
        }
        else {
          tagList.push(prop);
          if ( tags[prop].noParse ) {
            tagsNoParseList.push(prop);
          }
        }

        tags[prop].validChildLookup = {};
        tags[prop].validParentLookup = {};
        tags[prop].restrictParentsTo = tags[prop].restrictParentsTo || [];
        tags[prop].restrictChildrenTo = tags[prop].restrictChildrenTo || [];

        len = tags[prop].restrictChildrenTo.length;
        for (ii = 0; ii < len; ii++) {
          tags[prop].validChildLookup[ tags[prop].restrictChildrenTo[ii] ] = true;
        }
        len = tags[prop].restrictParentsTo.length;
        for (ii = 0; ii < len; ii++) {
          tags[prop].validParentLookup[ tags[prop].restrictParentsTo[ii] ] = true;
        }
      }
    }

    bbRegExp = new RegExp("<bbcl=([0-9]+) (" + tagList.join("|") + ")([ =][^>]*?)?>((?:.|[\\r\\n])*?)<bbcl=\\1 /\\2>", "gi");
    pbbRegExp = new RegExp("\\[(" + tagList.join("|") + ")([ =][^\\]]*?)?\\]([^\\[]*?)\\[/\\1\\]", "gi");
    pbbRegExp2 = new RegExp("\\[(" + tagsNoParseList.join("|") + ")([ =][^\\]]*?)?\\]([\\s\\S]*?)\\[/\\1\\]", "gi");

    // create the regex for escaping ['s that aren't apart of tags
    (function() {
      var closeTagList = [];
      for (var ii = 0; ii < tagList.length; ii++) {
        if ( tagList[ii] !== "\\*" ) { // the * tag doesn't have an offical closing tag
          closeTagList.push ( "/" + tagList[ii] );
        }
      }

      openTags = new RegExp("(\\[)((?:" + tagList.join("|") + ")(?:[ =][^\\]]*?)?)(\\])", "gi");
      closeTags = new RegExp("(\\[)(" + closeTagList.join("|") + ")(\\])", "gi");
    })();
  }

  initTags();

  // -----------------------------------------------------------------------------
  // private functions
  // -----------------------------------------------------------------------------

  function checkParentChildRestrictions(parentTag, bbcode, bbcodeLevel, tagName, tagParams, tagContents, errQueue) {
    errQueue = errQueue || [];
    bbcodeLevel++;

    // get a list of all of the child tags to this tag
    var reTagNames = new RegExp("(<bbcl=" + bbcodeLevel + " )(" + tagList.join("|") + ")([ =>])","gi"),
        reTagNamesParts = new RegExp("(<bbcl=" + bbcodeLevel + " )(" + tagList.join("|") + ")([ =>])","i"),
        matchingTags = tagContents.match(reTagNames) || [],
        cInfo,
        errStr,
        ii,
        childTag,
        pInfo = tags[parentTag] || {};

    reTagNames.lastIndex = 0;

    if (!matchingTags) { tagContents = ""; }

    for (ii = 0; ii < matchingTags.length; ii++) {
      reTagNamesParts.lastIndex = 0;
      childTag = (matchingTags[ii].match(reTagNamesParts))[2].toLowerCase();

      if ( pInfo && pInfo.restrictChildrenTo && pInfo.restrictChildrenTo.length > 0 ) {
        if ( !pInfo.validChildLookup[childTag] ) {
          errStr = "The tag \"" + childTag + "\" is not allowed as a child of the tag \"" + parentTag + "\".";
          errQueue.push(errStr);
        }
      }
      cInfo = tags[childTag] || {};
      if ( cInfo.restrictParentsTo.length > 0 ) {
        if ( !cInfo.validParentLookup[parentTag] ) {
          errStr = "The tag \"" + parentTag + "\" is not allowed as a parent of the tag \"" + childTag + "\".";
          errQueue.push(errStr);
        }
      }
    }

    tagContents = tagContents.replace(bbRegExp, function(matchStr, bbcodeLevel, tagName, tagParams, tagContents ) {
      errQueue = checkParentChildRestrictions(tagName, matchStr, bbcodeLevel, tagName, tagParams, tagContents, errQueue);
      return matchStr;
    });
    return errQueue;
  }

  /*
    This function updates or adds a piece of metadata to each tag called "bbcl" which
    indicates how deeply nested a particular tag was in the bbcode. This property is removed
    from the HTML code tags at the end of the processing.
  */
  function updateTagDepths(tagContents) {
    tagContents = tagContents.replace(/\<([^\>][^\>]*?)\>/gi, function(matchStr, subMatchStr) {
      var bbCodeLevel = subMatchStr.match(/^bbcl=([0-9]+) /);
      if (bbCodeLevel === null) {
        return "<bbcl=0 " + subMatchStr + ">";
      }
      else {
        return "<" + subMatchStr.replace(/^(bbcl=)([0-9]+)/, function(matchStr, m1, m2) {
          return m1 + (parseInt(m2, 10) + 1);
        }) + ">";
      }
    });
    return tagContents;
  }

  /*
    This function removes the metadata added by the updateTagDepths function
  */
  function unprocess(tagContent) {
    return tagContent.replace(/<bbcl=[0-9]+ \/\*>/gi,"").replace(/<bbcl=[0-9]+ /gi,"&#91;").replace(/>/gi,"&#93;");
  }

  var replaceFunct = function(matchStr, bbcodeLevel, tagName, tagParams, tagContents) {
    tagName = tagName.toLowerCase();

    var processedContent = tags[tagName].noParse ? unprocess(tagContents) : tagContents.replace(bbRegExp, replaceFunct),
        openTag = tags[tagName].openTag(tagParams,processedContent),
        closeTag = tags[tagName].closeTag(tagParams,processedContent);

    if ( tags[tagName].displayContent === false) {
      processedContent = "";
    }

    return openTag + processedContent + closeTag;
  };

  function parse(config) {
    var output = config.text;
    output = output.replace(bbRegExp, replaceFunct);
    return output;
  }

  /*
    The star tag [*] is special in that it does not use a closing tag. Since this parser requires that tags to have a closing
    tag, we must pre-process the input and add in closing tags [/*] for the star tag.
    We have a little levaridge in that we know the text we're processing wont contain the <> characters (they have been
    changed into their HTML entity form to prevent XSS and code injection), so we can use those characters as markers to
    help us define boundaries and figure out where to place the [/*] tags.
  */
  function fixStarTag(text) {
    text = text.replace(/\[(?!\*[ =\]]|list([ =][^\]]*)?\]|\/list[\]])/ig, "<");
    text = text.replace(/\[(?=list([ =][^\]]*)?\]|\/list[\]])/ig, ">");

    while (text !== (text = text.replace(/>list([ =][^\]]*)?\]([^>]*?)(>\/list])/gi, function(matchStr,contents,endTag) {
      var innerListTxt = matchStr;
      while (innerListTxt !== (innerListTxt = innerListTxt.replace(/\[\*\]([^\[]*?)(\[\*\]|>\/list])/i, function(matchStr,contents,endTag) {
        if (endTag === ">/list]") { endTag = "</*]</list]"; }
        else { endTag = "</*][*]"; }
        var tmp = "<*]" + contents + endTag;
        return tmp;
      })));

      innerListTxt = innerListTxt.replace(/>/g, "<");
      return innerListTxt;
    })));

    // add ['s for our tags back in
    text = text.replace(/</g, "[");
    return text;
  }

  function addBbcodeLevels(text) {
    var matchFunction = function(matchStr, tagName, tagParams, tagContents) {
      matchStr = matchStr.replace(/\[/g, "<");
      matchStr = matchStr.replace(/\]/g, ">");
      return updateTagDepths(matchStr);
    };

    while ( text !== (text = text.replace(pbbRegExp, matchFunction)));
    return text;
  }

  // -----------------------------------------------------------------------------
  // public functions
  // -----------------------------------------------------------------------------

  // API, Expose all available tags
  me.tags = function() { return tags; };

  // API
  me.addTags = function(newtags) {
    var tag;
    for (tag in newtags) {
      tags[tag] = newtags[tag];
    }
    initTags();
  };

  me.process = function(config) {
    var ret = { html: "", error: false };
    var errQueue = [];

    config.text = config.text.replace(/</g, "&lt;"); // escape HTML tag brackets
    config.text = config.text.replace(/>/g, "&gt;"); // escape HTML tag brackets

    config.text = config.text.replace(openTags, function(matchStr, openB, contents, closeB) {
      return "<" + contents + ">";
    });
    config.text = config.text.replace(closeTags, function(matchStr, openB, contents, closeB) {
      return "<" + contents + ">";
    });

    config.text = config.text.replace(/\[/g, "&#91;"); // escape ['s that aren't apart of tags
    config.text = config.text.replace(/\]/g, "&#93;"); // escape ['s that aren't apart of tags
    config.text = config.text.replace(/</g, "["); // escape ['s that aren't apart of tags
    config.text = config.text.replace(/>/g, "]"); // escape ['s that aren't apart of tags

    // process tags that don't have their content parsed
    while ( config.text !== (config.text = config.text.replace(pbbRegExp2, function(matchStr, tagName, tagParams, tagContents) {
      tagContents = tagContents.replace(/\[/g, "&#91;");
      tagContents = tagContents.replace(/\]/g, "&#93;");
      tagParams = tagParams || "";
      tagContents = tagContents || "";
      return "[" + tagName + tagParams + "]" + tagContents + "[/" + tagName + "]";
    })));

    config.text = fixStarTag(config.text); // add in closing tags for the [*] tag
    config.text = addBbcodeLevels(config.text); // add in level metadata

    errQueue = checkParentChildRestrictions("bbcode", config.text, -1, "", "", config.text);

    ret.html = parse(config);

    if ( ret.html.indexOf("[") !== -1 || ret.html.indexOf("]") !== -1) {
      errQueue.push("Some tags appear to be misaligned.");
    }

    if (config.removeMisalignedTags) {
      ret.html = ret.html.replace(/\[.*?\]/g,"");
    }
    if (config.addInLineBreaks) {
      ret.html = '<div style="white-space:pre;">' + ret.html + '</div>';
    }

    ret.html = ret.html.replace(/&#91;/g, "["); // put ['s back in
    ret.html = ret.html.replace(/&#93;/g, "]"); // put ['s back in

    ret.html = ret.html.replace(/&lt;/g, "<"); // unescape HTML tag brackets
    ret.html = ret.html.replace(/&gt;/g, ">"); // unescape HTML tag brackets

    ret.error = (errQueue.length === 0) ? false : true;
    ret.errorQueue = errQueue;

    return ret;
  };

  return me;
})();

module.exports = XBBCODE;
