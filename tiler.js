/* jshint undef: true,strict:true,trailing:true,loopfunc:true */
/* global document,window,HTMLElement */

(function() {

  'use strict';

  // prevent duplicate declaration
  if (window.Tiler) { return; }

  var

  //
  VERSION = '0.0.1',


  /*
   * Generate a unique string suitable for id attributes
   *
   * @param basename (String)
   * @return string
   */
  guid = function(basename) {
    return basename + '-' + parseInt(Math.random() * 100, 10) + '-' + parseInt(Math.random() * 1000, 10);
  },

  /*
   * Merge two objects into one, values in b take precedence over values in a
   *
   * @param a {Object}
   * @param b {Object}

   * @return Object
   */
  merge = function(a, b) {
    var o = {};
    for (var i in a) {
      o[i] = a[i];
    }
    if (! b) { return o; }
    for (i in b) {
      o[i] = b[i];
    }
    return o;
  },

  /*
   * Convert an array-like thing (ex: NodeList or arguments object) into a proper array
   *
   * @param list (array-like thing)
   * @return Array
   */
  arr = function(list) {
    var ret = [], i = 0;

    if (! list.length) { return ret; }

    for (i = 0; i < list.length; i++) {
      ret.push(list[i]);
    }

    return ret;
  },

  /*
   * Create an element with a set of attributes/values
   *
   * @param type (String)
   * @param attrs {Object}
   *
   * @return HTMLElement
   */
  makeElement = function(type, attrs) {
     var
     n = document.createElement(type),
     i = null;

     for (i in attrs) {
       n.setAttribute(i, attrs[i]);
     }
     return n;
  },

  /*
   * Retrieve an object containing { top : xx, left : xx, bottom: xx, right: xx, width: xx, height: xx }
   *
   * @param node (DOMNode)
   */
  getRect = function(node) {

    var
    rect = node.getBoundingClientRect(),
    ret = { top : rect.top, left : rect.left, bottom: rect.bottom, right : rect.right }; // create a new object that is not read-only

    ret.top += window.pageYOffset;
    ret.left += window.pageXOffset;

    ret.bottom += window.pageYOffset;
    ret.right += window.pageYOffset;

    ret.width = rect.right - rect.left;
    ret.height = rect.bottom - rect.top;

    return ret;
  },

  /*
   * Retrieve object containing popover data for an element on the page
   *
   * @param scope {Popover}
   * @param node {
   * @return {Object}
   */
  getDataForNode = function(scope, node) {

    var
    val = scope.factory ? scope.factory(node) : node.getAttribute(ATTR),
    data = scope.defaults;

    if (typeof val != "object") {
      try {
        val = JSON.parse(val);

        if (typeof val === 'number') {
          val = { content : val };
        }

      } catch (err) {
        val = { content : val };
      }
    }

    return merge(data, val);
  },

  /**
   * Greatest common divisor
   *
   * @param a
   * @param b
   * @return 
   */
  gcd = function(a, b) {
    if ( ! b) {
      return a;
    }
    return gcd(b, a % b);
  },

  /*
   *
   * @param node {HTMLElement}
   * @param styles {Object}
   */
  setStyles  = function(node, styles) {
    for (var i in styles) {
      node.style[i] = styles[i];
    }
  };

  /**
   *
   *
   * @param node (node, optional) - the root element containing all elements with attached popovers
   * @param options (Object, optional) method to retrieve the popover's data for a given node
   */
  window.Tiler = function(config, defaults) {

    var
    $ = this,
    i = 0,
    n,
    node,
    on,
    l,
    scale = 2,
    data,
    defaultConfig = {
      debug : false,
      constrain : false,
      zoom : false,
      root : document.body,
      scale : 1,
      interval: 1000,
      events : { on : function(id) { console.log(id); }  }
    };

    config = merge(defaultConfig, config);

    /**
      
    */
    this.interval = config.interval;

    this.debug = config.debug;
    this.events = config.events;
    this.data = config.data;
//    this.listeners = {};

//    console.log(config);

    node = config.root ? (config.root instanceof HTMLElement ? config.root : document.querySelector(config.root)) : document.body;

    if (! node) {
      throw Error('Invalid Tiler root [' + config.root + ']');
    }

    this.root = node;
    if (config.zoom) {
      this.root.classList.add('zoom');
    }

//    this.root.innerHTML = window.location + ' ' + window.location.hash;
//    return;

    var
    styles = window.getComputedStyle(node),
    width = parseInt(styles.width),
    height = parseInt(styles.height),
    dimension = gcd(width, height) / config.scale,
    numberOfTiles = width * height / dimension / dimension,
    tile = null,
    index = 0;

    for (i = 0; i < numberOfTiles; i++) {

      tile = document.createElement('div');
      tile.className = 'container off';

      if (config.constrain) {
        if (i == 0)                                                { tile.className += ' topleft'; }
        else if (i == numberOfTiles - 1)                           { tile.className += ' bottomright'; }
        else if (i == (width / dimension) - 1)                     { tile.className += ' topright';  }
        else if (i == numberOfTiles - 1 - 1 - (width / dimension)) { tile.className += ' bottomleft'; }
        else if (i < (width / dimension))                          { tile.className += ' top'; }
        else if (i > numberOfTiles - 1 - (width / dimension))      { tile.className += ' bottom'; }
        else if (i % (width / dimension) == 0)                     { tile.className += ' left'; }
        else if (i % (width / dimension) == width / dimension - 1) { tile.className += ' right'; }
      }

      tile.innerHTML = '<div class="tile"><section class="front"><figure></figure></section><section class="back"><figure></figure></section>';
      index = Math.floor(Math.random() * this.data.length);

      tile.style.width = dimension + 'px';
      tile.style.height = dimension + 'px';

      tile.querySelector('.front figure').className = this.data[index];
      index = Math.floor(Math.random() * this.data.length);
      tile.querySelector('.back figure').className = this.data[index];

      this.root.appendChild(tile);

      window.setTimeout(function() {  this.classList.remove('off'); }.bind(tile), i * 25);
    }

    this.root.addEventListener('click', function(e) {
      if ($.events && $.events.on) {
        $.events.on(e.target.className);
      }
    });

    window.setTimeout(function() {

      var scope = arguments[0];
      scope.root.classList.add('init');
      scope.timeout = window.setInterval(function() {
        scope.randomize();
      }, scope.interval);

      }, numberOfTiles * 25 + 1000, $);

    this.randomize = function() {

      var
      tiles = this.root.querySelectorAll('.tile'),
      tileIndex = Math.floor(Math.random() * tiles.length),
      dataIndex = Math.floor(Math.random() * this.data.length);

      tiles[tileIndex].querySelector(tiles[tileIndex].classList.contains('flipped') ? '.front figure'  : '.back figure').className = this.data[dataIndex];
      tiles[tileIndex].classList.toggle('flipped');
    };

    this.destroy = function() {
      return this;
    };

    if (this.debug) { window.console.log(this.toString()); }
  };

  /*!
   * Attach a listener to `pop`/`unpop` events
   *
   * @param event {String} - one of `pop` or `unpop`
   * @param method {Function} - the method that will be invoked on the relevant event
   * @chainable
  window.Tiler.prototype.on = function(event, method) {
    this.events[event] = method;
    return this;
  };
   */

  /**
   * Return a string representation of the instance
   *
   * @return {String}
   */
  window.Tiler.prototype.toString = function() {
    return 'Tiler ' + JSON.stringify({root : '' + this.root, delay : this.interval, debug : this.debug});
  };

}());
