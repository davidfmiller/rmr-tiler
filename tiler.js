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
    l,
    scale = 2,
    data,
    styles = {},
    width = 0,
    height = 0,
    dimension = 0,
    numberOfTiles = 0,
    tile = null,
    index = 0,
    defaultConfig = {

      /**
        Toggle magnification of tiles when hovered over
       */
      zoom : false,

      /**
        When zoom is enabled, constrain tiles to *not* overflow the root container
       */
      constrain : false,

      /**
        Root node in the document for the tiler
       */
      root : document.body,

      /**
        Number of tiles that will be created in each dimension
       */
      scale : 1,

      /**
        Number of milliseconds between tile flips
       */
      interval: 1000,

      /**
        Number of milliseconds between tile flips
       */
      events : {
        click : function(id) {
          //console.log('click ' + id);
        },
        flip : function(back, front) {
          //console.log('flip ' + back + ' ' + front);
        }
      }
    };

    config = merge(defaultConfig, config);

    /**
      
    */
    this.interval = config.interval;

    this.events = config.events;
    this.data = config.data;
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

    styles = window.getComputedStyle(node);
    width = parseInt(styles.width);
    height = parseInt(styles.height);
    dimension = gcd(width, height) / config.scale;
    numberOfTiles = width * height / dimension / dimension;

    for (i = 0; i < numberOfTiles; i++) {

      tile = document.createElement('div');
      tile.className = 'container off';

      if (config.constrain) {
        if (i === 0)                                                { tile.className += ' topleft'; }
        else if (i === numberOfTiles - 1)                           { tile.className += ' bottomright'; }
        else if (i === (width / dimension) - 1)                     { tile.className += ' topright';  }
        else if (i === numberOfTiles - 1 - 1 - (width / dimension)) { tile.className += ' bottomleft'; }
        else if (i < (width / dimension))                          { tile.className += ' top'; }
        else if (i > numberOfTiles - 1 - (width / dimension))      { tile.className += ' bottom'; }
        else if (i % (width / dimension) === 0)                     { tile.className += ' left'; }
        else if (i % (width / dimension) === width / dimension - 1) { tile.className += ' right'; }
      }

      tile.innerHTML = '<div class="tile"><section class="front"><figure></figure></section><section class="back"><figure></figure></section>';
      index = Math.floor(Math.random() * this.data.length);

      setStyles(tile, { width : dimension + 'px', height : dimension + 'px' });

      tile.querySelector('.front figure').className = this.data[index];
      index = Math.floor(Math.random() * this.data.length);
      tile.querySelector('.back figure').className = this.data[index];

      this.root.appendChild(tile);

      window.setTimeout(function() {  this.classList.remove('off'); }.bind(tile), i * 25);
    }

    this.root.addEventListener('click', function(e) {
      if ($.events && $.events.on) {
        $.events.click(e.target.className);
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
      dataIndex = Math.floor(Math.random() * this.data.length),
      isFlipped = tiles[tileIndex].classList.contains('flipped'),
      oldSelector = isFlipped ? '.back figure' : '.front figure',
      newSelector = isFlipped ? '.front figure'  : '.back figure',
      newID = this.data[dataIndex];

      if (this.events && this.events.flip) {
        this.events.flip(tiles[tileIndex].querySelector(oldSelector).className, newID);
      }

      tiles[tileIndex].querySelector(newSelector).className = newID;
      tiles[tileIndex].classList.toggle('flipped');
    };

    this.toggle = function() {

      if (this.enabled) {
      
      }
      else {
      
      }

      this.enabled = ! this.enabled;
    };
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
