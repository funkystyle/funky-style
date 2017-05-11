angular.module("updateCouponModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "constantModule",
    "personFactoryModule", "cgBusy", "couponFactoryModule", "categoryFactoryModule"])
    .controller("updateCouponCtrl", function($scope, $timeout, toastr, storeFactory,
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

        // add coupon
        $scope.updateCoupon = function (coupon) {
            coupon.expire_date = $("#datetimepicker1").find("input").val();
            delete coupon._created;
            delete coupon._updated;
            delete coupon._links;

            console.log(coupon);
            couponFactory.update(coupon, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(coupon.title+" Created", "Success!");
            }, function (error) {
                console.log(error);
                toastr.error(error.data._issues, error.data._error.code);
            });
        };

    });