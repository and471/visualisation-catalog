app.controller('scheduleController', function($scope, $rootScope, $location, Timeslot) {
    if ($rootScope.user == null || $rootScope.user == undefined || !$rootScope.user.isAdmin) {
        showToast("Please log in as an administrator");
        $location.search("return", "/schedule"); $location.path("/sign-in"); return;
    }
    
    $rootScope.page = {title: "Schedule Content",  headerClass:"schedule", class:"schedule"}
    $scope.days = [1, 2, 3, 4, 5, 6, 0]; // The make Monday start of week
    $scope.activeTimeslot = null;
    $scope.timeslots = [];
    $scope.timeslotCache = {};
    
    $scope.getShortWeekdayName = function(day) {
        return moment().day(day).format("ddd")   
    }

    $scope.formatWeek = function() {
        return $scope.startOfWeek.format("Do MMMM") + " - " +  $scope.startOfWeek.clone().add(7, "days").format("Do MMMM")
    }
    
    $scope.nextWeek = function() {
        $scope.startOfWeek = $scope.startOfWeek.add(7, "days");
    }   
    
    $scope.previousWeek = function() {
        $scope.startOfWeek.add(-7, "days");
    }
    
    $scope.addTimeslot = function(start, end, element) {
        return Timeslot.new({start_time:start.format(), end_time:end.format(), authentication_key:localStorage.getItem("authentication_key")}, 
            // Success
            function(timeslot) {
                $scope.timeslotCache[timeslot.id] = timeslot;
                $(element).timesloteditor("addTimeslot", timeslot.id, start, end);
            }); 
    }
    
    $scope.removeTimeslot = function(id, element) {
        Timeslot.remove({id: id, authentication_key:localStorage.getItem("authentication_key")}, 
            // Success
            function(timeslot) {
                $(element).timesloteditor("removeTimeslot", id);
                delete $scope.timeslotCache[id];
            }
        ); 
    }
    
    $scope.updateTimeslot = function(id, start, end) {
        // Only call if something has updated
        if ($scope.timeslotHasChanged(id, start, end)) {
            Timeslot.update({id: id, start_time : start, end_time: end, authentication_key:localStorage.getItem("authentication_key")},
                // Success
                function() {
                    $scope.timeslotCache[id].start_time = start;
                    $scope.timeslotCache[id].end_time = end;
                }
            );
        }
    }
    
    $scope.editTimeslot = function(id) {
        $location.path('/schedule/timeslot/' + id); 
        $scope.$apply()
    }
    
    $scope.getDateForDay = function(day) {
        return $scope.startOfWeek.clone().add(day, "days");   
    }
    
    $scope.timeslotHasChanged = function(id, start, end) {
        return $scope.timeslotCache[id].start != start || $scope.timeslotCache[id].end != end;
    }

    
    // Watchers
    $scope.$watch("startOfWeek", function(newStartOfWeek) {
        var timeslots = [];
        
        var done = 7;
        
        for (var day = 0; day < 7; day++) {
            var date = $scope.startOfWeek.clone().add(day, "days");
            
            Timeslot.query({startOfDay: date.format(), authentication_key:localStorage.getItem("authentication_key")},   
                // Success      
                (function(day) {
                    return function(dayTimeslots) {
                        timeslots[day] = dayTimeslots;
                        done--;

                        if (done == 0) {
                            $scope.timeslots = timeslots; 
                            
                            for (var i = 0; i < timeslots.length; i++) {
                                for (var j = 0; j < timeslots[i].length; j++) {
                                    $scope.timeslotCache[timeslots[i][j].id] = timeslots[i][j];
                                }
                            }
                        }
                    }
                })(day)
            );
        } 
    }, true);
    
    $scope.startOfWeek = moment().startOf('isoweek');
    
    $scope.scrolled = false;
});

app.controller('editTimeslotController', function($scope, $rootScope, $routeParams, $location, Visualisation, Timeslot, Programme) {
    if ($rootScope.user == null || $rootScope.user == undefined || !$rootScope.user.isAdmin) {
        $location.search("return", "/edit-timeslot/" + $routeParams.id); $location.path("/sign-in"); return;
    }
    
    $rootScope.page = {title: "Schedule Content", headerClass:"schedule", class:"schedule"}

    Timeslot.get({id:$routeParams.id}, 
        // Success
        function(timeslot) {
            $scope.timeslot = timeslot;
        }                             
    );
    
    $scope.formatDay = function(date) {
        if (date == undefined) return "";
        return date.format("ddd").toUpperCase();
    }
    
    $scope.formatTime = function(start, end) {
        if (start == undefined || end == undefined) return "";
        return start.format("HH:mm") + " - " +  end.format("HH:mm")
    }
    
    $scope.containsContentItem = function(content_id) {
        for (i = 0; i < $scope.programmes.length; i++) {
            if ($scope.programmes[i].visualisation.id == content_id) {
                return true;
            }
        }
        return false;
    }
    
    $scope.addProgramme = function(content) {
        
        // Don't allow multiple programmes for the same content item
        for (var i = 0; i < $scope.programmes.length; i++) {
            if ($scope.programmes[i].visualisation.id == content.id) {
                return;
            }
        } 
        
        Programme.new({visualisation_id:content.id, timeslot_id:$scope.timeslot.id, 
                       authentication_key : localStorage.getItem("authentication_key")},
            // Success
            function(programme) {
                $scope.programmes.push(programme);
            }
        );
    }

    $scope.onFieldChanged = function(field, val) {
        var params = {id:$scope.activeProgramme.id, authentication_key:localStorage.getItem("authentication_key")};
        val = parseInt(val);

        if (field == "priority") {
            $scope.activeProgramme.priority = params.priority = val;
        } else if (field == "screens") {
            $scope.activeProgramme.screens= params.screens = val;
        }
        
        Programme.update(params, 
            // Success
            function(programme) {
            
            }
        );
        
        
    }
    
    $scope.removeProgrammeByContentId = function(contentId) {
      for (var i = 0; i < $scope.programmes.length; i++) {
          if ($scope.programmes[i].visualisation.id == contentId) {
              var programmeId = $scope.programmes[i].id;
              $scope.removeProgramme($scope.programmes[i].id);
              return;
          }
      }
    }    
    
    $scope.removeProgramme = function(programmeId) {
        for (var i = 0; i < $scope.programmes.length; i++) {
            if ($scope.programmes[i].id == programmeId) {
                Programme.remove({id : programmeId, authentication_key:localStorage.getItem("authentication_key")});
                $scope.programmes.splice(i, 1);

                if ($scope.activeProgramme != null && $scope.activeProgramme.id == programmeId) {
                    $scope.activeProgramme = $scope.programmes.length > 0 ? $scope.programmes[0] : null;
                }
                return;
            }
        }
    }
    
    $scope.$watch("programmes", function() {
        // Make sure a programme is always selected in a non-empty list
        if ($scope.activeProgramme == null && $scope.programmes.length > 0) {
            $scope.activeProgramme = $scope.programmes[0];
        }
    }, true);
    
    $scope.formatContentType = function(content_type) {
		return formatContentType(content_type);
	}
    
    $scope.setActiveProgramme = function(contentItem) {
        $scope.activeProgramme = contentItem;
    }
    
    $scope.programmes = []
    $scope.activeProgramme = null;
    
    $scope.content = Visualisation.query();
    
    $scope.showAdverts = true;
    $scope.showVisualisations = true;

    $scope.programmes = Programme.query({timeslot_id:$routeParams.id, authentication_key:localStorage.getItem("authentication_key")},
        // Success
        function(programmes) {
            if (programmes.length > 0) $scope.activeProgramme = programmes[0];
        }
    );
    
    
});

    
app.directive('timeslotEditor', function() {
    return {
        scope: {item:'='},
        controller: ['$scope', "$location", function($scope, $location) {
            $scope.$parent.$watch("timeslots", function() {
                if ($scope.editor == undefined || $scope.$parent.timeslots.length == 0) return;
                
                $($scope.editor).timesloteditor("setTimeslots", $scope.$parent.timeslots[$scope.day]);   
            });
            
            $scope.$parent.$watch("startOfWeek", function() {
                if ($scope.$parent.startOfWeek == undefined) return;
                
                $scope.date = $scope.$parent.startOfWeek.clone().add($scope.day, "days");  
                $scope.editor.timesloteditor("setStartTime", $scope.date);
            }, true);
        }],

        link: function(scope, element, attrs) {
            scope.day = attrs.day;
            
            scope.editor = $(element).timesloteditor({ 
                timeslotClicked : function(event, id) {
                    scope.$parent.editTimeslot(id);
                },
                timeslotAddRequested : function(event, data) {
                    scope.$parent.addTimeslot(data.start, data.end, $(element));
                },
                timeslotChanged : function(event, data) {
                    scope.$parent.updateTimeslot(data.id, data.start, data.end);
                },
                timeslotRemoveRequested : function(event, id) {
                    scope.$parent.removeTimeslot(id, $(element));
                },
                hasConflicts : function() {
                    showToast("One of your days has <span style='color:red'>conflicts</span>.<br/>Changes to this day won't be saved until you resolve the <span style='color:red'>conflicts</span>.", 7000);
                },
            }); 
            
            if (!scope.$parent.scrolled) {
                $(".scroll").animate({scrollLeft:scope.editor.timesloteditor("getStartPosition")}, 0);
                scope.$parent.scrolled = true;
            }
        }
    }; 
}); 


app.directive('contentDropTarget', function() {
    return {
        link: function(scope, element, attrs) {
            $(element).addClass("content-drop-target");
            
            element.bind("dragenter", function(e) {
                element.addClass("dragover");
                element.parent().addClass("dragover");
            });            
            element.bind("dragleave", function(e) {
                element.removeClass("dragover");
                element.parent().removeClass("dragover");
            });                  
            element.bind("dragover", function(e) {
                e.preventDefault();
            });            

            element.bind("drop", function(e) {
                var content = JSON.parse(e.originalEvent.dataTransfer.getData('text/json'));

                if (!scope.containsContentItem(scope.timeslotContent, content)) {
                    scope.addProgramme(content);
                }
                
                element.removeClass("dragover");
                element.parent().removeClass("dragover");
            });
        }
    }; 
}); 

app.directive('contentItem', function() {
    return {
        scope: {
            contentItem: '=data',
            draggable: '=draggable',
            priority:'=priority'
        },
        link: function(scope, element, attrs) {
            $(element).addClass("content-item").addClass("card");
            
            $("<div></div>").addClass("screenshot")
                            .css("background-image", "url('" + scope.contentItem.screenshot + "')")
                            .appendTo(element);            
            
            var text = $("<div></div>").addClass("text")
                                       .appendTo(element);
            
            $("<div></div>").addClass("name")
                            .html(scope.contentItem.name)
                            .appendTo(text);
            
            $("<div></div>").addClass("author")
                            .html(scope.contentItem.author.username)
                            .appendTo(text);
            
            if (scope.priority != undefined) {
                $("<div></div>").addClass("right").append(
                    $("<div></div>").addClass("priority")
                                .html(scope.priority))
                                .appendTo(element);
            }
            
            scope.$watch("priority", function() {
                $(element).find(".priority").html(scope.priority);
            });
            
            if (!scope.draggable) return;
            
            $(element).bind("dragstart", function(e) {
                
                e.originalEvent.dataTransfer.setData('text/json', JSON.stringify(scope.contentItem)); 
                
                if ($(element).parent().hasClass("content-drop-target")) {
                    scope.$parent.removeProgrammeByContentId(scope.contentItem.id)
                }
            });
            
            $(element).bind("dragend", function(e) {
                 scope.$parent.$apply();
            });
        }
    }; 
}); 

app.directive('slider', function() {
    return {
        scope: {
            field:"="
        },
        link: function(scope, element, attrs) {
            scope.formatVal = function(value) {
                var val = parseInt(value);
                return val.toFixed(0);
            };
            
            scope.setValueHandle = function(val) {
                $(element).find(".noUi-handle").html(scope.formatVal(val));
            }
            
            $(element).noUiSlider({
                start: [ parseInt(attrs.val) ],
                step: parseInt(attrs.step),
                range: {
                    'min':  parseInt(attrs.min),
                    'max':  parseInt(attrs.max)
                },
                connect: "lower"
            }).noUiSlider_pips({
                mode: 'steps',
                density:1
            }).on('set', function() {
                scope.setValueHandle($(this).val());
		        scope.$parent.onFieldChanged(attrs.field, $(element).val());
            }).on('slide', function() {
                $(this).find(".noUi-handle").html(scope.formatVal($(element).val()));
            });
            
            scope.setValueHandle(attrs.val);
        }
    }; 
}); 

app.filter('filterVisualisations', function() {
    return function(content, showVisualisations) {
        if (content == undefined) return undefined;
        var filtered = []

        for (var i = 0; i < content.length; i++) {
            if (content[i].vis_type == "vis" && !showVisualisations) continue;
            filtered.push(content[i]);
        }

        return filtered;
    };
});

app.filter('filterAdverts', function() {
    return function(content, showAdverts) {
        if (content == undefined) return undefined;
        
        var filtered = []

        for (var i = 0; i < content.length; i++) {
            if (content[i].vis_type == "advert" && !showAdverts) continue;
            filtered.push(content[i]);
        }

        return filtered;
  };
});
