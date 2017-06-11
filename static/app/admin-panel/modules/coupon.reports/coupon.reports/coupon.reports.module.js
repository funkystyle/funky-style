/* store module */
angular.module("couponReportsModule", ['angular-table', 'constantModule', 'toastr', 'personFactoryModule',
    'storeFactoryModule', 'cgBusy', 'satellizer', 'ui.select', 'commentsReportsFactoryModule'])
    .controller("couponReportsCtrl", function($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                               personFactory, $auth, storeFactory, $q, commentsReportsFactory, $http) {
        console.log("Coupon Reports controller!");

        $scope.reports = [];
        $scope.filterReports = [];
        $scope.search = {
            search: undefined
        };
        $scope.show = false;
        $scope.check = {
            all: false,
            check: {}
        };

        $scope.config = {
            itemsPerPage: 20,
            maxPages: 20,
            fillLastPage: "no"
        };

        $scope.updateFilteredList = function() {
            $scope.filterReports = $filter("filter")($scope.reports, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            var embedded = {
                "user": 1,
                "coupon": 1
            };
            var url = URL.coupons_reports+"?embedded="+JSON.stringify(embedded)+"&r="+Math.random();
            $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                $scope.reports = data.data._items;
                $scope.filterReports = data.data._items;
                angular.forEach($scope.reports, function(item) {
                    $scope.check.check[item._id] = false;
                });

                console.log("Reports are: ", $scope.comments)
            }, function (error) {
                console.log(error);
            });
        }

        // change status to in active
        $scope.changeStatus = function (item) {
            var obj = {
                _id: item._id,
                status: !item.status
            };

            commentsReportsFactory.update(obj, $auth.getToken(), URL.coupons_reports).then(function (data) {
                console.log("After updating Report status: ", data.data);
                angular.forEach($scope.filterReports, function (json, index) {
                    if(json._id == item._id) {
                        json.status = !item.status;
                    }
                });

                toastr.success("Status Updated!");
            }, function (erorr) {
                console.log(erorr);
            });
        };

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
            angular.forEach($scope.check.check, function(val, key) {
                angular.forEach($scope.reports, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                    }
                });
            });
            var items = [];
            angular.forEach(deletedArray, function (item) {
                items.push(commentsReportsFactory.delete(item._id, URL.coupons_reports).then(function(data) {
                    console.log(data);
                    toastr.success("Deleted "+item.name, 200);
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data._error.message, error.data._error.code);
                }));
            });

            $q.all(items).then(function (data) {
                toastr.success("Deleted all selected records!", "SUCCESS!");
            }, function (error) {
                console.log(error);
            });
        };
    });