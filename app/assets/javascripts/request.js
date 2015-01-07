app.controller('requestAccessController', function($scope, $rootScope, $http, $routeParams, $location) {
   
    $rootScope.page = {title: "External user access request", headerClass:"request-access", class:"request-access"}
    $scope.requesting = false;
    
    $scope.requestLabel = "Request Access"

    $scope.request = function(name, company, email, notes, username, password) {
        $scope.requesting = true;
        $scope.requestLabel = "Sending request...";
        
        $http.post('/request.json', {name:name, company:company, email:email, notes:notes, 
                                            username:username, password:password}).
            success(function(data, status, headers, config) {
                $scope.requesting = false;
                $scope.requestLabel = "Request sent"
                
              
                $location.path("/");
                showToast("Thankyou for your request. An administrator will be in contact shortly.")
            }).
            error(function(data, status, headers, config) {
                $scope.requesting = false;
                $scope.requestLabel = "Request Access"
                showToast("Failed to send request (" + status + "). Please try again later.")
            });
    }
});
