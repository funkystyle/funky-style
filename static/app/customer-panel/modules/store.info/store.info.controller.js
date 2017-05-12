angular
    .module("storeinfoModule", ["footerModule", "storeServiceModule", "couponFactoryModule", "categoryFactoryModule"])
    .controller("storeinfoController", function ($scope, $stateParams, $state, storeFactory, couponFactory,
                                                 categoryFactory, $filter, $sce) {
        $scope.favorite = {
            favorite: false
        };
        $scope.filter = {
            category: {},
            wallet: {}
        };
        $scope.search = {
            category: undefined,
            wallet: undefined
        };
        $scope.store = undefined;
        $scope.coupons = [];
        $scope.filterCoupons = [];
        $scope.categories = [];

        $scope.trustAsHtml = function(string, length) {
            if(string) {
                return $sce.trustAsHtml(string.substring(1, length));
            }
        };
        // manageFavorite function
        $scope.manageFavorite = function () {
            $scope.favorite.favorite = !$scope.favorite.favorite;
        };

        // apply filter for coupons array
        $scope.applyFilter = function () {
            $scope.filterCoupons = $filter("couponFilter")($scope.coupons, $scope.filter);
        };

        if($stateParams['url']) {
            // get store information
            storeFactory.getStore({field: 'url', query: $stateParams.url}).then(function (store) {
                if(store.data) {
                    $scope.store = store.data._items[0];
                    $scope.store.toDayDate = new Date();
                }
                // get all the coupons related to this store
                couponFactory.get().then(function (data) {
                    if(data.data) {
                        var coupons = data.data._items;
                        // get only this store relates coupons
                        angular.forEach(coupons, function (item) {
                            var rel_stores = $filter('filter')(item.related_stores, {_id: $scope.store._id});
                            var items = $filter('filter')($scope.coupons, {_id: item._id});
                            if(rel_stores.length && !items.length) {
                                $scope.coupons.push(item);
                                $scope.filterCoupons.push(item);
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
            }, function (error) {
                console.log(error);
            });
        } else {
            $state.go('main.home');
        }
    })

    // apply filters on filters
    .filter('couponFilter', function () {
        return function (items, filter) {
            var list = [];
            if(!Object.keys(filter.category).length && !Object.keys(filter.wallet).length) {
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