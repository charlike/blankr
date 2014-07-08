/*!
 * docks <https://github.com/tunnckoCore/docks>
 * @todo repo, npm, clean, template, docs
 * 
 * Copyright (c) 2014 Charlike Mike Reagent, contributors.
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var parser = require('./parser');
var reBlock = '\\/\\*\\*(.|[\\r\\n]|\\n)*?\\*\\/\\n?\\n?';


/**
 * ### Docks()
 * 
 * Initialize a new `Docks` instance with `content` to parse.
 *
 * **Example:**
 *
 * ```js
 * var Docks = require('docks');
 * var fs = require('fs');
 *
 * var content = fs.readFileSync('somefile.js', 'utf-8');
 * var docks = new Docks(content);
 * docks.parse();
 * ```
 * 
 * @param  {String}  content  optional, content to parse
 * @api public
 */

function Docks(content) {
  if (!(this instanceof Docks)) {return new Docks(content);}
  this.contents = content ? content : '';
  this._comments = [];
  this._sources = [];
  this._results = [];
  this.regex = new RegExp('^' + reBlock, 'gm');
}

/**
 * ### Docks#content()
 * Provide content from who to parse comments/sources
 * 
 * **Example:**
 *
 * ```js
 * var Docks = require('docks');
 * var fs = require('fs');
 *
 * var content = fs.readFileSync('somefile.js', 'utf-8');
 * var docks = new Docks();
 * docks
 *   .content(content)
 *   .parse();
 * ```
 * 
 * @param   {String}  content  optional, content to parse
 * @return  {Docks}
 * @api public
 */

Docks.prototype.content = function (content) {
  this.contents = content;
  return this;
};

/**
 * ### Docks#comments()
 * Get comments from previously given content
 * 
 * **Example:**
 *
 * ```js
 * var Docks = require('docks');
 * var fs = require('fs');
 *
 * var content = fs.readFileSync('somefile.js', 'utf-8');
 * var docks = new Docks();
 * docks
 *   .content(content)
 *   .comments();
 * ```
 *
 * @return  {Array}
 * @api public
 */

Docks.prototype.comments = function() {
  return this._comments;
};

/**
 * ### Docks#sources()
 * Get source for every comment,
 * from previously given content
 *
 * @return  {Array}
 * @api public
 */

Docks.prototype.sources = function() {
  return this._sources;
};

/**
 * ### Docks#result()
 * Get final parsed result 
 * from previously given content
 * 
 * **Example:**
 *
 * ```js
 * var Docks = require('docks');
 * var fs = require('fs');
 *
 * var content = fs.readFileSync('somefile.js', 'utf-8');
 * var docks = new Docks();
 * docks
 *   .content(content)
 *   .parse()
 *   .result();
 * ```
 *
 * @return  {Object}
 * @api public
 */

Docks.prototype.result = function() {
  return this._results;
};

/**
 * ### Docks#parseComments()
 * Parse only comments of given content
 * 
 * **Example:**
 *
 * ```js
 * var Docks = require('docks');
 * var fs = require('fs');
 *
 * var content = fs.readFileSync('somefile.js', 'utf-8');
 * var docks = new Docks();
 * docks
 *   .parseComments(content)
 *   .comments();
 * ```
 *
 * @param   {String}  content  optional, parse/extract `comments` of the given content
 * @return  {Docks}
 * @api public
 */

Docks.prototype.parseComments = function(content) {
  content = this.contents ? this.contents : content;
  this._comments = content.match(this.regex);
  return this;
};

/**
 * ### Docks#parseSources()
 * Parse only source of given content
 * 
 * **Example:**
 *
 * ```js
 * var Docks = require('docks');
 * var fs = require('fs');
 *
 * var content = fs.readFileSync('somefile.js', 'utf-8');
 * var docks = new Docks();
 * docks
 *   .parseSources(content)
 *   .sources();
 * ```
 *
 * @param   {String}  content  optional, parse/extract `sources` of the given content
 * @return  {Docks}
 * @api public
 */

Docks.prototype.parseSources = function(content) {
  content = this.contents ? this.contents : content;
  this._sources = content.split(this.regex).slice(1).filter(function(item, i) {
    return item[0] !== ' '
  });
  return this;
};

/**
 * ### Docks#parse()
 * Parse given content
 * 
 * **Example:**
 *
 * ```js
 * var Docks = require('docks');
 * var fs = require('fs');
 *
 * var content = fs.readFileSync('somefile.js', 'utf-8');
 * var docks = new Docks();
 * docks.parse(content);
 * ```
 *
 * @param   {String}  content  optional, content to parse
 * @return  {Object}           object with `comments` array and `sources` array
 * @api public
 */

Docks.prototype.parse = function (content) {
  var self = this;
  content = this.contents ? this.contents : content;
  this.parseComments(content);
  this.parseSources(content);

  this._comments.forEach(function(comment, index) {
    comment = parser.parseComment(comment);
    comment.isPrivate = comment.api && comment.api === 'private' ? true : false;
    comment.ignore = comment.description[2] !== '!' ? false : true;
    comment.source = self._sources[index]
    comment.context = self.parseCodeContext(comment.source);

    if (/`\@/gm.test(comment.description)) {
      comment.description = comment.description.replace(/`\@/gm, '@');
    }

    comment.description = comment.description.replace(/^\*\*\!?\n/, '');
    self._results.push(comment)
  });
  return this._results;
};

/**
 * ### Docks#parseCodeContext()
 * Parse the context from the given `str` of js.
 *
 * This method attempts to discover the context
 * for the comment based on it's code. Currently
 * supports:
 *
 *   - function statements
 *   - function expressions
 *   - prototype methods
 *   - prototype properties
 *   - methods
 *   - properties
 *   - declarations
 * 
 * @param   {String}  str 
 * @return  {Object}      
 * @api private
 */

Docks.prototype.parseCodeContext = function(content){
  var content = content.split('\n')[0];

  // function statement
  if (/^function ([\w$]+) *\(/.exec(content)) {
    return {
        type: 'function'
      , name: RegExp.$1
      , string: RegExp.$1 + '()'
    };
  // function expression
  } else if (/^var *([\w$]+)[ \t]*=[ \t]*function/.exec(content)) {
    return {
        type: 'function'
      , name: RegExp.$1
      , string: RegExp.$1 + '()'
    };
  // prototype method
  } else if (/^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*function/.exec(content)) {
    return {
        type: 'method'
      , constructor: RegExp.$1
      , cons: RegExp.$1
      , name: RegExp.$2
      , string: RegExp.$1 + '.prototype.' + RegExp.$2 + '()'
    };
  // prototype property
  } else if (/^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(content)) {
    return {
        type: 'property'
      , constructor: RegExp.$1
      , cons: RegExp.$1
      , name: RegExp.$2
      , value: RegExp.$3
      , string: RegExp.$1 + '.prototype.' + RegExp.$2
    };
  // method
  } else if (/^([\w$.]+)\.([\w$]+)[ \t]*=[ \t]*function/.exec(content)) {
    return {
        type: 'method'
      , receiver: RegExp.$1
      , name: RegExp.$2
      , string: RegExp.$1 + '.' + RegExp.$2 + '()'
    };
  // property
  } else if (/^([\w$]+)\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(content)) {
    return {
        type: 'property'
      , receiver: RegExp.$1
      , name: RegExp.$2
      , value: RegExp.$3
      , string: RegExp.$1 + '.' + RegExp.$2
    };
  // declaration
  } else if (/^var +([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(content)) {
    return {
        type: 'declaration'
      , name: RegExp.$1
      , value: RegExp.$2
      , string: RegExp.$1
    };
  }
};

/**
 * Expose `Docks`.
 */

module.exports = Docks;