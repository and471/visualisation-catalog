var MOVE = 0;
var RESIZE = 1;

var LEFT = 0;
var RIGHT = 1;


function isNear(x, x1, tolerance, handle) {
    var diffX, diffY;

    if (handle == LEFT) diffX = x - x1;
    if (handle == RIGHT) diffX = x1 - x;
    
    return diffX <= tolerance && diffX > 0;
}

function Timeslot(id, start, end, min, max) {
    this.id = id;
    
    if (start < min) {
        this.setStart(min);   
    } else {
        this.setStart(start); 
    }
    
    if (end > max) {
        this.setEnd(max);
    } else {
        this.setEnd(end);
    }

    this.min = min;
    this.max = max;
}

Timeslot.prototype.move = function(start) {
    
    var duration = this.end.diff(this.start);
    
    this.setStart(start.clone());
    this.setEnd(this.start.clone().add(duration));
        
    // If we violate the bounds, rerun with the max/min we can do
    
    if (this.start < this.min) {
        this.move(this.min.clone());
    } else if (this.end > this.max) {
        this.move(this.max.clone().add(-duration));
    }
}

Timeslot.prototype.in = function(time) {
    return (this.start.diff(time, "minutes") <= 0 && this.end.diff(time, "minutes") >= 0);
}

Timeslot.prototype.setStart = function(start) {
    this.start = this.snap(start);
}
Timeslot.prototype.setEnd = function(end) {
    this.end = this.snap(end);
}

Timeslot.prototype.snap = function(time) {
    var diff =  time.minute() % 10;
    if (diff < 5) {
        return time.add(-diff, "minutes");
    } else {
        return time.add(10 - diff, "minutes");
    }
}

Timeslot.prototype.format = function() {
    return this.start.format("HH:mm") + " - " + this.end.format("HH:mm");
}

Timeslot.prototype.conflicts = function(start, end) {
    return end > this.end && start < this.end ||
           start < this.start && end > this.start ||
           start >= this.start && end <= this.end;
    
}

$.widget("widgets.timesloteditor", {

    options: {},
    BORDER_COLOURS : ["#999999", "#ebebeb", "#999999"],
    STARTING_HOUR : 9,

    _create: function() {
        this.height = 0;
        this.timeslots = []

        this.mousedown = false
        this.dragXOffset = -1
        this.dragDirection = -1
        this.selected = null
        
        this.element.addClass("timeslot-editor");
        var canvas = $("<canvas></canvas>")
          .mousemove($.proxy(this, "_on_mousemove"))
          .mousedown($.proxy(this, "_on_mousedown"))
          .mouseup($.proxy(this, "_on_mouseup"))
          .dblclick($.proxy(this, "_on_doubleclick"))
          .attr("tabindex", "0")
          .keydown($.proxy(this, "_on_keyup")) 
          .bind('selectstart', function(e) { e.preventDefault(); return false; })
          .appendTo(this.element);
        
        this.canvas = canvas.get(0);
        
        var that = this;
        canvas.fillingCanvas({
            resized: function( event, data ) {
                that.setMinuteWidth(that.canvas.width / (24*60))
            }
        });
        
        // Still trigger the mouseup even if the cursor isn't over the canvas
        $("body").mousedown($.proxy(this, "_on_mousedown"));
        $("body").mouseup($.proxy(this, "_on_mouseup"));
    },

    _draw: function() {
        var ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        var conflicts = this.getConflicts();
        
        ctx.save();
        for (var i = 0; i < this.timeslots.length; i++) {
            var timeslot = this.timeslots[i];
            var selected =  i == this.selected;
            var conflicts = this._conflicts(null, null, timeslot);
            this._draw_timeslot(ctx, this.timeslots[i], selected, conflicts);
        }
        ctx.restore()
    },

    _on_keyup: function(event) {
        // Delete key
        if (event.keyCode == 46) this._requestRemoveTimeslot();
    }, 

    _on_mousemove: function(event) {
        this._fix_event(event);
        var i;
        var cursor = 'auto';
        var handle = -1;

        for (i = 0; i < this.timeslots.length; i++) {
            var handle = this._get_timeslot_resize_handle(this.timeslots[i], event.offsetX);
            if (handle != -1) break;
        }

        if (!this.mousedown) {
            
            if (this._get_timeslot_at_pos(event.offsetX) != null) {
                cursor = "pointer";
            }
            
            switch (handle) {
              case RIGHT: cursor='w-resize';  break;
              case LEFT: cursor='e-resize';  break;
            }
            this.element.css("cursor", cursor);
        } else {

            // Create new on drag
            if (this.selected == null) {
                return;
            };

            var minWidth = 20;
            
            if (this.dragAction == RESIZE) {
                // Conflict behaviour is that is something already conflicts, allow it to be resized in anyway
                // but if it currently doesn't, don't allow it to be resized so that it conflicts
                if (this.dragDirection == RIGHT) {
                    if (this._get_x(this.timeslots[this.selected].start) + minWidth < event.offsetX &&
                        (this._conflicts(null, null, this.timeslots[this.selected]) ||
                        !this._conflicts(null, this._get_time(event.offsetX), this.timeslots[this.selected]))) {
                            this.timeslots[this.selected].setEnd(this._get_time(event.offsetX));
                    }
                }
                if (this.dragDirection == LEFT) {
                    if (this._get_x(this.timeslots[this.selected].end) > event.offsetX + minWidth && 
                        (this._conflicts(null, null, this.timeslots[this.selected]) ||
                        !this._conflicts(this._get_time(event.offsetX), null, this.timeslots[this.selected]))) {
                        this.timeslots[this.selected].setStart(this._get_time(event.offsetX));
                    }
                }
            } else if (this.dragAction == MOVE) {
                this.element.css("cursor", "move");
                this.timeslots[this.selected].move(this._get_time(event.offsetX - this.dragXOffset));
            }
            this._draw();
        }


    },

    _on_mousedown: function(event) {
        this._fix_event(event);
        
        if (!this._in_element(event)) {
            this.selected = null;
            this._draw();
            return;
        }
        
        this.mousedown = true;

        for (i = 0; i < this.timeslots.length; i++) {
            var handle = this._get_timeslot_resize_handle(this.timeslots[i], event.offsetX);
            if (handle != -1) {
                this.selected = i;
                this.dragDirection = handle;
                this.dragAction = RESIZE;
                return;
            };
        }

        // No handle selected, try to see if a Timeslot is selected
        var timeslot = this._get_timeslot_at_pos(event.offsetX);

        if (timeslot != null) {
            this.selected = i;
            this.dragXOffset = event.offsetX - this._get_x(this.timeslots[i].start);
            this.dragAction = MOVE;
        } else {
            this.selected = null;
        }
        this._draw();
    },

    _on_mouseup: function(event) {
        this._fix_event(event);
        
        if (this.selected != null) {
            this._onTimeslotChanged(this.timeslots[this.selected].id, 
                                    this.timeslots[this.selected].start, 
                                    this.timeslots[this.selected].end)   
        }
        
        this.mousedown = false;
        this.dragXOffset = -1;

        this.dragDirection = -1;
        this.dragAction = -1;

        this._draw();
    },

    _on_doubleclick: function(event) {
        this._fix_event(event);
        
        var timeslot = this._get_timeslot_at_pos(event.offsetX);
        
        if (timeslot == null) {
            this._requestAddTimeslot(event.offsetX - 100/2);
        } else {
            this._trigger("timeslotClicked", event, timeslot.id);   
        }
    },

    _draw_timeslot : function(ctx, timeslot, selected, conflicts) {
        var x1 = Math.floor(this._get_x(timeslot.start));
        var x2 = Math.floor(this._get_x(timeslot.end));
        var y1 = 0;
        var y2 = this.canvas.height;
        
        // Border
        ctx.fillStyle = "#dbdbdb";
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

        // Fill

        ctx.fillStyle = "#f2f2f2";
        if (conflicts) {
            ctx.globalAlpha=0.6;
            ctx.fillStyle = "#f44336";  
        }
        ctx.fillRect(x1 + 1, y1, x2 - x1 - 2, y2 - y1);

        
        // Text
        ctx.fillStyle = "#9e9e9e";
        if (conflicts) {
            ctx.fillStyle = "#fff";  
        } else if (selected) {
            ctx.fillStyle = "#000";
        }
        var fontSize = 12;
        ctx.font = fontSize + "px Roboto";
        var text = timeslot.format();
        
        // Only draw text if it fits
        if (x2 - x1 > ctx.measureText(text).width) { 
            ctx.fillText(text, Math.floor((this._get_x(timeslot.end) + this._get_x(timeslot.start) - ctx.measureText(text).width)/2), 
                         Math.floor((this.canvas.height + fontSize)/2));
        }
        
    }, 
    
    _get_x : function(time) {
        return time.diff(this.startTime, 'minutes') * this.minuteWidth;
    },
    
    _get_time : function(x) {
        var minutes = Math.floor(x / this.minuteWidth);
        return this.startTime.clone().add(minutes, 'minutes');
    },

    _get_timeslot_resize_handle : function(timeslot, x, y) {
        var tolerance = 20;
        
        var x1 = this._get_x(timeslot.start);
        var x2 = this._get_x(timeslot.end);
        
        if (isNear(x, x1, tolerance, LEFT)) return LEFT;
        if (isNear(x, x2, tolerance, RIGHT)) return RIGHT;
        return -1;
    },
    
    _get_timeslot_at_pos : function(x) {
        for (i = 0; i < this.timeslots.length; i++) {
            if (this.timeslots[i].in(this._get_time(x))) {
                return this.timeslots[i];          
            }
        }
        return null;
    },
    
    _in_element : function(event) {
        var bounds = this.element.get(0).getBoundingClientRect();
        return event.clientY < bounds.bottom && 
               event.clientY > bounds.top    &&
               event.clientX > bounds.left   &&
               event.clientX < bounds.right;
    },
    

    getTimeslots: function() {
        return this.timeslots;
    },

    _requestAddTimeslot: function(x) {
        var default_size = 100;
        x = x || Math.floor((this.width - default_size)/2);

        this._trigger("timeslotAddRequested", null, {start: this._get_time(x), end: this._get_time(x).add(1, "hours")});
    },
    
    addTimeslot : function(id, start, end) {
        this.selected = this.timeslots.push(new Timeslot(id, start, end, this.startTime, this.endTime)) - 1;
        this._draw();
    },

    _requestRemoveTimeslot: function() {
        if (this.selected != null) {
            this._trigger("timeslotRemoveRequested", null, this.timeslots[this.selected].id)
        }
    },
    
    _onTimeslotChanged: function(id, start, end) {
        if (this.hasConflicts()) {
            this._trigger("hasConflicts", null, null);
        } else {
            this._trigger("timeslotChanged", null, {id:id, start:start, end:end});
        }
        
    },
    
    removeTimeslot: function(id) {
        for (var i = 0; i < this.timeslots.length; i++) {
            if (this.timeslots[i].id == id) {
                this.timeslots.splice(i, 1);
                
                if (this.selected == i) this.selected = null;
                this._draw();
                return;
            }
        }
    },

    showRegions: function() {
        this.show_regions = true;
        this._draw();
    },

    hideRegions: function() {
        this.show_regions = false;
        this._draw();
    },
    
    setMinuteWidth : function(width) {
        this.minuteWidth = width;
        this._draw();
    },    
    
    setStartTime : function(time) {
        this.startTime = time;
        this.endTime = time.clone().add(24, "hours");
    },

    _fix_event: function(event) {
        // For firefox from http://stackoverflow.com/questions/22716333/firefox-javascript-mousemove-not-the-same-as-jquery-mousemove
        if(typeof event.offsetX === "undefined" || typeof event.offsetY === "undefined") {
           var targetOffset = $(event.target).offset();
           event.offsetX = event.pageX - targetOffset.left;
           event.offsetY = event.pageY - targetOffset.top;
        }
    },
    
    _conflicts : function(start, end, timeslot) {
        start = start || timeslot.start;
        end = end || timeslot.end;
        
        for (var i = 0; i < this.timeslots.length; i++) {
            if (this.timeslots[i] != timeslot) {
                if (this.timeslots[i].conflicts(start, end)) {
                    return true;   
                }
            }
        }
        return false;
    },
    
    getConflicts : function() {
        var conflicts = []
        for (var i = 0; i < this.timeslots.length; i++) {
            var timeslot = this.timeslots[i];
            if (this._conflicts(null, null, timeslot)) {
                conflicts.push(timeslot);
            }
        }
        return conflicts;
    },
    
    hasConflicts : function() {
        for (var i = 0; i < this.timeslots.length; i++) {
            var timeslot = this.timeslots[i];
            if (this._conflicts(null, null, timeslot)) return true;
        }
        return false;
    },
    
    setTimeslots : function(timeslots) {
        
        this.timeslots = []
        for (var i = 0; i < timeslots.length; i++) {

            this.timeslots.push(new Timeslot(timeslots[i].id, 
                                             timeslots[i].start, 
                                             timeslots[i].end, 
                                             this.startTime, this.endTime));
        }
        
        this._draw();
    },
    
    getStartPosition : function() {
        return this.minuteWidth * this.STARTING_HOUR * 60 - 30;
    }

});
