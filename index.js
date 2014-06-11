var atxy = require('range-at-xy');
var split = require('split-at-range');
var classes = require('classes');

// Region in px on the top and on the bottom of elements excluded
// from the 'inside' destination mode.

var DROP_PADDING = 4;

function Drag(container) {
  this.container = container;
  this.dragging = false;
  this.source = {
    element: null,
    mode: null
  }
  this.destination = {
    element: null,
    range: null,
    mode: null
  }
  this.display = document.createElement('div');
  this.display.style.position = 'absolute';
  this.cursor = document.createElement('div');
  this.cursor.className = 'drag-cursor';
  this.cursor.style.position = 'absolute';
  this.cursor.style.display = 'none';
  this.display.appendChild(this.cursor);
}

Drag.prototype.start = function(el, mode) {
  if (this.dragging) return;
  classes(el).add('dragging');
  this.dragging = true;
  this.source.element = el;
  this.source.mode = mode || 'move';
  this.container.style.cursor = 'move'; 
}

Drag.prototype.update = function(el, x, y) {  
  if (!this.dragging) return;
  if (el == this.container) return;
  while (el.parentNode != this.container) {
    el = el.parentNode; 
  }
  if (el == this.source.element) return;
  this.destination.element = el;
  var range = this.destination.range = atxy(el, x, y);
  var rect = el.getBoundingClientRect();
  if (range) {
    if (y <= rect.top + DROP_PADDING) {
      this.destination.mode = 'before';
    } else if (y >= rect.bottom - DROP_PADDING) {
      this.destination.mode = 'after';
    } else if (range.startOffset == 0) {
      this.destination.mode = 'before';
    } else {
      this.destination.mode = 'inside';
    }
  } else {
    if (y < (rect.top + rect.bottom) / 2) {
      this.destination.mode = 'before';
    } else {
      this.destination.mode = 'after';
    }
  }
  var drect = this.display.getBoundingClientRect();
  if (this.destination.mode == 'before') {
    this.cursor.style.top = (rect.top - drect.top) + 'px';
    this.cursor.style.left = (rect.left - drect.left) + 'px'; 
    this.cursor.style.height = '2px';
    this.cursor.style.width = rect.width + 'px';
  } else if (this.destination.mode == 'after') {
    this.cursor.style.top = (rect.bottom - drect.bottom - 2) + 'px';
    this.cursor.style.left = (rect.left - drect.left) + 'px'; 
    this.cursor.style.height = '2px';
    this.cursor.style.width = rect.width + 'px';
  } else if (this.destination.mode == 'inside') {
    var rrect = this.destination.range.getBoundingClientRect();
    this.cursor.style.left = (rrect.left - drect.left) + 'px';
    this.cursor.style.top = (rrect.top - drect.top - 3) + 'px';
    this.cursor.style.width = '2px';
    this.cursor.style.height = rrect.height + 6 + 'px';
  }
  this.cursor.style.display = '';
}

Drag.prototype.cancel = function() {
  if (!this.dragging) return;
  classes(this.source.element).remove('dragging');
  this.source.element = null;
  this.dragging = false;
  this.cursor.style.display = 'none';
  this.container.style.cursor = ''; 
}

Drag.prototype.commit = function() {
  if (!this.dragging) return;
  if (!this.destination.element) return this.cancel();
  classes(this.source.element).remove('dragging');
  var dest = this.destination.element;
  var el;
  if (this.source.mode == 'move') {
    el = this.source.element;
  } else {
    el = this.source.element.cloneNode(true);
  }
  if (this.destination.mode == 'before') {
    this.container.insertBefore(el, dest);
  } else if (this.destination.mode == 'after') {
    var next;
    if (next = dest.nextSibling) {
      this.container.insertBefore(el, next);
    } else {
      this.container.appendChild(el);
    }
  } else if (this.destination.mode == 'inside') {
    var parts = split(dest, this.destination.range);
    this.container.insertBefore(parts[0], dest);
    this.container.insertBefore(el, dest);
    this.container.insertBefore(parts[1], dest);
    this.container.removeChild(dest);
  }
  this.source.element = null;
  this.dragging = false;
  this.cursor.style.display = 'none';
  this.container.style.cursor = ''; 
}

module.exports = Drag;
