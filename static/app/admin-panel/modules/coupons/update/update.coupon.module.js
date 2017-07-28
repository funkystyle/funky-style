angular.module("updateCouponModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "constantModule",
    "personFactoryModule", "cgBusy", "couponFactoryModule", "categoryFactoryModule"])
    .controller("updateCouponCtrl", function($scope, $timeout, toastr, storeFactory, $q,
                                             $auth, personFactory, $log, couponFactory,
                                             $state, $stateParams, categoryFactory, URL, $http) {
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
            expire_date: new Date(),
            coupon_sorting: 0
        };
        $scope.mytime = new Date();

        // get all stores into the array
        if($auth.isAuthenticated()) {
            $('#datetimepicker1').datetimepicker({
                defaultDate: new Date()
            });
            var embedded = {};
            embedded['related_stores'] = 1;
            embedded['top_stores'] = 1;
            embedded['top_catagory_store'] = 1;
            embedded['related_coupons'] = 1;
            embedded['related_deals'] = 1;

            var random_number = new Date().getTime();

            var url = URL.stores+"?embedded="+JSON.stringify(embedded)+"&rand_number="+JSON.stringify(random_number);

            $scope.load = storeFactory.get(url).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.stores = data._items;
                    angular.forEach($scope.stores, function (item) {
                        item.related_stores = clearNullIds(item.related_stores);
                        item.top_stores = clearNullIds(item.top_stores);
                        item.top_catagory_store = clearNullIds(item.top_catagory_store);
                        item.related_coupons = clearNullIds(item.related_coupons);
                        item.related_deals = clearNullIds(item.related_deals);
                    });
                }
            }, function (error) {
                console.log(error);
            });

            personFactory.me().then(function (data) {
                $scope.persons.push(data.data.data);
                $scope.selected_user.user = $scope.persons[0];
                $scope.coupon.last_modified_by = $scope.persons[0]._id;
            }, function (error) {
                console.log(error);
            });
            // get all categories
            var embedded = {};
            embedded['related_categories'] = 1;
            embedded['top_stores'] = 1;
            embedded['top_categories'] = 1;
            embedded['related_coupons'] = 1;
            embedded['related_deals'] = 1;
            $http({
                url: URL.categories+"?embedded="+JSON.stringify(embedded)+"&rand_number="+Math.random(),
                method: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.categories = data.data._items;
                    angular.forEach($scope.categories, function (item) {
                        // remove null ids from selected arrays
                        item.related_categories = (item.related_categories) ? clearNullIds(item.related_categories): item.related_categories;
                        item.top_stores = (item.top_stores) ? clearNullIds(item.top_stores): item.top_stores;
                        item.top_categories = (item.top_categories) ? clearNullIds(item.top_categories): item.top_categories;
                        item.related_coupons = clearNullIds(item.related_coupons);
                        item.related_deals = clearNullIds(item.related_deals);
                    });
                }
            }, function (error) {
                console.log(error);
            }).then(function () {
                var embedded = {};
                embedded['related_categories'] = 1;
                embedded['related_stores'] = 1;
                embedded['recommended_stores'] = 1;
                $http({
                    url: URL.coupons+"?embedded="+JSON.stringify(embedded)+"&rand_number="+Math.random(),
                    method: "GET"
                }).then(function (data) {
                    if(data['data']) {
                        angular.forEach(data.data._items, function (item) {
                            if(item._id == $stateParams.couponId) {
                                item.related_stores = clearNullIds(item.related_stores);
                                item.related_categories = clearNullIds(item.related_categories);
                                item.recommended_stores = clearNullIds(item.recommended_stores);

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
            coupon.expire_date = new Date(Date.parse($("#datetimepicker1").find("input").val())).toUTCString();
            delete coupon._created;
            delete coupon._updated;
            delete coupon._links;

            console.log(coupon);
            couponFactory.update(coupon, $auth.getToken()).then(function (data) {
                console.log(data);

                function storeService(store, token) {
                    finalItems.push(storeFactory.update(store, token).then(function (store_data) {
                        console.log(store_data);
                        return store_data;
                    }, function (error) {
                        console.log(error);
                        toastr.error(error.data._error.message, error.data._error.code);
                    }));
                }

                function updateStore (store, fromRemove) {
                    if(!fromRemove) {
                        store.related_coupons.push(coupon._id);
                    } else if (fromRemove) {
                        store.related_coupons.splice(store.related_coupons.indexOf(coupon._id), 1);
                    }

                    delete store._created;
                    delete store._updated;
                    delete store._links;
                    console.log(store);
                    storeService(store, $auth.getToken());
                }

                function categoryService(category, token) {
                    finalItems.push(categoryFactory.update(category, token).then(function (category_data) {
                        console.log(category_data);
                        return category_data;
                    }, function (error) {
                        console.log(error);
                        toastr.error(error.data._error.message, error.data._error.code);
                    }));
                }
                function updateCategory (category, fromRemove) {
                    if(!fromRemove) {
                        category.related_coupons.push(coupon._id);
                    } else if (fromRemove) {
                        category.related_coupons.splice(category.related_coupons.indexOf(coupon._id), 1);
                    }
                    delete category._created;
                    delete category._updated;
                    delete category._links;
                    console.log(category);
                    categoryService(category, $auth.getToken());
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

                if($scope.addedStores.length == 0 && $scope.removedStores.length == 0) {
                    console.log("-----", $scope.coupon.related_stores);
                    angular.forEach($scope.coupon.related_stores, function (storeItem) {
                        storeService({_id: storeItem}, $auth.getToken());
                    });
                }

                if($scope.addedCategories.length == 0 && $scope.removedCategories.length == 0) {
                    console.log("-----", $scope.coupon.related_categories);
                    angular.forEach($scope.coupon.related_categories, function (categoryItem) {
                        categoryService({_id: categoryItem}, $auth.getToken());
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