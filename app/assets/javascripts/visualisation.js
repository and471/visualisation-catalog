
app.controller('visualisationController', function ($scope, $rootScope, Visualisation, Comment, $routeParams, $location) {
    $rootScope.page = {title: "Visualisations",  headerClass:"visualisations", searchEnabled : false, class:"view-visualisation"}
    
    $scope.postLabel = "POST";

    var params = { id : $routeParams.id };
    var visparams = { visid : $routeParams.id };
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
                $("textarea#comment_content").val("")
                showToast("Thanks for posting a comment!");
                $scope.postLabel = "POST";
                $scope.getComments();
        });
    }
    
    $scope.getComments = function() {   
        $scope.comments = Comment.query(visparams, function() {}, 
            // Failure
            function() {
                $scope.comments = null;
                showToast("Comments could not be retrieved");
            }
        );
    }

    $scope.formatDate = function(string) {
        date = moment(string)
        return date.format("HH:mm DD/MM/YY")
    }
    
    if ($location.search().voted) {
        $scope.thank();  
    }
    
    performAnimation(".animate");

    $scope.getComments();

});
