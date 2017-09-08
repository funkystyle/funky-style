angular.module("headerModule", ["ui.bootstrap", "APP"])
    .controller("headerCtrl", function ($scope, auth, $state, $http, $filter, $q, HTTP, $location, $ocLazyLoad) {
        console.log("header controller!");
        $scope.isMobile = (window.innerWidth < 500);
        $scope.selectedSearch = {
            search: undefined
        };
        // Load CSS files
        $ocLazyLoad.load({
            files: [
                {type: 'css', path: 'static/bower_components/font-awesome-4.7.0/css/font-awesome.min.css'},
            ]
        });
        // declaring the scope variables
        $scope.user = {};
        $scope.featuredStores = [];
        $scope.totalItems = [];
        $scope.allStores = [];

        // Any function returning a promise object can be used to load values asynchronously
        $scope.searchResults = function(val) {
            console.log("Search Query Value is --- ", val);

            return $http.get('/api/1.0/search', {
                params: {
                    q: val
                }
            }).then(function(response){
                return response.data['data'];
            });
        };

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

        // go click to redirect
        $scope.goClick = function (item) {
            console.log("Header search: ", item, "main."+item.type, {url: item.url, cc: item['cc']});
            $state.go("main."+item.type, {url: item.url, cc: item['cc']});
            $scope.selectedSearch.search = undefined;
        };

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


        // logout
        $scope.logout = function () {
            if(localStorage.getItem('satellizer_token')) {
                $http({
                    url: "/api/1.0/auth/logout",
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