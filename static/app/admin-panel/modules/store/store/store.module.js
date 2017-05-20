/* store module */
angular.module("storeModule", ['angular-table', 'constantModule', 'toastr', 'personFactoryModule',
    'storeFactoryModule', 'cgBusy', 'satellizer', 'ui.select', 'couponFactoryModule'])
    .controller("storeCtrl", function($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                      personFactory, $auth, storeFactory, $q, $http, couponFactory) {
        console.log("store controller!");

        $scope.stores = [];
        $scope.filterStores = [];
        $scope.search = {
            search: undefined
        };
        $scope.show = false;
        $scope.check = {
            all: false,
            check: {}
        };

        $scope.config = {
            itemsPerPage: 5,
            maxPages: 20,
            fillLastPage: "no"
        };

        $scope.updateFilteredList = function() {
            $scope.filterStores = $filter("filter")($scope.stores, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            personFactory.me().then(function(data) {
                if(data['data']['data']) {
                    var user = data.data.data;
                    $scope.load = storeFactory.get(user.tokens.login).then(function (data) {
                        console.log(data);
                        if(data) {
                            $scope.stores = data._items;
                            $scope.filterStores = data._items;
                            angular.forEach($scope.stores, function(item) {
                                $scope.check.check[item._id] = false;
                            });
                        }
                    }, function (error) {
                        console.log(error);
                        toastr.error(error.data._error.message, "Error!");
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, 'Error!');
                $state.go("login");
            });
        }

        // check for individual check boxes
        $scope.checkBox = function(val) {
            var count = 0;
            angular.forEach($scope.check.check, function(val, key) {
                if (val) {
                    count++
                }
            });
            $scope.check.all = (count == Object.keys($scope.check.check).length) ? true : false;
            $scope.show = (count == 0) ? false : true;
            $scope.check.count = count;
        };

        // delete selected check boxes
        $scope.deleteSelected = function() {
            var deletedArray = [];
            var deleteCoupons = [];
            var deleteStores = [];
            var couponsPromise = [];

            angular.forEach($scope.check.check, function(val, key) {
                angular.forEach($scope.stores, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                        deleteStores.push(item._id);
                        // collect coupons from related_coupons of store
                        angular.forEach(item.related_coupons, function (coupon) {
                            if(deleteCoupons.indexOf(coupon) == -1) {
                                deleteCoupons.push(coupon);
                            }
                        });
                    }
                });
            });
            
            
            angular.forEach(deleteCoupons, function (coupon) {
                couponsPromise.push(
                    couponFactory.delete(coupon).then(function (data) {
                        console.log(data);
                        return data;
                    })
                )
            });

            // delete all stores after success delete of coupons from table
            var storePromise = [];
            $q.all(couponsPromise).then(function(data) {
                angular.forEach(deleteStores, function (id) {
                    storePromise.push(
                        storeFactory.delete(id).then(function (storeDelete) {
                            console.log("stores deleted!", storeDelete);
                            return storeDelete;
                        })
                    )
                });
            });

            // show success message after deleting all the stores
            $q.all(storePromise).then(function (data) {
                toastr.success("Selected Stores Deleted", "Success!");
                $state.reload();
            })
            
        };

        $scope.toggleSidebar = function(id) {
            if ($("#"+id).css("right") == "0px") {
                $("#"+id).animate({ "right": '-1000', 'display': 'none' }, 500);
            } else {
                $("#"+id).animate({ "right": '0', 'display': 'block' }, 500);
            }
        }
    });