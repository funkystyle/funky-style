angular
    .module("storeinfoModule", ["categoryFactoryModule", "Directives"])
    .controller("storeinfoController", function ($scope, $stateParams, $http, $state,
                                                 categoryFactory, $filter, $sce, $ocLazyLoad, $rootScope, $compile) {
        $scope.favorite = {
            favorite: false
        };
        $scope.comment = {};
        $scope.filter = {
            category: {},
            wallet: {},
            bank: {},
            city: {},
            brands: {},
            festivals: {}
        };
        $scope.search = {
            category: undefined,
            wallet: undefined,
            bank: undefined,
            city: undefined,
            brands: undefined,
            festivals: undefined
        };
        $scope.showMore = {
            all: {},
            deals: {},
            coupons: {}
        };
        $scope.store = {};
        $scope.coupons = [];
        $scope.expiredCoupons = [];
        $scope.suggestedCoupons = [];
        $scope.relatedCoupons = [];
        $scope.filterCoupons = [];
        $scope.categories = {};

        $scope.trustAsHtml = function(string) {
            if(string) {
                return $sce.trustAsHtml(string);
            }
        };

        // comment now
        $scope.commentNow = function (item) {
            $scope.comment.store = item.related_stores[0];
        };

        // manageFavorite function
        $scope.manageFavorite = function () {
            $scope.favorite.favorite = !$scope.favorite.favorite;
        };

        // apply filter for coupons array
        $scope.applyFilter = function () {
            $scope.filterCoupons = $filter("couponFilter")($scope.coupons, $scope.filter);
            $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
            $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
        };

        if($stateParams['url']) {
            // get store information
            var where = {};
            where['url'] = $stateParams.url;

            var embedded = {};
            embedded['recommended_stores'] = 1;
            embedded['related_categories'] = 1;
            embedded['top_stores'] = 1;
            embedded['related_stores'] = 1;
            embedded['related_stores.related_coupons'] = 1;
            embedded['related_stores.related_coupons.related_categories'] = 1;
            embedded['related_deals'] = 1;
            embedded['related_coupons'] = 1;
            embedded['related_coupons.related_categories'] = 1;
            embedded['related_coupons.recommended_stores'] = 1;
            embedded['related_coupons.recommended_stores.related_coupons'] = 1;
            embedded['related_coupons.recommended_stores.related_coupons.related_categories'] = 1;

            var url = '/api/1.0/stores/'+'?where='+JSON.stringify(where)+'&embedded='+
                JSON.stringify(embedded)+'&r=' + new Date().getTime()+"&number_of_clicks=1";
            $http({
                url: url,
                method: "GET"
            }).then(function (store) {
                if(store.data) {
                    $scope.store = store.data._items[0];
                    $scope.store.toDayDate = new Date();
                    $scope.store.voting = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
                    $rootScope.pageTitle = $scope.store.meta_title;
                    $rootScope.pageDescription = $scope.store.meta_description;
                    console.log($scope.store);
                    
                    // applying carousel after dom prepared
                    $('.carousel').carousel({
                        interval: 4000,
                        pause: true
                    });
                    
                    angular.forEach($scope.store.related_coupons, function (item) {
                        if(new Date(item.expire_date) > new Date()) {
                            if($scope.coupons.indexOf(item) == -1) {
                                $scope.coupons.push(item);
                                $scope.filterCoupons.push(item);
                                $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
                                $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
                            }
                        } else {
                           if($scope.expiredCoupons.indexOf(item) == -1) {
                               $scope.expiredCoupons.push(item);
                           }
                        }
                    });

                    // if top stores length is zero query to stores for fetching featured stores
                    if($scope.store.top_stores.length == 0) {
                        var top_store_url = '/api/1.0/stores?where={"featured_store": true}&max_results=24&rand_number='+Math.random();
                        var cat = {};
                        cat['featured_category'] = true;
                        $http({
                            url: top_store_url,
                            mathod: "GET"
                        }).then(function (top_stores) {
                            console.log(top_stores);
                            if(top_stores.data['_items']) {
                                $scope.store.top_stores = top_stores.data._items;

                                angular.forEach($scope.store.related_stores, function (related_store) {
                                    angular.forEach($scope.store.top_stores, function (item, index) {
                                        if(item._id == related_store._id) {
                                            $scope.store.top_stores.splice(index, 1);
                                        }
                                    })
                                });
                            }
                        }, function (error) {
                            console.log(error);
                        })
                    }
                    
                    angular.forEach($scope.coupons, function (item) {
                        angular.forEach(item.related_categories, function (category) {
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

                        // getting suggested coupons from the rescommended stores
                        angular.forEach(item.recommended_stores, function (store) {
                             angular.forEach(store.related_coupons, function (r_coupon) {
                                var items = $filter('filter')($scope.suggestedCoupons, {_id: r_coupon._id});
                                if(!items.length) {
                                    $scope.suggestedCoupons.push(r_coupon);
                                }
                             })
                        });
                    });
                    console.log("Final categories are ", $scope.categories)
                    // getting related coupons from the related stores
                    angular.forEach($scope.store.related_stores, function (item) {
                        angular.forEach(item.related_coupons, function (r_coupon, index) {
                            console.log(r_coupon)
                            var items = $filter('filter')($scope.relatedCoupons, {_id: r_coupon._id});
                            if(!items.length) {
                                $scope.relatedCoupons.push(r_coupon);
                            }
                        }) ;
                    });


                    console.log($scope.expiredCoupons, $scope.coupons, "suggested coupons ", $scope.suggestedCoupons, "Related coupons ", $scope.relatedCoupons);
                }
            }, function (error) {
                console.log(error);
            });
        } else {
            $state.go('main.home');
        }

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
                            var el = $compile( "<coupon-info-popup parent='store' type='store' coupon='couponInfo'></coupon-info-popup>" )( $scope );
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
            if(!Object.keys(filter.category).length && !Object.keys(filter.wallet).length &&
                !Object.keys(filter.bank).length && !Object.keys(filter.city).length &&
                !Object.keys(filter.brands).length && !Object.keys(filter.festivals).length) {
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
                angular.forEach(item.related_categories, function (category) {
                    angular.forEach(filter, function (values, keys) {
                        angular.forEach(values, function (val, key) {
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