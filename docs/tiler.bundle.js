/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* jshint undef: true,strict:true,trailing:true,loopfunc:true */
/* global document,window,HTMLElement */

(function () {

  'use strict';

  window.Tiler = __webpack_require__(1);
})();

/***/ }),
/* 1 */
/***/ (function(module, exports) {


/* jshint undef: true,strict:true,trailing:true,loopfunc:true */
/* global document,window,HTMLElement */

(function () {

  'use strict';

  // prevent duplicate declaration

  if (window.Tiler) {
    return;
  }

  var

  //
  VERSION = '0.0.3',


  // maximum number of times a new random tile will be selected in an attempt to avoid being a neighbor of the currently zoomed tile (if applicable)
  MAX_ITERATIONS = 100,


  /*
   * Merge two objects into one, values in b take precedence over values in a
   *
   * @param a {Object}
   * @param b {Object}
    * @return Object
   */
  merge = function (a, b) {
    var o = {};
    for (var i in a) {
      o[i] = a[i];
    }
    if (!b) {
      return o;
    }
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
  gcd = function (a, b) {
    if (!b) {
      return a;
    }
    return gcd(b, a % b);
  },


  /*
   *
   * @param node {HTMLElement}
   * @param styles {Object}
   */
  setStyles = function (node, styles) {
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
  var Tiler = function (config, defaults) {

    var $ = this,
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
      zoom: false,

      /**
        When zoom is enabled, constrain tiles to *not* overflow the bounds of the root container
       */
      constrain: false,

      /**
        Root node in the document for the tiler
       */
      root: document.body,

      /**
        Begin flipping tiles after initialization is complete
       */
      autoStart: true,

      /**
        Number of tiles that will be created in each dimension (1 → 1 tile, 2 → 4 tiles, 3 → 9 tiles, etc.)
       */
      scale: 1,

      /**
        Number of milliseconds between tile flips
       */
      interval: 1000,

      /**
        Handlers for events 
       */
      events: {

        /**
         Invoked when a tile is clicked
          @param id - 
         */
        click: function (id) {
          //console.log('click ' + id);
        },

        /**
          Invoked when a tile is flipped
           @param back - old id of the tile (flipped out)
          @param front - new id of the tile (flipped in)
         */
        flip: function (index, back, front) {
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
    this.zoom = config.zoom;
    this.hovered = -1;
    this.listeners = {};
    this.tileIdentifiers = [];

    node = config.root ? config.root instanceof HTMLElement ? config.root : document.querySelector(config.root) : document.body;

    if (!node) {
      throw Error('Invalid Tiler root [' + config.root + ']');
    }

    if (!this.data || this.data.length == 0) {
      throw Error('No data for Tiler [' + config.root + ']');
    }

    this.root = node;
    this.root.innerHTML = '';
    if (this.zoom) {
      this.root.classList.add('rmr-zoom');
    } else {
      this.root.classList.remove('rmr-zoom');
    }

    this.root.classList.remove('rmr-init');

    if (!this.root.classList.contains('rmr-tiler')) {
      this.root.classList.add('rmr-tiler');
    }

    this.listeners.mouseleave = this.root.addEventListener('mouseleave', function (event) {
      $.hovered = -1;
      if ($.events && $.events.hover) {
        $.events.hover($, -1, null);
      }
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

    var dataSource = this.data.slice();

    for (i = 0; i < this.numberOfTiles; i++) {

      tile = document.createElement('div');
      tile.className = 'rmr-container';
      tile.setAttribute('data-tiler', i);

      tile.addEventListener('mouseenter', function (event) {
        $.hovered = event.target.getAttribute('data-tiler');
        if ($.events && $.events.hover) {
          $.events.hover($, $.hovered, $.data[$.hovered]);
        }
      });

      // add necessary class to tile if constrain is enabled
      if (config.constrain && this.zoom) {
        if (i === 0) {
          tile.className += ' topleft';
        } else if (i === this.numberOfTiles - 1) {
          tile.className += ' bottomright';
        } else if (i === width / dimension - 1) {
          tile.className += ' topright';
        } else if (i % (width / dimension) === 0 && this.numberOfTiles - i == width / dimension) {
          tile.className += ' bottomleft';
        } else if (i < width / dimension) {
          tile.className += ' top';
        } else if (i > this.numberOfTiles - 1 - width / dimension) {
          tile.className += ' bottom';
        } else if (i % (width / dimension) === 0) {
          tile.className += ' left';
        } else if (i % (width / dimension) === width / dimension - 1) {
          tile.className += ' right';
        }
      }

      this.tilesPerRow = parseInt(width / dimension, 10);
      this.tilesPerColumn = parseInt(this.numberOfTiles / this.tilesPerRow, 10);

      // add necessary children & dimensions 
      tile.innerHTML = '<div class="rmr-tile"><section class="rmr-tile-front"><figure></figure></section><section class="rmr-tile-back"><figure></figure></section>';
      setStyles(tile, { width: dimension + 'px', height: dimension + 'px' });

      // apply randomized classes from the data for the tile fronts
      index = Math.floor(Math.random() * dataSource.length);
      tile.querySelector('.rmr-tile-front figure').className = dataSource[index];

      dataSource.splice(index, 1);
      if (dataSource.length == 0) {
        dataSource = this.data.slice();
      }

      this.root.appendChild(tile);
    }

    this.listeners.click = this.root.addEventListener('click', function (e) {
      if ($.events && $.events.click) {
        var n = e.target;
        while (!n.classList.contains('rmr-container')) {
          n = n.parentNode;
        }
        $.events.click($, parseInt(n.getAttribute('data-tiler'), 10), e.target.className);
      }
    });

    this.root.classList.add('rmr-init');

    if (config.autoStart) {
      window.setTimeout(function () {
        arguments[0].toggle();
      }, this.interval, this);
    }
  };

  /**
   Calculate the x and y location of an index
   
   @param index {Int}
   @return array containing two integers, first integer being the 0-based row for the index, second integer being the 0-based column index
   */
  Tiler.prototype.positionForIndex = function (index) {

    if (index < 0 || index >= this.numberOfTiles) {
      throw new Error('invalid index! ' + index);
    }

    var row = parseInt(index / this.tilesPerRow, 10),
        column = index % this.tilesPerRow;

    return [row, column];
  };

  Tiler.prototype.destroy = function () {

    this.root.removeEventListener('click', this.listeners.click);
    this.root.removeEventListener('mouseleave', this.listeners.mouseleave);

    this.stop();
    this.numberOfTiles = this.tilesPerRow = this.tilesPerColumn = 0;
    this.data = [];
    this.zoom = false;
    this.hovered = -1;
    //this.root = null;
  };

  Tiler.prototype.newTileIndex = function () {

    var $ = this,
        randomizer = function () {
      return Math.floor(Math.random() * $.numberOfTiles);
    },
        index = randomizer(),
        iterations = 0,
        newPosition = this.positionForIndex(index),
        currentPosition = this.hovered >= 0 ? this.positionForIndex(this.hovered) : [0, 0];

    // try to ensure the new index won't conflict with the currently zoomed tile (if applicable)... 
    if (this.zoom && this.hovered >= 0) {
      do {

        index = randomizer();
        newPosition = this.positionForIndex(index);
        currentPosition = this.positionForIndex(this.hovered);

        iterations++;
      } while (iterations < MAX_ITERATIONS && newPosition[0] <= currentPosition[0] + 1 && newPosition[0] >= currentPosition[0] - 1 && newPosition[1] <= currentPosition[1] + 1 && newPosition[1] >= currentPosition[1] - 1);
    }

    return index;
  };

  /**
    Flip a random tile
    */
  Tiler.prototype.flip = function () {

    var tiles = this.root.querySelectorAll('.rmr-tile'),


    // the index of the new tile that should be flipped
    tileIndex = this.newTileIndex(),


    // the index of the new class that should be applied to the tile
    dataIndex = Math.floor(Math.random() * this.data.length),
        isFlipped = tiles[tileIndex].classList.contains('flipped'),
        oldSelector = isFlipped ? '.rmr-tile-back figure' : '.rmr-tile-front figure',
        newSelector = isFlipped ? '.rmr-tile-front figure' : '.rmr-tile-back figure',
        newID = this.data[dataIndex];

    // notify event listeners
    if (this.events && this.events.flip) {
      this.events.flip(this, tileIndex, tiles[tileIndex].querySelector(oldSelector).className, newID);
    }

    tiles[tileIndex].querySelector(newSelector).className = newID;
    tiles[tileIndex].classList.toggle('flipped');
  };

  /**
   Stop auto-flipping tiles
    */
  Tiler.prototype.stop = function () {
    if (!this.timeout) {
      return;
    }
    window.clearTimeout(this.timeout);
    this.timeout = null;
  };

  /**
   Begin auto-flipping tiles (flipping one immediately) at periodic interval
    */
  Tiler.prototype.start = function () {

    if (!this.root) {
      return;
    }

    // if timeout is already set, no further work is needed
    if (this.timeout) {
      return;
    }

    this.flip();

    // flip
    this.timeout = window.setInterval(function () {
      var scope = arguments[0];
      scope.flip();
    }, this.interval, this);
  };

  /**
    Stop autoplay if enabled; begin autoplaying if it's not enabled
   */
  Tiler.prototype.toggle = function () {
    if (this.timeout) {
      this.stop();
    } else {
      this.start();
    }
  };

  /**
    Clean up
   */
  Tiler.prototype.destroy = function () {

    this.stop();
    this.root.innerHTML = '';
    this.root = null;
    this.listeners = null;
    this.events = null;
    this.data = null;
    window.clearTimeout(this.timeout);
    this.timeout = null;
  };

  /**
   * Return a string representation of the instance
   *
   * @return {String}
   */
  Tiler.prototype.toString = function () {
    return 'Tiler ' + JSON.stringify({ root: '' + this.root, delay: this.interval });
  };

  module.exports = Tiler;
})();

/***/ })
/******/ ]);