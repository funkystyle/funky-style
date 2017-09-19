angular.module("addCouponModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "storeFactoryModule"])
    .controller("addCouponCtrl", function($scope, $timeout, toastr, storeFactory, $state, $q,
                                          $auth, personFactory, $log, couponFactory, categoryFactory, URL, $http) {
        $scope.persons = [];
        $scope.categories = [];
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
            status: $scope.checkRole() ? $scope.status[4] : $scope.status[0],
            expire_date: new Date(),
            related_categories: [],
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
            });
        }

        // add coupon
        $scope.addCoupon = function (coupon) {
            var finalItems = [];
            coupon.expire_date = new Date(Date.parse($("#datetimepicker1").find("input").val())).toUTCString();
            console.log(coupon.expire_date);
            couponFactory.post(coupon).then(function (data) {
                console.log("Added coupon response data ---- ", data);
                var responseCouponId = data.data._id;
                function updateStore (store) {
                    store.related_coupons.push(responseCouponId);
                    delete store._created;
                    delete store._updated;
                    delete store._links;
                    delete store.last_modified_by;
                    console.log(store);
                    finalItems.push(storeFactory.update(store, $auth.getToken()).then(function (store_data) {
                        console.log(store_data);
                        return store_data;
                    }, function (error) {
                        console.log(error);
                        toastr.error(error.data._error.message, error.data._error.code);
                    }));
                }

                function updateCategory (category) {
                    category.related_coupons.push(responseCouponId);
                    delete category._created;
                    delete category._updated;
                    delete category.last_modified_by;
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
                if(coupon.related_stores.length) {
                    angular.forEach($scope.stores, function (item) {
                        if(coupon.related_stores.indexOf(item._id) > -1) {
                            updateStore(item);
                        }
                    });
                }

                // update the coupon count if we have any related categories to this one
                if(coupon.related_categories.length) {
                    angular.forEach($scope.categories, function (item) {
                        if(coupon.related_categories.indexOf(item._id) > -1) {
                            updateCategory(item);
                        }
                    });
                }


                $q.all(finalItems).then(function (finalExecute) {
                    toastr.success(coupon.title+" Created", "Success!");
                    $state.go("header.update-coupon", {couponId: data.data._id});
                });
            }, function (error) {
                console.log(error);
                toastr.error(error.data._issues, error.data._error.code);
            });
        };

    });