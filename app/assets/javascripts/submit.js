app.controller('submitAdvertController', function($scope, $rootScope, $route, $location) {
    if ($rootScope.user == null || $rootScope.user == undefined) {
        showToast("Please log in to submit content");
        $location.path("sign-in"); $location.search("return", "/submit/visualisation");  return;
    }
    
    $rootScope.page = {title: "Submit Advert", headerClass:"submit-advert", searchEnabled : false, class:"submit"}
    $scope.options = ['weblink', 'file'];
    
    $scope.submit = function() {
        submit($scope, $location, new FormData(document.getElementById("submit-advert")), "advert")
    }
    
    $scope.submitText= "Submit"
    
    performAnimation(".animate");
});

app.controller('submitVisualisationController', function($scope, $rootScope, $route, $location) {
    if ($rootScope.user == null || $rootScope.user == undefined) {
        showToast("Please log in to submit content");
        $location.path("sign-in"); $location.search("return", "/submit/visualisation");  return;
    }
    
    $rootScope.page = {title: "Submit Visualisation",  headerClass:"submit-visualisation", searchEnabled : false, class:"submit"}
    $scope.options = ['weblink', 'file'];
    
    $scope.submit = function() {
        submit($scope, $location, new FormData(document.getElementById("submit-visualisation")), "vis")
    }
    
    $scope.submitText= "Submit"
    
    performAnimation(".animate");
});

function submit($scope, $location, fd, vis_type) {

    var content_type_selector = document.getElementById("content_type");
    var content_type = content_type_selector.options[content_type_selector.selectedIndex].value;
    
    // Add hidden fields
    fd.append('visualisation[vis_type]', vis_type);
    fd.append('visualisation[content_type]', content_type);
    fd.append('authentication_key', localStorage.getItem("authentication_key"));
    if (content_type == 'weblink'){
        fd.append('visualisation[content]', '');
    } else {
        fd.append('visualisation[link]', '');
    }
    
    // Check some content is being uploaded
    if (content_type == 'weblink' && $('#url').val().length < 1){
          showToast("Please enter a URL"); return;
    } else if (content_type == 'file' && $('#content').val().length < 1){
          showToast("Please enter a file"); return;
    } else if (content_type == 'file' && !(is_image($("#content")) || is_video($("#content"))) ){
          showToast("Please upload a file with a supported file type"); return;
    }
    
    if (vis_type == "vis") {
        if (content_type == 'file' && !is_image($("#screenshot"))) {
              showToast("Please upload a screenshot with a supported file type"); return;
        }
    }
    
    $scope.submitText= "Submitting..."
    
    $.ajax({
        url: "/visualisations",
        data: fd,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST'
    }).done(function() {
        showToast("Thanks for submitting! A moderator should approve your content shortly");
        $location.path('/');
        $scope.$apply();
    }).fail(function() {
        showToast("There was an error submitting, please try again later.");
    }).always(function() {
        $scope.submitText= "Submit"
        $scope.$apply();
    }); 
}

function is_image(input) {
    if ($(input).get(0).files.length < 1) return false;
    
    var type = $(input).get(0).files[0].type;
    
    return type == "image/jpeg" ||
            type == "image/jpg" ||
            type == "image/png";
}

function is_video(input) {
    if ($(input).get(0).files.length < 1) return false;
    
    var type = $(input).get(0).files[0].type;
    
    return type == "video/mp4" ||
            type == "video/webm" ||
            type == "video/ogg" ||
            type == "video/ogv";
}

