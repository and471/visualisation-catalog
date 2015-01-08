
app.controller('moderateController', function(Visualisation, $scope, $rootScope, $location) {

    if ($rootScope.user == null || $rootScope.user == undefined || !$rootScope.user.isAdmin) {
        showToast("Please log in as an administrator");
        $location.search("return", "/moderate"); $location.path("sign-in"); return;
    }
    
    $rootScope.page = {title: "Moderate Content",  headerClass:"moderate", searchEnabled : true, class:"moderate"}


    $scope.externalUsers = [];

    $scope.approve = function(event, item) {
        Visualisation.approve({id : item.id, authentication_key:localStorage.getItem("authentication_key")},
            // Success
            function() {
                $scope.getContentToModerate();
            }
        );
        $scope.fadeOutRow(event.target);
    }

    $scope.reject = function(event, item) {
        Visualisation.reject({id : item.id, authentication_key:localStorage.getItem("authentication_key")},
            // Success
            function() {
                $scope.getContentToModerate();
            }
        );
    }
    
    $scope.formatContentType = function(content_type) {
		return formatContentType(content_type);
	}
	
	$scope.getContentToModerate = function() {
            $scope.content = Visualisation.query({needsModeration : 'true', expandUser: 'true', 
                                              authentication_key:localStorage.getItem("authentication_key")});
	}
	
	$scope.getContentToModerate();

    performAnimation(".animate");

});

function formatContentType(content_type) {
    if (content_type == "vis")    return "Visualisation";
    if (content_type == "advert") return "Advert";
    return ""   
}
