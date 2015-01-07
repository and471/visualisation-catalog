app.controller('submitAdvertController', function($scope, $rootScope, $route, $location) {
    if ($rootScope.user == null || $rootScope.user == undefined) {
        showToast("Please log in to submit content");
        $location.path("sign-in"); $location.search("return", "/submit/visualisation");  return;
    }
    $rootScope.page = {title: "Submit Advert", headerClass:"submit-advert", searchEnabled : false, class:"submit"}
    $scope.options = ['weblink', 'file'];
    $scope.submitAdvert = function() {
        var fd = new FormData(document.getElementById("submit-visualisation"));
        var content_type = document.getElementById("content_type");
        var value = content_type.options[content_type.selectedIndex].value;
        fd.append('visualisation[vis_type]', 'advert');
        fd.append('visualisation[content_type]', value);
        fd.append('authentication_key', localStorage.getItem("authentication_key"));
        if (value == 'weblink'){
            fd.append('visualisation[content]', '');
        } else {
            fd.append('visualisation[link]', '');
        }
        if (document.getElementById('name').value == ''){
          showToast("Please submit a name");
        } else if (document.getElementById('description').value == ''){
          showToast("Please submit a description");
        } else if (document.getElementById('url').value == '' && value == 'weblink'){
          showToast("Please submit a url");
        } else if (document.getElementById('content').value == '' && value == 'file'){
          showToast("Please submit a file");
        } else {
          $.ajax({
                url: "/visualisations",
                data: fd,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST'
            });
            showToast("Thanks for submitting! A moderator will approve your content shortly");
          $location.path('/');
        }
    }
});

app.controller('submitVisualisationController', function($scope, $rootScope, $route, $location) {
    if ($rootScope.user == null || $rootScope.user == undefined) {
        showToast("Please log in to submit content");
        $location.path("sign-in"); $location.search("return", "/submit/visualisation");  return;
    }
    
    $rootScope.page = {title: "Submit Visualisation",  headerClass:"submit-visualisation", searchEnabled : false, class:"submit"}
    $scope.submit = { img:"assets/camera.png" }
    $scope.options = ['weblink', 'file'];
    
    $scope.submitVisualistion = function() {
        var fd = new FormData(document.getElementById("submit-visualisation"));
        var content_type = document.getElementById("content_type");
        var value = content_type.options[content_type.selectedIndex].value;
        fd.append('visualisation[vis_type]', 'vis');
        fd.append('visualisation[content_type]', value);
        fd.append('authentication_key', localStorage.getItem("authentication_key"));
        if (value == 'weblink'){
            fd.append('visualisation[content]', '');
        } else {
            fd.append('visualisation[link]', '');
        }
        if (document.getElementById('screenshot').value == ''){
          showToast("Please submit a screenshot");
        } else if (document.getElementById('name').value == ''){
          showToast("Please submit a name");
        } else if (document.getElementById('description').value == ''){
          showToast("Please submit a description");
        } else if (document.getElementById('url').value == '' && value == 'weblink'){
          showToast("Please submit a url");
        } else if (document.getElementById('content').value == '' && value == 'file'){
          showToast("Please submit a file");
        } else {
          $.ajax({
                url: "/visualisations",
                data: fd,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST'
            });
            showToast("Thanks for submitting! A moderator should approve your content shortly");
          $location.path('/');
        }

      
    }
});

function submit(vis_type) {}

