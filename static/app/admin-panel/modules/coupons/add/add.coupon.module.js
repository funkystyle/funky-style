angular.module("addCouponModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "storeFactoryModule"])
    .controller("addCouponCtrl", function($scope, $timeout, toastr, storeFactory, $state,
                                          $auth, personFactory, $log, couponFactory, categoryFactory, URL, storeFactory) {
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
            });
        }

        // add coupon
        $scope.addCoupon = function (coupon) {
            coupon.expire_date = new Date(Date.parse($("#datetimepicker1").find("input").val())).toUTCString();
            console.log(coupon.expire_date);
            couponFactory.post(coupon).then(function (data) {
                console.log(data);
                toastr.success(coupon.title+" Created", "Success!");

                // update the coupon count in particular selected store
                angular.forEach($scope.stores, function (item) {
                    if(item._id == coupon.related_stores[0]) {
                        var store = item;
                        store.number_of_coupons = store.number_of_coupons + 1;

                        delete store._created;
                        delete store._updated;
                        delete store._links;
                        console.log(store);
                        storeFactory.update(store, $auth.getToken()).then(function (store_data) {
                            console.log(store_data);
                            if(data.data) {
                                $state.go("header.update-coupon", {couponId: data.data._id});
                            }
                        }, function (error) {
                            console.log(error);
                            toastr.error(error.data._error.message, error.data._error.code);
                        });
                    }
                });
            }, function (error) {
                console.log(error);
                toastr.error(error.data._issues, error.data._error.code);
            });
        };

    });