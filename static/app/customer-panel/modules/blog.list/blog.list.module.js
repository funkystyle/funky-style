angular.module("blogListModule", [])
.controller("blogListCtrl", function ($scope, $stateParams, $state, $http, $sce) {
    console.log("Blog List Controller!");

    setTimeout(function () {
        $('#myCarousel').carousel({
            interval: false
        });

        $('.fdi-Carousel .item').each(function (index, item) {
            if (index == 0) {
                $(this).addClass('active');
            }
            var next = $(this).next();
            if (!next.length) {
                next = $(this).siblings(':first');
            }
            next.children(':first-child').clone().appendTo($(this));

            if (next.next().length > 0) {
                next.next().children(':first-child').clone().appendTo($(this));
            }
            else {
                $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
            }
        });
    }, 1000);

    $scope.trustAsHtml = function(string) {
        if(string) {
            return $sce.trustAsHtml(string);
        }
    };


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