
app.controller('visualisationController', function ($scope, $rootScope, Visualisation, Comment, $routeParams, $location) {
    $rootScope.page = {title: "Visualisations",  headerClass:"visualisations", searchEnabled : false, class:"view-visualisation"}
    $scope.currentUser = $rootScope.user.name;
    $scope.currentAvatar = $rootScope.user.avatar;
    $scope.postLabel = "POST";
    var params = { id : $routeParams.id };
    if ($rootScope.user != null) {
        params.authentication_key = localStorage.getItem("authentication_key");   
    }

    $scope.visualisation = Visualisation.get(params, function() {}, 
        // Failure
        function() {
            $scope.visualisation = null;
            showToast("Visualisation could not be retrieved");
        }
    );

    $scope.thank = function() {
        showToast("Thanks for liking this visualisation!");      
    }
    
    $scope.vote = function() {
        Visualisation.vote({id : $routeParams.id},
            // Success
            function() {
                $scope.visualisation.votes += 1;
                $scope.thank();
            }                             
        );   
    }
    
    $scope.submitComment = function() {
         $scope.postLabel = "POSTING...";
         return Comment.new({ comment: $scope.comment,
                              authentication_key:localStorage.getItem("authentication_key"), 
                              visid : $routeParams.id
                              }
                            ); 
            // Success
    
    }
    
    if ($location.search().voted) {
        $scope.thank();  
    }
    

});
