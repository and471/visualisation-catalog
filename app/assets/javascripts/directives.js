app.directive('toggleButton', function() {
return {
    scope: {item:'='},
    
    link: function(scope, element, attrs) {
        $(element).addClass("toggle-button")
    }
}});

app.directive('horizontalScroll', function() {
return {
    link: function(scope, element, attrs) {
        $(element).mousewheel(function(event, delta) {
          this.scrollLeft -= (delta * 30);
          event.preventDefault();
       });
    }
}});

app.directive('colorThief', function() {
    return {
        controller: ['$scope', function($scope){
            $scope.setBackground = function(element, color) {

                if (color == "") color = "rgb(242,242,242)"
                
                $(element).css("background-color", color);
                
                var rgb = color.match(/\d+/g);
                
                var brightness = Math.sqrt( .241 * Math.pow(rgb[0], 2) + 
                                            .691 * Math.pow(rgb[1], 2) + 
                                            .068 * Math.pow(rgb[2], 2));

                if (brightness < 255/2) {
                    $(element).addClass("dark-background");
                }   
            };
        }],

        link: function(scope, element, attrs) {
			attrs.$observe('color', function(value) {
				if (value) {
					scope.setBackground(element, attrs["color"]);
				}
			});
        }
    }; 
}); 
