## API
### Table of Contents
- [RandomJs(body, statusCb)](#randomjs)
- [RandomJs#request(statusCb)](#request)
- [RandomJs#apikey(value, statusCb)](#apikey)
- [RandomJs#jsonrpc(value, statusCb)](#jsonrpc)
- [RandomJs#method(value, statusCb)](#method)
- [RandomJs#params(value, statusCb)](#params)
- [RandomJs#id(value, statusCb)](#id)
- [RandomJs#url(value, statusCb)](#url)
- [RandomJs#uri(value, statusCb)](#uri)
- [RandomJs#callback(fn, statusCb)](#callback)
- [RandomJs#headers(object, statusCb)](#headers)
- [RandomJs#post(done, statusCb)](#post)

### RandomJs

- `[body]` **{Object}** body object that will send to api
- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs}**

```js
function RandomJs(body, statusCb) {
  if (!(this instanceof RandomJs)) {return new RandomJs(body, statusCb);}
  body = body || {};
  this._request = {};
  this._response = {};
  this._callback = function() {};

  this._url = 'https://api.random.org/json-rpc/1/invoke';

  this._request.url = this._url;
  this._request.json = true;

  this._request.body = {};
  this._request.body.jsonrpc = body.jsonrpc || '2.0';
  this._request.body.method = body.method || 'generateIntegers';
  this._request.body.params = body.params || methodDefaults.generateIntegers;
  this._request.body.id = body.id || (0 | Math.random() * 1000);
  
  this._body = this._request.body;

  if (statusCb) {statusCb(this._request);}
  return this;
}
```

#### #request

- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs|Object}** returns self or RandomJs._request object

```js
RandomJs.prototype.request = function(statusCb) {
  if (statusCb) {
    statusCb(this._request);
    return this;
  }
  else {
    return this._request;
  }
};
```

#### #apikey

- `<apikey>` **{String}** you api key with that you will auth to api
- `[statusCb]` **{Function}** callback that recieves request status  callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.apikey = function(value, statusCb) {
  this._body.params.apiKey = apikey;
  if (statusCb) {statusCb(this._request);}
  return this;
};
```

#### #jsonrpc

- `<value>` **{String}** 
- `[statusCb]` **{Function}** callback that recieves request status  callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.jsonrpc = function(value, statusCb) {
  this._body.jsonrpc = jsonrpc;
  if (statusCb) {statusCb(this._request);}
  return this;
};
```

#### #method

- `<value>` **{String}** 
- `[statusCb]` **{Function}** callback that recieves request status  callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.method = function(value, statusCb) {
  if (methodDefaults.hasOwnProperty(method)) {
    methodDefaults[method].apiKey = this._body.params.apiKey;
    this._body.method = method;
    this._body.params = methodDefaults[method];
  }
  if (statusCb) {statusCb(this._request);}
  return this;
};
```

#### #params

- `<value>` **{Object}** 
- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.params = function(value, statusCb) {
  if (typeof params === 'object') {
    for (var key in params) {
      if (this._body.params.hasOwnProperty(key) && this._body.params !== params[key]) {
        this._body.params[key] = params[key];
      }
    }
  }
  if (statusCb) {statusCb(this._request);}
  return this;
};
```

#### #id

- `<value>` **{Object}** 
- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.id = function(value, statusCb) {
  this._body.id = id;
  if (statusCb) {statusCb(this._request);}
  return this;
};
```

#### #url

- `<value>` **{String}** 
- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.url = function(value, statusCb) {
  this._url = url;
  if (statusCb) {statusCb(this._request);}
  return this;
};
```

#### #uri

- `<value>` **{String}** 
- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.uri = function(value, statusCb) {
  this.url(uri, statusCb);
  return this;
};
```

#### #callback

- `<fn>` **{Function}** 
- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.callback = function(fn, statusCb) {
  this._callback = fn;
  if (statusCb) {statusCb(this._request);}
  return this;
};
```

#### #headers

- `<object>` **{Object}** 
- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.headers = function(object, statusCb) {
  this._request.headers = headers;
  if (statusCb) {statusCb(this._request);}
  return this;
};
```

#### #post

- `<done>` **{Function}** callback that will handle response
- `[statusCb]` **{Function}** callback that recieves request status
- `return` **{RandomJs}**

```js
RandomJs.prototype.post = function(done, statusCb) {
  var cb = done || this._callback, finish = false;
  if (isNode && done) {
    Request.post(this._request, cb);
  } else if (isBrowser && done) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this._request.url, true);
    for (var header in this._request.headers) {
      xhr.setRequestHeader(header, this._request.headers[header]);
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(this._request.body));

    this._response = xhr;
    xhr.onreadystatechange = function () {
      if (!finish && xhr.readyState === 4) {
        cb(xhr, null, JSON.parse(xhr.responseText));
        finish = true;
      }
    }
  }
  if (statusCb) {statusCb(this._request);}
};


if (isNode) {
  module.exports = RandomJs;
} else {
  window.RandomJs = RandomJs;
}
//})();
```

