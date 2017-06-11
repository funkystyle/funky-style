angular.module("blogListModule", [])
.controller("blogListCtrl", function ($scope, $stateParams, $state, $http) {
    console.log("Blog List Controller!");


    $scope.blogs = [];
    // get the list of all blogs
    var embedded = JSON.stringify({
        "last_modified_by": 1
    });
    $http({
        url: '/api/1.0/blog/?embedded='+embedded+'&r='+Math.random(),
        method: "GET"
    }).then(function (data) {
        console.log("Blog List: ", data.data._items);
        $scope.blogs = data.data._items;
        angular.forEach($scope.blogs, function (item) {
            item._updated = new Date(item._updated);
        });
    });
});