angular
    .module("storeinfoModule", ["footerModule", "storeServiceModule", "couponFactoryModule", "categoryFactoryModule"])
    .controller("storeinfoController", function ($scope, $stateParams, $state, storeFactory, couponFactory,
                                                 categoryFactory, $filter, $sce, $ocLazyLoad) {
        $scope.favorite = {
            favorite: false
        };
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
        $scope.store = undefined;
        $scope.coupons = [];
        $scope.suggestedCoupons = [];
        $scope.relatedCoupons = [];
        $scope.filterCoupons = [];
        $scope.categories = [];

        $scope.trustAsHtml = function(string) {
            if(string) {
                return $sce.trustAsHtml(string);
            }
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
            storeFactory.getStore({field: 'url', query: $stateParams.url}).then(function (store) {
                if(store.data) {
                    $scope.store = store.data._items[0];
                    $scope.store.toDayDate = new Date();
                    $scope.store.voting = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
                    console.log($scope.store);
                }
                // get all the coupons related to this store
                couponFactory.get({type: "related_stores", id: $scope.store._id}).then(function (data) {
                    if(data.data) {
                        var coupons = data.data._items;
                        // get only this store relates coupons
                        angular.forEach(coupons, function (item) {
                            var rel_stores = $filter('filter')(item.related_stores, {_id: $scope.store._id});
                            var items = $filter('filter')($scope.coupons, {_id: item._id});
                            if(rel_stores.length && !items.length) {
                                $scope.coupons.push(item);
                                $scope.filterCoupons.push(item);
                                $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
                                $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
                            }

                            angular.forEach(item.related_categories, function (category) {
                                var items = $filter('filter')($scope.categories, {_id: category._id});
                                if(!items.length) {
                                    $scope.categories.push(category);
                                }
                            });
                        });
                    }

                    console.log($scope.coupons, $scope.categories);
                }, function (error) {
                    console.log(error);
                });

                couponFactory.get({type: "recommended_stores", id: $scope.store._id}).then(function (data) {
                    if(data.data) {
                        $scope.suggestedCoupons = data.data._items;
                        console.log("Suggested coupons are --- ", $scope.suggestedCoupons);
                    }
                }, function (error) {
                    console.log(error);
                });
                var rel_stores_array = [];
                angular.forEach($scope.store.related_stores, function (item) {
                    rel_stores_array.push(item._id);
                });
                couponFactory.get({type: "related_stores", id: $scope.store._id}, rel_stores_array).then(function (data) {
                    if(data.data) {
                        $scope.relatedCoupons = data.data._items;
                        console.log("Related stores coupons are --- ", $scope.relatedCoupons);
                    }
                }, function (error) {
                    console.log(error);
                });
            }, function (error) {
                console.log(error);
            });
        } else {
            $state.go('main.home');
        }

        //  ======== if stateParams having the coupon code
        if($stateParams['cc']) {
            $scope.params = $stateParams.cc;
            $ocLazyLoad.load("static/bower_components/clipboard/dist/clipboard.min.js").then(function (data) {
                var clipboard = new Clipboard('.btn');

                clipboard.on('success', function(e) {
                    console.info('Action:', e.action);
                    console.info('Text:', e.text);
                    console.info('Trigger:', e.trigger);

                    e.clearSelection();
                });
                $scope.$watch('coupons', function (newVal, oldVal) {
                    console.log(newVal, oldVal);
                    if(newVal) {
                        angular.forEach(newVal, function (item) {
                            if(item._id == $stateParams.cc) {
                                $scope.couponInfo = item;
                            }
                        });
                    }
                }, true);
                clipboard.on('error', function(e) {
                    console.error('Action:', e.action);
                    console.error('Trigger:', e.trigger);
                });
            });
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