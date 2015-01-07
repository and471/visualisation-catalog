
app.controller('visualisationController', function ($scope, $rootScope, Visualisation, $routeParams, $location) {
    $rootScope.page = {title: "Visualisations",  headerClass:"visualisations", searchEnabled : false, class:"view-visualisation"}

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
    
    $scope.commentsname = "Joe Bloggs";
    $scope.commentsimage = "http://api.randomuser.me/portraits/thumb/men/88.jpg";
    $scope.commentstext = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    $scope.commentsdate = "10/11/2014";

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
    
    if ($location.search().voted) {
        $scope.thank();  
    }
    
    performAnimation(".animate");
});
