app.controller('menuController', function($scope, $rootScope, $route, $location) {
    $scope.visLinks = [{name : "Visualisations", url : "/", img:"visualisations.png"},
                       {name : "Most Recent", url : "", url : "/?newest=18", img:"ic_new_releases_black_24dp.png"}]

    $scope.contentLinks = [{name : "Submit Visualisation", class:"submit vis", url : "/submit/visualisation", img:"ic_add_box_black_24dp.png"},
                           {name : "Submit Advert", class : "submit advert", url : "/submit/advert", img:"ic_add_box_black_24dp.png"}]

    $scope.adminLinks = [{name : "Moderate Content", class:"moderate", url : "/moderate", img:"ic_check_box_black_24dp.png"},
                         {name : "Schedule Content", class : "schedule", url : "/schedule", img:"ic_timer_black_24dp.png"}]


    $scope.getQueryParameters = function(str) {
        var params = (str).replace(/(.*\?)|(.*)/, '').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
        return arraysEqual(Object.keys(params), [""]) ? {} : params; 
    }

    $scope.isCurrentMenuItem = function(item) {
        return item.url.replace(/(\?.*)/, '') == $location.path() && 
               arraysEqual(Object.keys($scope.getQueryParameters(item.url)), Object.keys($location.search()));
    }

    $rootScope.logOut = function() {
        $rootScope.user = null;
        localStorage.removeItem("authentication_key"); 
    }

    $scope.getSignInUrl = function() {
        return "#/sign-in?return=" + $location.path();   
    }
});