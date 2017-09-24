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
    .controller("blogHeaderCtrl", function ($scope, $http, $state, $filter, Query, $sce) {
        // ==== jquery Script
        console.log("blog Header Controller!");
        $scope.blogs = [];
        $scope.categories = [];

        $scope.trustAsHtml = function(string, length) {
            if(string) {
                string = (string.length > length) ? string.substr(0, length)+" ...": string.substr(0, length);
                return $sce.trustAsHtml(string);
            }
        };

        // Get the top banner from banners table
        $scope.top_banner = {};
        var where = JSON.stringify({
            "top_banner_string": 'blog',
            "expired_date": {
                "$gte": new Date().toGMTString()
            }
        });
        var url = "/api/1.0/banner?where="+where;
        Query.get(url).then(function (banner) {
            console.log("banner Details: ", banner.data._items);
            $scope.top_banner = banner.data._items[0];
        });

        // Get the Side banner from banners table
        $scope.side_banner = {};
        where = JSON.stringify({
            "side_banner_string": 'blog',
            "expired_date": {
                "$gte": new Date().toGMTString()
            }
        });
        url = "/api/1.0/banner?where="+where;
        Query.get(url).then(function (banner) {
            console.log("banner Details: ", banner.data._items);
            $scope.side_banner = banner.data._items[0];
        });

        // get the list of all blogs
        var embedded = JSON.stringify({
            "last_modified_by": 1,
            "related_categories": 1
        });
        url = '/api/1.0/blog/?embedded='+embedded+"&max_results=7";
        Query.get(url).then(function (data) {
            console.log("Blog List: ", data.data._items);
            $scope.blogs = data.data._items;
            angular.forEach($scope.blogs, function (item) {
                item._updated = new Date(item._updated);
                // get related categories
                angular.forEach(item.related_categories, function (cat) {
                    var length = $filter("filter")($scope.categories, {_id: cat._id}).length;
                    if(length === 0) {
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
                    if (index === 0) {
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
    .factory("Query", function ($http, $q) {
        return {
            get: function (url) {
                var d = $q.defer();
                $http({
                    url: url+"&r="+Math.random(),
                    method: "GET"
                }).then(function (data) {
                    d.resolve(data);
                }, function (error) {
                    d.reject(error);
                });
                return d.promise;
            }
        }
    });