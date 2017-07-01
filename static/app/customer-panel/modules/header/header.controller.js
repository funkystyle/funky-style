angular.module("headerModule", ["ui.bootstrap", "APP",
    "constantModule", "storeServiceModule", "categoryFactoryModule", "couponFactoryModule"])
    .controller("headerCtrl", function ($scope, auth, $state, $http, URL, $filter,
                                        categoryFactory, storeFactory, couponFactory, $q, HTTP, $location) {
        console.log("header controller!");
        // declaring the scope variables
        $scope.user = {};
        $scope.featuredStores = [];
        $scope.totalItems = [];
        $scope.allStores = [];

        if(localStorage.getItem('satellizer_token')) {
            // getting the current user information
            auth.me().then(function (data) {
                console.log("Logged User Data: ============ ", data.data);
                $scope.user = data.data;
            }, function (error) {
                console.log(error);
                localStorage.removeItem('satellizer_token');
            });
        }

        // get the stores
        var obj = {
            "projection" : {
                "name": 1,
                "url": 1,
                "image": 1,
                "featured_store": 1,
                "menu": 1,
                "related_coupons": 1,
                "related_coupons.title": 1,
                "related_coupons.url": 1
            },
            "embedded": {
                "related_coupons": 1
            },
            "random_number": new Date().getDate()
        };

        // get the list of stores
        HTTP.get(obj, 'stores').then(function (items) {
            angular.forEach(items, function (item) {
                // collect all featured stores
                if(item.featured_store == true) {
                    $scope.featuredStores.push(item);
                }
                $scope.allStores.push(item);
            });
        });

        // get the list of categories
        $scope.allCategories = [];
        delete obj.featured_store;
        obj.featured_category = 1;
        HTTP.get(obj, 'categories').then(function (items) {
            $scope.allCategories = items;
        });


        // search by query
        $scope.getItems = function (query) {
            if(!query) return;
            var list = [],
                source = {
                    store: $scope.allStores,
                    category: $scope.allCategories
                };
            // get the selected stores, categories, Coupons
            angular.forEach(source, function (items, key) {
                angular.forEach(items, function (item) {
                    // push stores in to array
                    if(item.name.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                        item.relativePath = key
                        list.push(item);
                    }
                    // push related coupons into array
                    angular.forEach(item.related_coupons, function (coupon) {
                        if(coupon.title.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                            var obj = {
                                name: coupon.title,
                                image: item.image,
                                url: item.url,
                                relativePath: key
                            };
                            list.push(obj);
                        }
                    });
                });
            });
            console.log("Filtered List: ", list);
            return list;
        };

        // select match
        $scope.goDetails = function ($item, $model, $label) {
            $location.path('/'+$item.relativePath+"/"+$item.url);
            $scope.customPopupSelected = undefined;
        };

        // logout
        $scope.logout = function () {
            if(localStorage.getItem('satellizer_token')) {
                $http({
                    url: URL.logout,
                    method: "GET"
                }).then(function (data) {
                    console.log(data);
                    localStorage.removeItem('satellizer_token');
                    $state.go('main.login');
                }, function (error) {
                    console.log(error);
                });
            }
        };
    })
    .factory("HTTP", function ($http, $q) {
        return {
            get: function (obj, url) {
                var d = $q.defer();
                var finalUrl = "/api/1.0/"+url+"?projection="+JSON.stringify(obj.projection)+"&embedded="+JSON.stringify(obj.embedded)+"&r="+Math.random();
                $http({
                    url: finalUrl,
                    mathod: "GET"
                }).then(function (data) {
                    if(data['data']['_items']) {
                        var items = data.data._items;
                        console.log("All ",url, items);
                        d.resolve(items);
                    }
                }, function (error) {
                    console.log(error);
                    d.reject(error);
                });

                return d.promise;
            }
        }
    });