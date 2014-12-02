app.controller('submitAdvertController', function($scope, $rootScope, $route) {

    if ($rootScope.user == null || $rootScope.user == undefined) {
        showToast("Please log in to submit content");
        $location.path("sign-in"); $location.search("return", "/submit/visualisation");  return;
    }

    $rootScope.page = {title: "Submit Advert", headerClass:"submit-advert", searchEnabled : false, class:"submit"}
    $scope.submitAdvert = function() {
        submit('advert');
    }
});

app.controller('submitVisualisationController', function($scope, $rootScope, $route) {
    if ($rootScope.user == null || $rootScope.user == undefined) {
        showToast("Please log in to submit content");
        $location.path("sign-in"); $location.search("return", "/submit/visualisation");  return;
    }
    
    $rootScope.page = {title: "Submit Visualisation",  headerClass:"submit-visualisation", searchEnabled : false, class:"submit"}
    $scope.submit = { img:"assets/camera.png" }
    $scope.options = ['weblink', 'file'];
    
    $scope.submitVisualistion = function() {
        submit('visualistion');
    }
});

function submit(type) {

    var fd = new FormData(document.getElementById("submit-visualisation"));
    if (type == 'visualisation') {
        fd.append('visualisation[vis_type]', 'vis');
        fd.append('visualisation[content_type]', value);
        var content_type = document.getElementById("content_type");
        var value = content_type.options[content_type.selectedIndex].value;
    } else {
        fd.append('visualisation[vis_type]', 'advert');
    {
    console.log("key is " + localStorage.getItem("authentication_key"));
    fd.append('visualisation[authentication_key]', localStorage.getItem("authentication_key"));
    if (value == 'weblink'){
        fd.append('visualisation[content]', '');
    } else {
        fd.append('visualisation[link]', '');
    }
    if (document.getElementById('screenshot').value == '' && type == 'visualisation'){
        showToast("Please submit a screenshot");
    } else if (document.getElementById('name').value == ''){
        showToast("Please submit a name");
    } else if (document.getElementById('url').value == '' && value == 'weblink' && type == 'visualisation'){
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
        $route.reload();
    }
}
