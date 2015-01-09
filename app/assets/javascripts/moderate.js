
app.controller('moderateController', function(Visualisation, Request, User, $scope, $rootScope, $location) {

    if ($rootScope.user == null || $rootScope.user == undefined || !$rootScope.user.isAdmin) {
        showToast("Please log in as an administrator");
        $location.search("return", "/moderate"); $location.path("sign-in"); return;
    }
    
    $rootScope.page = {title: "Moderate Content",  headerClass:"moderate", searchEnabled : true, class:"moderate"}

    $scope.approveContent = function(event, item) {
        Visualisation.approve({id : item.id, authentication_key:localStorage.getItem("authentication_key")},
            // Success
            function() {
                $scope.getContentToModerate();
            }
        );
    }

    $scope.rejectContent = function(event, item) {
        Visualisation.reject({id : item.id, authentication_key:localStorage.getItem("authentication_key")},
            // Success
            function() {
                $scope.getContentToModerate();
            }
        );
    }
    
    $scope.approveUser = function(event, request) {
        User.approve({id : request.user.id, authentication_key:localStorage.getItem("authentication_key")},
            // Success
            function() {
                $scope.getRequests();
            }
        );
    }

    $scope.rejectUser = function(event, request) {
        User.reject({id : request.user.id, authentication_key:localStorage.getItem("authentication_key")},
            // Success
            function() {
                $scope.getRequests();
            }
        );
    }
    
    $scope.formatContentType = function(content_type) {
		return formatContentType(content_type);
	}
	
	$scope.getContentToModerate = function() {
        $scope.content = Visualisation.query({needsModeration : 'true',
                                              authentication_key:localStorage.getItem("authentication_key")});
	}
	
	$scope.getRequests = function() {
        $scope.requests = Request.query({authentication_key:localStorage.getItem("authentication_key")});
	}
	
	$scope.getRequests();
	$scope.getContentToModerate();

    performAnimation(".animate");

});

function formatContentType(content_type) {
    if (content_type == "vis")    return "Visualisation";
    if (content_type == "advert") return "Advert";
    return ""   
}
