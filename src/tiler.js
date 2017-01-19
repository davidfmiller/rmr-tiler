
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
    tile = null,
    index = 0,
    defaultConfig = {

      /**
        Toggle magnification of tiles when hovered over
       */
      zoom : false,

      /**
        When zoom is enabled, constrain tiles to *not* overflow the bounds of the root container
       */
      constrain : false,

      /**
        Root node in the document for the tiler
       */
      root : document.body,

      /**
        Timed delay which must pass after display one tile after the previous has started loading
       */
      displayDelay : 25,

      /**
        Begin flipping tiles after initialization is complete
       */
       autoStart : true,

      /**
        Number of tiles that will be created in each dimension (1 → 1 tile, 2 → 4 tiles, 3 → 9 tiles, etc.)
       */
      scale : 1,

      /**
        Number of milliseconds between tile flips
       */
      interval: 1000,

      /**
        Handlers for events 
       */
      events : {

        /**
         Invoked when a tile is clicked

         @param id - 
         */
        click : function(id) {
          //console.log('click ' + id);
        },

        /**
          Invoked when a tile is flipped

          @param back - old id of the tile (flipped out)
          @param front - new id of the tile (flipped in)
         */
        flip : function(back, front) {
          //console.log('flip ' + back + ' ' + front);
        }
      }
    };

    config = merge(defaultConfig, config);

    /**
      
    */
    this.interval = config.interval;

    this.timeout = null;
    this.events = config.events;
    this.data = config.data;
    this.hovered = -1;

    node = config.root ? (config.root instanceof HTMLElement ? config.root : document.querySelector(config.root)) : document.body;

    if (! node) {
      throw Error('Invalid Tiler root [' + config.root + ']');
    }

    if (! this.data || this.data.length == 0) {
      throw Error('No data for Tiler [' + config.root + ']');
    }

    this.root = node;
    if (config.zoom) {
      this.root.classList.add('zoom');
    }

    this.root.addEventListener('mouseleave', function(event) {
      $.hovered = -1;
    });

    this.root.innerHTML = '';

    // calculate necessary dimensions
    styles = window.getComputedStyle(node);
    width = parseInt(styles.width);
    height = parseInt(styles.height);
    dimension = gcd(width, height) / config.scale;

    this.numberOfTiles = width * height / dimension / dimension;
    this.tilesPerRow = 1;
    this.tilesPerColumn = 1;

    for (i = 0; i < this.numberOfTiles; i++) {

      tile = document.createElement('div');
      tile.className = 'container off';
      tile.setAttribute('data-tiler', i);

      tile.addEventListener('mouseenter', function(event) {
        $.hovered = event.target.getAttribute('data-tiler');
      });

      // add necessary class to tile if constrain is enabled
      if (config.constrain && config.zoom) {
        if (i === 0)                                                { tile.className += ' topleft'; }
        else if (i === this.numberOfTiles - 1)                           { tile.className += ' bottomright'; }
        else if (i === (width / dimension) - 1)                     { tile.className += ' topright'; this.tilesPerRow = i + 1; }
        else if (i % (width / dimension) === 0  && (this.numberOfTiles - i == (width/dimension))) { tile.className += ' bottomleft'; }
        else if (i < (width / dimension))                          { tile.className += ' top'; }
        else if (i > this.numberOfTiles - 1 - (width / dimension))      { tile.className += ' bottom'; }
        else if (i % (width / dimension) === 0)                     { tile.className += ' left'; }
        else if (i % (width / dimension) === width / dimension - 1) { tile.className += ' right'; }
      }

      this.tilesPerColumn = this.numberOfTiles / this.tilesPerRow;

      // add necessary children & dimensions 
      tile.innerHTML = '<div class="tile"><section class="front"><figure></figure></section><section class="back"><figure></figure></section>';
      setStyles(tile, { width : dimension + 'px', height : dimension + 'px' });

      // apply randomized classes from the data for 
      index = Math.floor(Math.random() * this.data.length);
      tile.querySelector('.front figure').className = this.data[index];
      index = Math.floor(Math.random() * this.data.length);
      tile.querySelector('.back figure').className = this.data[index];

      this.root.appendChild(tile);

      // 
      window.setTimeout(function() {  this.classList.remove('off'); }.bind(tile), i * config.displayDelay);
    }

    this.root.addEventListener('click', function(e) {
      if ($.events && $.events.on) {
        $.events.click(e.target.className);
      }
    });

    if (config.autoStart) {
      window.setTimeout(function() { arguments[0].toggle(); }, this.interval + config.displayDelay * this.numberOfTiles, this);
    }
  };

  /**
   Calculate the x and y location of an index
   
   @param index {Int}
   @return array containing two integers, first integer being the 0-based row for the index, second integer being the 0-based column index
   */
  window.Tiler.prototype.positionForIndex = function(index) {

    if (index < 0 || index >= this.numberOfTiles) {
      throw new Error('invalid index! ' + index);
    }

    var
    row = parseInt(index / this.tilesPerRow, 10),
    column = index % this.tilesPerRow;

    return [row, column];
  };


  window.Tiler.prototype.newTileIndex = function() {

    var $ = this;
    var randomizer = function() {
      return Math.floor(Math.random() * $.numberOfTiles);
    };

    var index = randomizer();

    // ensure the new index won't conflict with the currently zoomed tile (if applicable)
    if (
      this.zoom && this.hovered >= 0 && (this.tilesPerRow > 3 && this.tilesPerColumn > 3)
    ) {
      do {

        index = randomizer();

        var
        newPosition = this.positionForIndex(index),
        currentPosition = this.positionForIndex(this.hovered);

       } while ( (newPosition[0] <= currentPosition[0] + 1 && newPosition[0] >= currentPosition[0] - 1)
        &&
       (newPosition[1] <= currentPosition[1] + 1 && newPosition[1] >= currentPosition[1] - 1) );
    }

    return index;
  };

  /**
    Flip a random tile
    */
  window.Tiler.prototype.flip = function() {

    var
    tiles = this.root.querySelectorAll('.tile'),

    // the index of the new tile that should be flipped
    tileIndex = this.newTileIndex(),

    // the index of the new class that should be applied to the tile
    dataIndex = Math.floor(Math.random() * this.data.length),
    isFlipped = tiles[tileIndex].classList.contains('flipped'),
    oldSelector = isFlipped ? '.back figure' : '.front figure',
    newSelector = isFlipped ? '.front figure'  : '.back figure',
    newID = this.data[dataIndex];

//    console.log(this.numberOfRows, this.numberOfColumns);


    // notify event listeners
    if (this.events && this.events.flip) {
      this.events.flip(tiles[tileIndex].querySelector(oldSelector).className, newID);
    }

    tiles[tileIndex].querySelector(newSelector).className = newID;
    tiles[tileIndex].classList.toggle('flipped');
  };

  /**
   Stop auto-flipping tiles
    */
  window.Tiler.prototype.stop = function() {
    if (! this.timeout) { return; }
    window.clearTimeout(this.timeout);
    this.timeout = null;
  };

  /**
   Begin auto-flipping tiles (flipping one immediately) at periodic interval
    */
  window.Tiler.prototype.start = function() {

    // if timeout is already set, no further work is needed
    if (this.timeout) { return; }

    if (! this.root.classList.contains('init')) {
      this.root.classList.add('init');
    }

    this.flip();

    // flip
    this.timeout = window.setInterval(function() {
      var scope = arguments[0];
      scope.flip();
    }, this.interval, this);
  };

  /**
    Stop autoplay if enabled; begin autoplaying if it's not enabled
   */
  window.Tiler.prototype.toggle = function() {
    if (this.timeout) {
      this.stop();
    }
    else {
      this.start();
    }
  };

  /**
    Clean up
   */
  window.Tiler.prototype.destroy = function() {
    this.stop();
    this.root.innerHTML = '';
    this.root = null;
    this.events = null;
    this.data = null;
  };

  /**
   * Return a string representation of the instance
   *
   * @return {String}
   */
  window.Tiler.prototype.toString = function() {
    return 'Tiler ' + JSON.stringify({root : '' + this.root, delay : this.interval, data : this.data });
  };

}());

