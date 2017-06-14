var blog = angular.module("blogCategoryModule", [])
    .controller("blogCategoryCtrl", function ($scope, $state, $stateParams, $http, $filter) {
        console.log("Blog category controller!");

        // get all the list of categories
        console.log("State Params: ", $stateParams);
        $scope.blogs = [];

        // get the category
        var where = {};
        where['url'] = $stateParams.url;
        $http({
            url: '/api/1.0/categories/'+'?where='+JSON.stringify(where)+'&r='+Math.random(),
            method: "GET"
        }).then(function (cat) {
            var items = cat.data._items;
            if(items.length == 0) {
                $state.go('404');
            } else {
                $scope.category = items[0];
                var embedded = JSON.stringify({
                    "related_categories": 1
                });
                var temp = {};
                temp["related_categories"] = {
                    "$in": [items[0]._id]
                };
                url = "/api/1.0/blog"+"?where="+JSON.stringify(temp)+"&r="+Math.random()+"&embedded="+embedded;
                $http({
                    url: url,
                    method: "GET"
                }).then(function (data) {
                    console.log("Blogs Data: ", data.data._items);
                    if(data['data']) {
                        $scope.blogs = data.data._items;

                        angular.forEach($scope.blogs, function (item) {
                            item._updated = new Date(item._updated);
                            item.related_categories = [items[0]];
                        });
                    }
                }, function (error) {
                    console.log(error);
                });
            }
        });
    });