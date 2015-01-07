app.controller('signInController', function($scope, $rootScope, $http, $routeParams, $location) {
    if ($rootScope.user != null) {
        $location.path("/").search("return", null); return;
    }
    
    $rootScope.page = {title: "Sign in", headerClass:"sign-in", class:"sign-in"}
    $scope.authenticating = false;
    
    $scope.signInLabel = "Sign In"

    $scope.authenticate = function(username, password) {
        $scope.authenticating = true;
        $scope.signInLabel = "Signing in...";
        
        $http.post('/tokens.json', {username:username, password:password}).
            success(function(data, status, headers, config) {
                $scope.authenticating = false;
                $scope.signInLabel = "Sign In"
                
                localStorage.setItem("authentication_key", data.token);
                $rootScope.user = {}; // make user non-null
                $rootScope.logIn();
            
                $location.path($routeParams["return"]);
                $location.search("return", null);
            }).
            error(function(data, status, headers, config) {
                $scope.authenticating = false;
                $scope.signInLabel = "Sign In"
            });
    }
});