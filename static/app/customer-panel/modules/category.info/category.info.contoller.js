angular
    .module("categoryinfoModule", ["categoryFactoryModule",
        "storeServiceModule", "couponFactoryModule", "Directives", "satellizer"])
    .controller("categoryinfoCtrl", function ($scope, $state, $filter, $ocLazyLoad, $sce,
                                              $stateParams, $http, $rootScope, $compile, $auth) {
        $scope.favorite = {
            favorite: false
        };
        $scope.filter = {
            store: {},
            wallet: {}
        };
        $scope.showMore = {
            all: {},
            deals: {},
            coupons: {}
        };
        $scope.params = undefined;
        $scope.search = {
            store: undefined,
            wallet: undefined
        };
        $scope.category = undefined;
        $scope.coupons = [];
        $scope.filterCoupons = [];
        $scope.expiredCoupons = [];
        $scope.categories = {};
        $scope.stores = [];
        // manageFavorite function
        $scope.manageFavorite = function () {
            $scope.favorite.favorite = !$scope.favorite.favorite;
        };
        $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };

        // apply filter for coupons array
        $scope.applyFilter = function () {
            $scope.filterCoupons = $filter("couponFilter")($scope.coupons, $scope.filter);
            $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
            $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
        };

        if($stateParams['url']) {
            // get category information
            var where = {};
            where['url'] = $stateParams.url;

            var embedded = {};
            embedded['related_categories'] = 1;
            embedded['top_stores'] = 1;
            embedded['related_coupons'] = 1;
            embedded['related_coupons.related_categories'] = 1;
            embedded['related_coupons.related_stores'] = 1;
            
            url = '/api/1.0/categories/'+'?where='+JSON.stringify(where)+'&embedded='+JSON.stringify(embedded);
            $http({
                url: url,
                method: "GET"
            }).then(function (category) {
                console.log(category);
                if(category['data']) {
                    if(category.data._items.length) {
                        $scope.category = category.data._items[0];
                        $scope.category.toDayDate = new Date();
                        $scope.category.voting = Math.floor(Math.random() * (500 - 300 + 1)) + 300;

                        // SEO title and description
                        $rootScope.pageTitle = $scope.category.seo_title;
                        $rootScope.pageDescription = $scope.category.seo_description;

                        console.log("Final Category details: ", $scope.category);
                        
                        angular.forEach($scope.category.related_coupons, function (item) {
                            if(new Date(item.expire_date) > new Date()) {
                                if($scope.coupons.indexOf(item) == -1) {
                                    $scope.coupons.push(item);
                                    $scope.filterCoupons.push(item);
                                    $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
                                    $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
                                }
                            }
                        });

                        angular.forEach($scope.coupons, function (item) {
                            // get the list of categories under particular coupons
                            angular.forEach(item.related_categories, function (category) {
                                if(category == null) return true;
                                if(!$scope.categories[category.category_type]) {
                                    $scope.categories[category.category_type] = [];
                                    $scope.categories[category.category_type].push(category);
                                } else {
                                    var items = $filter('filter')($scope.categories[category.category_type], {_id: category._id});
                                    if(!items.length) {
                                        $scope.categories[category.category_type].push(category);
                                    }
                                }
                            });
                            // get the list of stores from the coupon store
                            angular.forEach(item.related_stores, function(rel_store) {
                                var items = $filter('filter')($scope.stores, {_id: rel_store._id});
                                if(!items.length) {
                                    $scope.stores.push(rel_store);
                                }
                            });
                        });


                        console.log($scope.stores, $scope.coupons, "categories", $scope.categories);
                    } else {
                        $state.go('404');
                    }
                }
            }, function (error) {
                console.log(error);
            });
        } else {
            $state.go('main.category');
        }

        // oepn comment section
        $scope.openComment = function (item) {
            console.log("Comment Coupon Item: ", item);
            $("comments").remove();
            if($auth.isAuthenticated()) {
                $scope.info = {
                    item: item,
                    token: $auth.getToken()
                };
                // open directive popup
                var el = $compile( "<comments info='info'></comments>" )( $scope );
                $("body").append(el);
                setTimeout(function () {
                    $("#commentPopup").modal("show");
                }, 1000);
                console.log(el)
            }
        };

        //  ======== if stateParams having the coupon code
        if($stateParams['cc']) {
            $("coupon-info-popup").remove();
            $scope.$watch('coupons', function (newVal, oldVal) {
                console.log(newVal, oldVal);
                if(newVal) {
                    angular.forEach(newVal, function (item) {
                        if(item._id == $stateParams.cc) {
                            $scope.couponInfo = item;

                            // open directive popup
                            var el = $compile( "<coupon-info-popup parent='category' type='category' coupon='couponInfo'></coupon-info-popup>" )( $scope );
                            $("body").append(el);
                            setTimeout(function () {
                                $("#couponPopup").modal("show");
                            }, 1000);
                            console.log(el)
                        }
                    });
                }
            }, true);
        }
    })

    // apply filters on filters
    .filter('couponFilter', function () {
        return function (items, filter) {
            var list = [];
            if(!Object.keys(filter.store).length && !Object.keys(filter.wallet).length) {
                return items;
            }
            // return all items if all items of object is false
            var count = 0;
            angular.forEach(filter, function (values, keys) {
                angular.forEach(values, function (val, key) {
                    if(val == true) {
                        count ++;
                    }
                });
            });
            if(count == 0) {
                return items;
            }
            angular.forEach(items, function (item) {
                angular.forEach(filter, function (values, keys) {
                    angular.forEach(values, function (val, key) {
                        angular.forEach(item.related_stores, function (store) {
                            if(val == true && key == store._id && list.indexOf(item) == -1) {
                                list.push(item);
                            }
                        });
                        angular.forEach(item.related_categories, function (category) {
                            if(val == true && key == category._id && list.indexOf(item) == -1) {
                                list.push(item);
                            }
                        });
                    });
                });
            });
            return list;
        }
    });