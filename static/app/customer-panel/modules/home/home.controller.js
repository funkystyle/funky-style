angular.module('homeModule', ["headerModule", "storeServiceModule", "couponFactoryModule",
    "dealFactoryModule", "categoryFactoryModule", "Directives"])
    .controller('homeCtrl', function ($scope, $sce, storeFactory, $http, couponFactory, $filter, dealFactory,
                                      categoryFactory, $ocLazyLoad, $stateParams, $rootScope, SEO, $compile) {
        console.log("home controller");
        $scope.params = undefined;
        $scope.deals = [];
        $scope.coupons = [];
        $scope.categories = [];


        // get the list of coupons
        var embedded = {};
        embedded['related_categories'] = 1;
        embedded['related_stores'] = 1;
        
        var url = '/api/1.0/coupons'+'?sort=-_created&embedded='+JSON.stringify(embedded)+'&rand_number' + new Date().getTime();
        $http({
            url: url,
            method: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                var coupons = data.data._items;
                angular.forEach(coupons, function (item) {
                    if(new Date(item.expire_date) > new Date()) {
                        if($scope.coupons.indexOf(item) == -1) {
                            $scope.coupons.push(item);
                        }
                    }
                });
            }
        }, function (error) {
            console.log(error);
        });

        // get the list of SEO
        SEO.getSEO().then(function (data) {
            angular.forEach(data, function (item) {
                if(item.selection_type.code == 'home') {
                    var data = SEO.seo("", item, 'home');
                    $rootScope.pageTitle = data.title;
                    $rootScope.pageDescription = data.description;
                }
            });
        });

        // get the slider banners
        $scope.banners = [];
        var where = JSON.stringify({
            "top_banner_string": 'home'
        });
        var projection = {
            "top_banner_string": 1,
            "image": 1,
            "title": 1,
            "image_text": 1
        };

        url = '/api/1.0/banner'+'?where='+where+'&projection='+JSON.stringify(projection)+'&rand_number' + new Date().getTime();
        $http({
            url: url,
            method: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                console.log("Banners: ", data.data._items);
                $scope.banners = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });

        // get the list of featured stores
        var store = {};
        store['featured_store'] = true;

        var projection = {};
        projection['name'] = 1;
        projection['url'] = 1;
        projection['image'] = 1;
        projection['menu'] = 1;
        $http({
            url: "/api/1.0/stores/?where="+JSON.stringify(store)+"&max_results="+24+"&projection="+JSON.stringify(projection)+"&rand_number" + new Date().getTime(),
            mathod: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.stores = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });


        // get the list of Categories
        var cat = {};
        cat['featured_category'] = true;

        var projection = {};
        projection['name'] = 1;
        projection['url'] = 1;
        projection['image'] = 1;
        $http({
            url: "/api/1.0/categories/?where="+JSON.stringify(cat)+"&max_results="+24+"&projection="+JSON.stringify(projection)+"&rand_number" + new Date().getTime(),
            mathod: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.categories = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });

        // get the list of featured stores
        $http({
            url: "/api/1.0/deals?max_results=24&rand_number" + new Date().getTime(),
            mathod: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.deals = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });


        //  ======== if stateParams having the coupon code
        if($stateParams['cc']) {
            $("coupon-info-popup").remove();
            $scope.$watch('coupons', function (newVal, oldVal) {
                if(newVal) {
                    angular.forEach(newVal, function (item) {
                        if(item._id == $stateParams.cc) {
                            $scope.couponInfo = item;
                            console.log("Coupon Info: ", $scope.couponInfo);
                            // open directive popup
                            var el = $compile( "<coupon-info-popup type='home' coupon='couponInfo'></coupon-info-popup>" )( $scope );
                            $("body").append(el);
                            setTimeout(function () {
                                $("#couponPopup").modal("show");
                            }, 1000);
                        }
                    });
                }
            }, true);
        }

        $scope.trustAsHtml = function(string) {
            if(string) {
                return $sce.trustAsHtml(string);
            }
        };

        // show description
        $scope.showDescription = function (id) {
            $(".show-description").hide();
            $("#show-desc-"+id).show();
        };
        $scope.closeDescription = function () {
            $(".show-description").hide();
        }
    });
