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
var XBBCODE = (function () {
    "use strict";

    // -----------------------------------------------------------------------------
    // Set up private variables
    // -----------------------------------------------------------------------------

    var me = {},
        imgPattern = /^((?:https?|file|c):(?:\/{1,3}|\\{1})|\/)[-a-zA-Z0-9:;!@#%&()~_?\+=\/\\\.]*$/,
        urlPattern = /^(?:http(s)?|file|c):(?:\/{1,3}|\\{1})[\A-Za-z0-9\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC.-]+(?:\.[A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\.-]+)+[A-Za-z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\-\._~:/?#[\]@!\$&'\(\)\*\+,%;=.]+$/,
        ftpPattern = /^(?:ftps?|c):(?:\/{1,3}|\\{1})[-a-zA-Z0-9:;@#%&()~_?\+=\/\\\.]*$/,
        colorCodePattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/,
        sizePattern = /([1-9][\d]?p[xt]|(?:x-)?small(?:er)?|(?:x-)?large[r]?)/,
        anchorPattern = /[#]?([A-Za-z][A-Za-z0-9_-]*)/,
        smfQuotePattern = /(?:board=\d+;)?((?:topic|threadid)=[\dmsg#\.\/]{1,40}(?:;start=[\dmsg#\.\/]{1,40})?|action=profile;u=\d+)/,
        eptQuotePattern = /^\/threads\/[a-z0-9\-\_]*\/posts[a-z0-9?\=\-#\&\_]*/i,
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

    tags = {
        "anchor": {
            openTag: function (params) {
                var id = params || '';
                id = id.substr(1) || '';
                if (!anchorPattern.test(id)) {
                    id = '';
                }
                return '<span id="post_' + id + '">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "abbr": {
            openTag: function (params) {
                var title = params || '';
                title = title.substr(1) || '';
                title = title.replace(/<.*?>/g, '');
                return '<abbr title="' + title + '">';
            },
            closeTag: function () {
                return '</abbr>';
            }
        },
        "acronym": {
            openTag: function (params) {
                var title = params || '';
                title = title.substr(1) || '';
                title = title.replace(/<.*?>/g, '');
                return '<acronym title="' + title + '">';
            },
            closeTag: function () {
                return '</acronym>';
            }
        },
        "black": {
            openTag: function () {
                return '<span style="color: black;">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "blue": {
            openTag: function () {
                return '<span style="color: blue;">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "green": {
            openTag: function () {
                return '<span style="color: green;">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "red": {
            openTag: function () {
                return '<span style="color: red;">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "white": {
            openTag: function () {
                return '<span style="color: white;">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "b": {
            openTag: function () {
                return '<b>';
            },
            closeTag: function () {
                return '</b>';
            }
        },
        /*
         This tag does nothing and is here mostly to be used as a classification for
         the bbcode input when evaluating parent-child tag relationships
         */
        "bbcode": {
            openTag: function () {
                return '';
            },
            closeTag: function () {
                return '';
            }
        },
        "br": {
            openTag: function () {
                return '<br />';
            },
            closeTag: function () {
                return '';
            }
        },
        "hr": {
            openTag: function () {
                return '<hr />';
            },
            closeTag: function () {
                return '';
            }
        },
        "center": {
            openTag: function () {
                return '<div align="center">';
            },
            closeTag: function () {
                return '</div>';
            }
        },
        "code": {
            openTag: function () {
                return '<code>';
            },
            closeTag: function () {
                return '</code>';
            },
            noParse: true
        },
        "color": {
            openTag: function (params) {
                var colorCode = params || '=black';
                colorCode = colorCode.substr(1) || "black";
                colorCode = colorCode.toLowerCase();
                colorCode = colorCode.trim();

                var simpleColor = colorCode.replace(/#/gi, '_');

                return '<span class="bbcode-color-' + simpleColor + '" style="color:' + colorCode + '; display: inline-block;">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "columns": {
            openTag: function () {
                return '<table class="bbcode-columns"><tbody><tr><td class="bbcode-column bbcode-firstcolumn">';
            },
            closeTag: function () {
                return '</td></tr></tbody></table>';
            }
        },
        "email": {
            openTag: function (params, content) {
                var myEmail;
                if (!params) {
                    myEmail = content.replace(/<.*?>/g, '');
                }
                else {
                    myEmail = params.substr(1);
                }

                myEmail = myEmail.trim();
                emailPattern.lastIndex = 0;
                if (!emailPattern.test(myEmail)) {
                    return '<a>';
                }

                return '<a href="mailto:' + myEmail + '" target="_blank">';
            },
            closeTag: function () {
                return '</a>';
            }
        },
        "ftp": {
            openTag: function (params, content) {
                var thisFtp = "";
                if (!params) {
                    thisFtp = content.replace(/<.*?>/g, '');
                }
                else {
                    thisFtp = params.substr(1);
                }

                thisFtp = thisFtp.trim();
                ftpPattern.lastIndex = 0;
                if (!ftpPattern.test(thisFtp)) {
                    return '<a target="_blank">';
                }
                return '<a href="' + thisFtp + '" target="_blank">';
            },
            closeTag: function () {
                return '</a>';
            }
        },
        "font": {
            openTag: function (params) {
                var faceCode = params.substr(1) || 'inherit';
                faceCode = faceCode.trim();

                return '<span style="font-family:' + faceCode + '">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "glow": {
            openTag: function (params) {
                var options = params.substr(1) || '';
                options = options.replace(/<.*?>/g, '');

                var simpleColor = 'inherit';
                var color = options.split(',')[0];
                color = color.trim();
                color = color.toLowerCase();
                colorCodePattern.lastIndex = 0;
                if (colorCodePattern.test(color)) {
                    simpleColor = color.replace(/#/gi, '_')
                }
                else {
                    simpleColor = color;
                }


                return '<span class="bbcode-bgcolor-' + simpleColor + '" style="background-color: ' + color + '">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "html": {
            openTag: function () {
                return '';
            },
            closeTag: function () {
                return '';
            }
        },
        "i": {
            openTag: function () {
                return '<i>';
            },
            closeTag: function () {
                return '</i>';
            }
        },
        "img": {
            openTag: function (params, content) {
                // url
                var myUrl = content;
                myUrl = myUrl.trim();
                myUrl = myUrl.replace(/ /g, '%20');
                imgPattern.lastIndex = 0;
                if (!imgPattern.test(myUrl)) {
                    myUrl = "";
                }
                if (!params) {
                    return '<img src="' + myUrl + '" />';
                }

                // params
                var options = params;
                options = options.trim();
                options = options.replace(/<.*?>/g, '');
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
                if (alt) {
                    tag += 'alt="' + alt + '" ';
                }
                if (width) {
                    tag += 'width="' + width + '" ';
                }
                if (height) {
                    tag += 'height="' + height + '" ';
                }
                tag += '/>';
                return tag;
            },
            closeTag: function () {
                return '';
            },
            displayContent: false
        },
        "iurl": {
            openTag: function (params, content) {
                var myUrl;

                if (!params) {
                    myUrl = content.replace(/<.*?>/g, "");
                }
                else {
                    myUrl = params.substr(1);
                }

                myUrl = myUrl.trim();
                myUrl = myUrl.replace(/ /g, '%20');
                return '<a href="#post_' + myUrl + '">';
            },
            closeTag: function () {
                return '</a>';
            }
        },
        "justify": {
            openTag: function () {
                return "<div class='bbcode-text-justify' style='text-align: justify;'>";
            },
            closeTag: function () {
                return "</div>";
            }
        },
        "left": {
            openTag: function () {
                return '<div class="bbcode-text-left" style="text-align: left;">';
            },
            closeTag: function () {
                return '</div>';
            }
        },
        "li": {
            openTag: function () {
                return "<li>";
            },
            closeTag: function () {
                return "</li>";
            },
            restrictParentsTo: ["list", "ul", "ol"]
        },
        "list": {
            openTag: function (params) {
                var tag = '<ul>';

                // clean input
                var type = params || '';
                type = type.trim();
                type = type.replace(/<.*?>/g, '');

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
            closeTag: function () {
                return '</ul>';
            },
            restrictChildrenTo: ["*", "li"]
        },
        "ltr": {
            openTag: function () {
                return '<div dir="ltr">';
            },
            closeTag: function () {
                return '</div>';
            }
        },
        "me": {
            openTag: function (params, content) {
                var name = params || '';
                name = name.substr(1);
                name = name.replace(/<.*?>/g, "");
                name = name.trim();
                if (content) {
                    name = name + " ";
                }
                return '<div class="bbcode-color-red" style="color: red;">* ' + name + ' ';
            },
            closeTag: function () {
                return '</div>';
            }
        },
        "move": {
            openTag: function () {
                return '<div>';
            },
            closeTag: function () {
                return '</div>';
            }
        },
        "noparse": {
            openTag: function () {
                return '';
            },
            closeTag: function () {
                return '';
            },
            noParse: true
        },
        "nobbc": {
            openTag: function () {
                return '';
            },
            closeTag: function () {
                return '';
            },
            noParse: true
        },
        "ol": {
            openTag: function () {
                return '<ol>';
            },
            closeTag: function () {
                return '</ol>';
            },
            restrictChildrenTo: ["*", "li"]
        },
        "pre": {
            openTag: function () {
                return '<pre>';
            },
            closeTag: function () {
                return '</pre>';
            }
        },
        "php": {
            openTag: function () {
                return '<pre>';
            },
            closeTag: function () {
                return '</pre>';
            },
            noParse: true
        },
        "quote": {
            openTag: function (params) {
                // default: no author, link or date
                var quoteHeader = '<div class="quoteHeader">Quote</div>';
                var quote = '<div class="quote">';

                // clean params
                var options = params || '';
                options = options.trim();
                options = options.replace(/<.*?>/g, '');

                // case 1: no params
                if (options === '') {
                    return quoteHeader + quote;
                }

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
                    var quoteAuthor = options.substr(refString.indexOf('author="') + 7);
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
                            if (!smfQuotePattern.test(link) && !eptQuotePattern.test(link)) {
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

                // author date
                if (author && date) {
                    quoteHeader = '<div class="quoteHeader">';
                    quoteHeader += 'Quote From: ' + author + ' on ept-date=' + date;
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
            closeTag: function () {
                return '</div>';
            }
        },
        "right": {
            openTag: function () {
                return '<div class="bbcode-text-right" style="text-align: right;">';
            },
            closeTag: function () {
                return '</div>';
            }
        },
        "rtl": {
            openTag: function () {
                return '<div dir="rtl">';
            },
            closeTag: function () {
                return '</div>';
            }
        },
        "s": {
            openTag: function () {
                return '<del>';
            },
            closeTag: function () {
                return '</del>';
            }
        },
        "shadow": {
            openTag: function (params) {
                var shadow, color, direction, blur;
                var dirPattern = /^(?:left|right|top|bottom)$/;
                var numberPattern = /^[0-9]\d{0,2}$/;

                // params = color, direction, blur
                var options = params.substr(1) || '';
                options = options.replace(/<.*?>/g, '');
                if (options.indexOf(',') < 0) {
                    return '<span>';
                }

                // color
                color = options.split(',')[0];
                color = color.trim();
                color = color.toLowerCase();

                // direction
                direction = options.split(',')[1] || '';
                direction = direction.trim();
                // check if direction or angle
                if (!direction) {
                    direction = ' 0 0';
                }
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
                    var radian = direction * 0.0174532925;
                    direction = ' ' + Math.round(4 * Math.cos(radian)) + 'px';
                    direction += ' ' + Math.round(-4 * Math.sin(radian)) + 'px';
                }
                else {
                    direction = ' 0 0';
                }

                // blur
                blur = options.split(',')[2] || '';
                blur = blur.trim();
                if (!blur) {
                    blur = ' 0';
                }
                else if (numberPattern.test(blur)) {
                    blur = ' ' + blur + 'px';
                }
                else {
                    blur = ' 0';
                }

                // final output
                shadow = color + direction + blur;
                var simpleShadow = shadow.replace(/\s/gi, '_');
                simpleShadow = simpleShadow.replace(/#/gi, '_');
                return '<span class="bbcode-shadow-' + simpleShadow + '" style="text-shadow: ' + shadow + '">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "size": {
            openTag: function (params) {
                var size = params || '';
                size = size.substr(1) || "inherit";
                size = size.trim();
                sizePattern.lastIndex = 0;
                if (!sizePattern.test(size)) {
                    size = "inherit";
                }
                return '<span class="bbcode-size-' + size + '" style="font-size: ' + size + ' !important; line-height: 1.3em;">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "spoiler": {
            openTag: function () {
                return '<span class="spoiler">';
            },
            closeTag: function () {
                return '</span>';
            }
        },
        "sub": {
            openTag: function () {
                return '<sub>';
            },
            closeTag: function () {
                return '</sub>';
            }
        },
        "sup": {
            openTag: function () {
                return '<sup>';
            },
            closeTag: function () {
                return '</sup>';
            }
        },
        "tt": {
            openTag: function () {
                return '<tt>';
            },
            closeTag: function () {
                return '</tt>';
            }
        },
        "time": {
            openTag: function (params, content) {
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
            closeTag: function () {
                return '';
            },
            displayContent: false
        },
        "table": {
            openTag: function () {
                return '<table>';
            },
            closeTag: function () {
                return '</table>';
            },
            restrictChildrenTo: ["tbody", "thead", "tfoot", "tr"]
        },
        "tbody": {
            openTag: function () {
                return '<tbody>';
            },
            closeTag: function () {
                return '</tbody>';
            },
            restrictChildrenTo: ["tr"],
            restrictParentsTo: ["table"]
        },
        "tfoot": {
            openTag: function () {
                return '<tfoot>';
            },
            closeTag: function () {
                return '</tfoot>';
            },
            restrictChildrenTo: ["tr"],
            restrictParentsTo: ["table"]
        },
        "thead": {
            openTag: function () {
                return '<thead>';
            },
            closeTag: function () {
                return '</thead>';
            },
            restrictChildrenTo: ["tr"],
            restrictParentsTo: ["table"]
        },
        "td": {
            openTag: function () {
                return '<td valign="top">';
            },
            closeTag: function () {
                return '</td>';
            },
            restrictParentsTo: ["tr"]
        },
        "th": {
            openTag: function () {
                return '<th>';
            },
            closeTag: function () {
                return '</th>';
            },
            restrictParentsTo: ["tr"]
        },
        "tr": {
            openTag: function () {
                return '<tr>';
            },
            closeTag: function () {
                return '</tr>';
            },
            restrictChildrenTo: ["td", "th"],
            restrictParentsTo: ["table", "tbody", "tfoot", "thead"]
        },
        "u": {
            openTag: function () {
                return '<u>';
            },
            closeTag: function () {
                return '</u>';
            }
        },
        "ul": {
            openTag: function () {
                return '<ul>';
            },
            closeTag: function () {
                return '</ul>';
            },
            restrictChildrenTo: ["*", "li"]
        },
        "url": {
            openTag: function (params, content) {
                var myUrl;

                if (!params) {
                    myUrl = content.replace(/<.*?>/g, '');
                }
                else {
                    myUrl = params.substr(1);
                }

                myUrl = myUrl.trim();
                myUrl = myUrl.replace(/ /g, '%20');
                urlPattern.lastIndex = 0;
                if (!urlPattern.test(myUrl)) {
                    myUrl = "//" + myUrl;
                }

                return '<a href="' + myUrl + '" target="_blank">';
            },
            closeTag: function () {
                return '</a>';
            }
        },
        /*
         The [*] tag is special since the user does not define a closing [/*] tag when writing their bbcode.
         Instead this module parses the code and adds the closing [/*] tag in for them. None of the tags you
         add will act like this and this tag is an exception to the others.
         */
        "*": {
            openTag: function () {
                return "<li>";
            },
            closeTag: function () {
                return "</li>";
            },
            restrictParentsTo: ["list", "ul", "ol"]
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
                    if (tags[prop].noParse) {
                        tagsNoParseList.push(prop);
                    }
                }

                tags[prop].validChildLookup = {};
                tags[prop].validParentLookup = {};
                tags[prop].restrictParentsTo = tags[prop].restrictParentsTo || [];
                tags[prop].restrictChildrenTo = tags[prop].restrictChildrenTo || [];

                len = tags[prop].restrictChildrenTo.length;
                for (ii = 0; ii < len; ii++) {
                    tags[prop].validChildLookup[tags[prop].restrictChildrenTo[ii]] = true;
                }
                len = tags[prop].restrictParentsTo.length;
                for (ii = 0; ii < len; ii++) {
                    tags[prop].validParentLookup[tags[prop].restrictParentsTo[ii]] = true;
                }
            }
        }

        bbRegExp = new RegExp("<bbcl=([0-9]+) (" + tagList.join("|") + ")([ =][^>]*?)?>((?:.|[\\r\\n])*?)<bbcl=\\1 /\\2>", "gi");
        pbbRegExp = new RegExp("\\[(" + tagList.join("|") + ")([ =][^\\]]*?)?\\]([^\\[]*?)\\[/\\1\\]", "gi");
        pbbRegExp2 = new RegExp("\\[(" + tagsNoParseList.join("|") + ")([ =][^\\]]*?)?\\]([\\s\\S]*?)\\[/\\1\\]", "gi");

        // create the regex for escaping ['s that aren't apart of tags
        (function () {
            var closeTagList = [];
            for (var ii = 0; ii < tagList.length; ii++) {
                if (tagList[ii] !== "\\*") { // the * tag doesn't have an offical closing tag
                    closeTagList.push("/" + tagList[ii]);
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
        var reTagNames = new RegExp("(<bbcl=" + bbcodeLevel + " )(" + tagList.join("|") + ")([ =>])", "gi"),
            reTagNamesParts = new RegExp("(<bbcl=" + bbcodeLevel + " )(" + tagList.join("|") + ")([ =>])", "i"),
            matchingTags = tagContents.match(reTagNames) || [],
            cInfo,
            errStr,
            ii,
            childTag,
            pInfo = tags[parentTag] || {};

        reTagNames.lastIndex = 0;

        if (!matchingTags) {
            tagContents = "";
        }

        for (ii = 0; ii < matchingTags.length; ii++) {
            reTagNamesParts.lastIndex = 0;
            childTag = (matchingTags[ii].match(reTagNamesParts))[2].toLowerCase();

            if (pInfo && pInfo.restrictChildrenTo && pInfo.restrictChildrenTo.length > 0) {
                if (!pInfo.validChildLookup[childTag]) {
                    errStr = "The tag \"" + childTag + "\" is not allowed as a child of the tag \"" + parentTag + "\".";
                    errQueue.push(errStr);
                }
            }
            cInfo = tags[childTag] || {};
            if (cInfo.restrictParentsTo.length > 0) {
                if (!cInfo.validParentLookup[parentTag]) {
                    errStr = "The tag \"" + parentTag + "\" is not allowed as a parent of the tag \"" + childTag + "\".";
                    errQueue.push(errStr);
                }
            }
        }

        tagContents = tagContents.replace(bbRegExp, function (matchStr, bbcodeLevel, tagName, tagParams, tagContents) {
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
        tagContents = tagContents.replace(/\<([^\>][^\>]*?)\>/gi, function (matchStr, subMatchStr) {
            var bbCodeLevel = subMatchStr.match(/^bbcl=([0-9]+) /);
            if (bbCodeLevel === null) {
                return "<bbcl=0 " + subMatchStr + ">";
            }
            else {
                return "<" + subMatchStr.replace(/^(bbcl=)([0-9]+)/, function (matchStr, m1, m2) {
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
        return tagContent.replace(/<bbcl=[0-9]+ \/\*>/gi, "").replace(/<bbcl=[0-9]+ /gi, "&#91;").replace(/>/gi, "&#93;");
    }

    var replaceFunct = function (matchStr, bbcodeLevel, tagName, tagParams, tagContents) {
        tagName = tagName.toLowerCase();

        var processedContent = tags[tagName].noParse ? unprocess(tagContents) : tagContents.replace(bbRegExp, replaceFunct),
            openTag = tags[tagName].openTag(tagParams, processedContent),
            closeTag = tags[tagName].closeTag(tagParams, processedContent);

        if (tags[tagName].displayContent === false) {
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

        while (text !== (text = text.replace(/>list([ =][^\]]*)?\]([^>]*?)(>\/list])/gi, function (matchStr, contents, endTag) {
            var innerListTxt = matchStr;
            while (innerListTxt !== (innerListTxt = innerListTxt.replace(/\[\*\]([^\[]*?)(\[\*\]|>\/list])/i, function (matchStr, contents, endTag) {
                if (endTag === ">/list]") {
                    endTag = "</*]</list]";
                }
                else {
                    endTag = "</*][*]";
                }
                return "<*]" + contents + endTag;
            })));

            innerListTxt = innerListTxt.replace(/>/g, "<");
            return innerListTxt;
        })));

        // add ['s for our tags back in
        text = text.replace(/</g, "[");
        return text;
    }

    function fixSelfClosingTags(text) {
        text.replace('[/br]', '');
        text.replace('[/hr]', '');

        var selfClosingTags = [
            { bbcode: /\[br\s*\/?\]/gi, fix: '[br][/br]' },
            { bbcode: /\[hr\s*\/?\]/gi, fix: '[hr][/hr]' }
        ];

        selfClosingTags.forEach(function(data) {
            text = text.replace(data.bbcode, data.fix);
        });
        return text;
    }

    function addBbcodeLevels(text) {
        var matchFunction = function (matchStr, tagName, tagParams, tagContents) {
            matchStr = matchStr.replace(/\[/g, "<");
            matchStr = matchStr.replace(/\]/g, ">");
            return updateTagDepths(matchStr);
        };

        while (text !== (text = text.replace(pbbRegExp, matchFunction)));
        return text;
    }

    // -----------------------------------------------------------------------------
    // public functions
    // -----------------------------------------------------------------------------

    // API
    me.process = function (config) {
        var ret = {html: "", error: false};

        config.text = config.text.replace(/</g, "&lt;"); // escape HTML tag brackets
        config.text = config.text.replace(/>/g, "&gt;"); // escape HTML tag brackets

        config.text = config.text.replace(openTags, function (matchStr, openB, contents, closeB) {
            return "<" + contents + ">";
        });
        config.text = config.text.replace(closeTags, function (matchStr, openB, contents, closeB) {
            return "<" + contents + ">";
        });
        config.text = config.text.replace(/\[/g, "&#91;"); // escape ['s that aren't apart of tags
        config.text = config.text.replace(/\]/g, "&#93;"); // escape ['s that aren't apart of tags
        config.text = config.text.replace(/</g, "["); // escape ['s that aren't apart of tags
        config.text = config.text.replace(/>/g, "]"); // escape ['s that aren't apart of tags

        // process tags that don't have their content parsed
        while (config.text !== (config.text = config.text.replace(pbbRegExp2, function (matchStr, tagName, tagParams, tagContents) {
            tagContents = tagContents.replace(/\[/g, "&#91;");
            tagContents = tagContents.replace(/\]/g, "&#93;");
            tagParams = tagParams || "";
            tagContents = tagContents || "";
            return "[" + tagName + tagParams + "]" + tagContents + "[/" + tagName + "]";
        })));

        config.text = fixStarTag(config.text); // add in closing tags for the [*] tag

        config.text = fixSelfClosingTags(config.text); // add closing tag for self closing tags
        config.text = addBbcodeLevels(config.text); // add in level metadata

        var errQueue = checkParentChildRestrictions("bbcode", config.text, -1, "", "", config.text);

        ret.html = parse(config);

        if (ret.html.indexOf("[") !== -1 || ret.html.indexOf("]") !== -1) {
            errQueue.push("Some tags appear to be misaligned.");
        }

        if (config.removeMisalignedTags) {
            ret.html = ret.html.replace(/\[.*?\]/g, "");
        }
        if (config.addInLineBreaks) {
            ret.html = '<div style="white-space:pre;">' + ret.html + '</div>';
        }

        ret.html = ret.html.replace(/&#91;/g, "["); // put ['s back in
        ret.html = ret.html.replace(/&#93;/g, "]"); // put ['s back in

        ret.html = ret.html.replace(/&lt;/g, "<"); // unescape HTML tag brackets
        ret.html = ret.html.replace(/&gt;/g, ">"); // unescape HTML tag brackets

        ret.error = (errQueue.length !== 0);
        ret.errorQueue = errQueue;
        return ret;
    };

    return me;
})();

module.exports = XBBCODE;
