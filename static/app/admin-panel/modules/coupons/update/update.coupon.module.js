angular.module("updateCouponModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "constantModule",
    "personFactoryModule", "cgBusy", "couponFactoryModule", "categoryFactoryModule"])
    .controller("updateCouponCtrl", function($scope, $timeout, toastr, storeFactory, $q,
                                             $auth, personFactory, $log, couponFactory,
                                             $state, $stateParams, categoryFactory, URL) {
        $scope.persons = [];
        $scope.categories = [];
        $scope.stores = [];
        $scope.selected_user = {
            user: undefined
        };
        $scope.hstep = 1;
        $scope.mstep = 15;
        var hstep = [];
        for(var i = 1; i <= 23; i ++) {
            hstep.push(i);
        }
        $scope.options = {
            hstep: hstep,
            mstep: [1, 5, 10, 15, 25, 30, 45, 55]
        };
        $scope.ismeridian = true;
        $scope.toggleMode = function() {
            $scope.ismeridian = ! $scope.ismeridian;
        };
        $scope.changed = function () {
            $log.log('Time changed to: ' + $scope.mytime);
        };

        $scope.status = ["Pending", "Draft", "Trash", "Verified", "Publish"];
        $scope.coupon = {
            status: $scope.status[0].type,
            expire_date: new Date()
        };
        $scope.mytime = new Date();

        // get all stores into the array
        if($auth.isAuthenticated()) {
            $('#datetimepicker1').datetimepicker({
                defaultDate: new Date()
            });
            $scope.load = storeFactory.get($auth.getToken()).then(function (data) {
                console.log(data);
                if(data['_items']) {
                    $scope.stores = data._items;
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
            personFactory.me().then(function (data) {
                $scope.persons.push(data.data.data);
                $scope.selected_user.user = $scope.persons[0];
                $scope.coupon.last_modified_by = $scope.persons[0]._id;
            }, function (error) {
                console.log(error);
            });
            // get all categories
            categoryFactory.get().then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.categories = data.data._items;
                }
            }, function (error) {
                console.log(error);
            }).then(function () {
                couponFactory.get().then(function (data) {
                    if(data['data']) {
                        angular.forEach(data.data._items, function (item) {
                            if(item._id == $stateParams.couponId) {
                                $scope.coupon = item;
                                console.log(item);
                                $("#datetimepicker1").find("input").val(item.expire_date);
                            }
                        });
                    }
                }, function (error) {
                    console.log(error);
                });
            })
        }
        $scope.removedCategories = [];
        $scope.removedStores = [];
        $scope.addedStores = [];
        $scope.addedCategories = [];
        $scope.removeCategory = function (item, model) {
            console.log(item, model);
            if($scope.removedCategories.indexOf(item) == -1) {
                $scope.removedCategories.push(item);
            }
        };

        $scope.removeStore = function (item, model) {
            console.log(item, model);
            if($scope.removedStores.indexOf(item) == -1) {
                $scope.removedStores.push(item);
            }
        };
        $scope.addCategory = function (item, model) {
            console.log(item, model);
            if($scope.addedCategories.indexOf(item) == -1) {
                $scope.addedCategories.push(item);
            }
        };

        $scope.addStore = function (item, model) {
            console.log(item, model);
            if($scope.addedStores.indexOf(item) == -1) {
                $scope.addedStores.push(item);
            }
        };

        // add coupon
        $scope.updateCoupon = function (coupon) {
            var finalItems = [];

            // coupon.expire_date = new Date($("#datetimepicker1").find("input").val());
            coupon.expire_date = "Tue, 02 Apr 2013 10:29:13 GMT";
            delete coupon._created;
            delete coupon._updated;
            delete coupon._links;

            console.log(coupon);
            couponFactory.update(coupon, $auth.getToken()).then(function (data) {
                console.log(data);
                function updateStore (item, fromRemove) {
                    var store = item;

                    if(!fromRemove) {
                        store.number_of_coupons = (store.number_of_coupons)?store.number_of_coupons + 1: 1;
                    } else if (fromRemove) {
                        store.number_of_coupons = (store.number_of_coupons > 0)?store.number_of_coupons - 1: 0;
                    }

                    delete store._created;
                    delete store._updated;
                    delete store._links;
                    console.log(store);
                    finalItems.push(storeFactory.update(store, $auth.getToken()).then(function (store_data) {
                        console.log(store_data);
                        return store_data;
                    }, function (error) {
                        console.log(error);
                        toastr.error(error.data._error.message, error.data._error.code);
                    }));
                }

                function updateCategory (item, fromRemove) {
                    var category = item;
                    if(!fromRemove) {
                        category.number_of_coupons = (category.number_of_coupons) ? category.number_of_coupons + 1 : 1;
                    } else if (fromRemove) {
                        category.number_of_coupons = (category.number_of_coupons > 0)?category.number_of_coupons - 1: 0;
                    }
                    delete category._created;
                    delete category._updated;
                    delete category._links;
                    console.log(category);
                    finalItems.push(categoryFactory.update(category, $auth.getToken()).then(function (category_data) {
                        console.log(category_data);
                        return category_data;
                    }, function (error) {
                        console.log(error);
                        toastr.error(error.data._error.message, error.data._error.code);
                    }));
                }

                // update the coupon count in particular selected store
                if($scope.addedStores.length) {
                    angular.forEach($scope.addedStores, function (item) {
                        updateStore(item);
                    });
                }

                if($scope.removedStores.length) {
                    angular.forEach($scope.removedStores, function (item) {
                        updateStore(item, true);
                    });
                }

                // update the coupon count if we have any related categories to this one
                if($scope.addedCategories.length) {
                    angular.forEach($scope.addedCategories, function (item) {
                        updateCategory(item);
                    })
                }
                // if any item removed from the related categories
                console.log($scope.removedCategories);
                if($scope.removedCategories.length) {
                    angular.forEach($scope.removedCategories, function (item) {
                        updateCategory(item, true);
                    })
                }


                $q.all(finalItems).then(function (finalExecute) {
                    $scope.removedCategories = [];
                    $scope.removedStores = [];
                    $scope.addedStores = [];
                    $scope.addedCategories = [];
                    toastr.success(coupon.title+" Updated", "Success!");
                });
            }, function (error) {
                console.log(error);
                toastr.error(error.data._issues, error.data._error.code);
            });
        };

    });