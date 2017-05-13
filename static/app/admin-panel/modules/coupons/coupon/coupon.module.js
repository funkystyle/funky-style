/* store module */
angular.module("couponModule", ['angular-table', 'constantModule',
    'toastr', 'cgBusy', 'satellizer', 'ui.select', 'couponFactoryModule',
    'storeFactoryModule', 'categoryFactoryModule', 'personFactoryModule'])
    .controller("couponCtrl", function($scope, $filter, toastr, $http, $q,
                                       mainURL, URL, $state, $stateParams, $auth, couponFactory,
                                       storeFactory, categoryFactory, personFactory) {
        $scope.coupons = [];
        $scope.stores = [];
        $scope.categories = [];
        $scope.persons = [];
        $scope.filterCoupons = [];
        $scope.search = {
            search: undefined
        };
        $scope.coupon_type = ["coupon", "offer"];
        $scope.show = false;
        $scope.check = {
            all: false,
            check: {}
        };
        $scope.filter = {};
        $scope.statusOptions = {};

        $scope.config = {
            itemsPerPage: 10,
            maxPages: 20,
            fillLastPage: "no"
        };
        $scope.filterByStatus = function (array) {
            $scope.filterCoupons = array;
        };
        $scope.clearAll = function () {
            $scope.filterCoupons = [];
            angular.forEach($scope.coupons, function (item) {
                $scope.filterCoupons.push(item);
            });
        };

        // apply type filter for filtering the coupons from table
        $scope.applyTypeFilter = function () {
            console.log($scope.coupons, $scope.filter);
            $scope.filterCoupons = $filter('typeCouponFilter')($scope.coupons, $scope.filter);
        };
        $scope.updateFilteredList = function() {
            $scope.filterCoupons = $filter("filter")($scope.coupons, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            $scope.load = $http({
                url: '/api/1.0/coupons?embedded={"recommended_stores":1, "related_categories":1, "related_stores":1, "last_modified_by": 1}',
                method: "GET"
            }).then(function (data) {
                // console.log(data);
                if(data['data']) {
                    $scope.coupons = data.data._items;
                    $scope.filterCoupons = data.data._items;
                    var destArray = _.groupBy(data.data._items, 'status');
                    destArray['All'] = $scope.coupons;
                    console.log(destArray);
                    $scope.statusOptions = destArray;
                    angular.forEach($scope.coupons, function(item) {
                        console.log(item);
                        $scope.check.check[item._id] = false;
                    })
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });

            storeFactory.get().then(function (data) {
                if(data['_items']) {
                    $scope.stores = data._items;
                }
            }, function (error) {
                console.log(error);
            });
            categoryFactory.get().then(function (data) {
                if(data.data) {
                    $scope.categories = data.data._items;
                }
            }, function (error) {
                console.log(error);
            });
            personFactory.getAll($auth.getToken()).then(function (data) {
                if(data.data) {
                    $scope.persons = data.data._items;
                }
            }, function (error) {
                console.log(error);
            });
        } else {
            $state.go("login");
        }

        // check for individual check boxes
        $scope.checkBox = function(selectAll) {
            var count = 0;
            angular.forEach($scope.check.check, function(val, key) {
                if(selectAll) {
                    val = true;
                }
                if (val) {
                    count++;
                }
            });
            $scope.check.all = (count == Object.keys($scope.check.check).length) ? true : false;
            $scope.show = (count == 0) ? false : true;

            $scope.check.count = count;
        };

        // delete selected check boxes
        $scope.deleteSelected = function() {
            var deletedArray = [];
            angular.forEach($scope.check.check, function(val, key) {
                angular.forEach($scope.coupons, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                    }
                });
            });
            var items = [];
            angular.forEach(deletedArray, function (item) {
                items.push(couponFactory.delete(item._id).then(function(data) {
                    console.log(data);
                    toastr.success("Deleted ", 200);
                    angular.forEach($scope.coupons, function (coupon, index) {
                        if(item._id == coupon._id) {
                            $scope.coupons.splice(index, 1);
                            $scope.filterCoupons.splice(index, 1);
                        }
                    });
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data._error.message, error.data._error.code);
                }));
            });
        };
    })
    .filter("typeCouponFilter", function ($filter) {
        return function (items, filter) {
            var list = [];
            if(!Object.keys(filter).length) {
                return items;
            }
            angular.forEach(items, function (item) {
                if(filter['related_stores']) {
                    angular.forEach(item.related_stores, function (sub_item) {
                        if(sub_item._id == filter.related_stores && list.indexOf(item) == -1) {
                            if(filter['related_categories']) {

                            } else {

                            }
                        }
                    });
                }
            });
            return list;
        }
    });