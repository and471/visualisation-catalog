
app.controller('visualisationController', function ($scope, $rootScope, Visualisation, Comment, $routeParams, $location) {
    $rootScope.page = {title: "Visualisations",  headerClass:"visualisations", searchEnabled : false, class:"view-visualisation"}
    
    $scope.postLabel = "POST";

    var params = { id : $routeParams.id };
    if ($rootScope.user != null) {
        $scope.currentAvatar = $rootScope.user.avatar;
        params.authentication_key = localStorage.getItem("authentication_key");   
    } else {
        $scope.currentAvatar = null;    
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
    
    $scope.submitComment = function(comment_content) {
        $scope.postLabel = "POSTING...";
        Comment.new({ comment: { content : comment_content },
                      authentication_key:localStorage.getItem("authentication_key"), 
                      visid : params.id
                    },
            // Success
            function() {
//                $scope.commentItems = Comment.query(params.id);
                $scope.comment_content = '';
                comment_content = '';
                $scope.postLabel = "POST";
                $scope.comments = Comment.query(params, function() {}, 
                    // Failure
                    function() {
                        $scope.comments = null;
                        showToast("Comments could not be retrieved");
                    }
                );
                console.log($scope.comments);
        });
    }
    
    $scope.comments = Comment.query(params, function() {}, 
        // Failure
        function() {
            $scope.comments = null;
            showToast("Comments could not be retrieved");
        }
    );
    
    if ($location.search().voted) {
        $scope.thank();  
    }
    

});
