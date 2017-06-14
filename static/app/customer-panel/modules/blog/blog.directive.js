var blog = angular.module("blogModule", [])
    .directive("blogTile", function () {
        return {
            restrict: "E",
            scope: {
                items: "=",
                nClass: "@"
            },
            templateUrl: "static/app/customer-panel/modules/blog/blog.tile.template.html",
            controller: function ($scope, $state, $sce) {
                console.log("Blog tile controller")
                $scope.trustAsHtml = function(string, length) {
                    if(string) {
                        string = string.substr(0, length)+" ...";
                        return $sce.trustAsHtml(string);
                    }
                };
            }
        }
    })
    .controller("blogHeaderCtrl", function ($scope, $http, $state, $filter) {
        // ==== jquery Script
        console.log("blog Header Controller!");
        $scope.blogs = [];
        $scope.categories = [];
        // get the list of all blogs
        var embedded = JSON.stringify({
            "last_modified_by": 1,
            "related_categories": 1
        });
        $http({
            url: '/api/1.0/blog/?embedded='+embedded+'&r='+Math.random(),
            method: "GET"
        }).then(function (data) {
            console.log("Blog List: ", data.data._items);
            $scope.blogs = data.data._items;
            angular.forEach($scope.blogs, function (item) {
                item._updated = new Date(item._updated);

                // get related categories
                angular.forEach(item.related_categories, function (cat) {
                    var length = $filter("filter")($scope.categories, {_id: cat._id}).length;
                    if(length == 0) {
                        cat.blog = {
                            url: item.url,
                            title: item.title
                        };
                        $scope.categories.push(cat);
                    }
                });
            });

            console.log("Final Categories: ", $scope.categories);
            setTimeout(function () {
                $('#myCarousel').carousel({
                    interval: false,
                    looop: false
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
        });
    })