/* store module */
angular.module("couponCommentsModule", ['angular-table', 'constantModule', 'toastr', 'personFactoryModule',
    'storeFactoryModule', 'cgBusy', 'satellizer', 'ui.select', 'commentsReportsFactoryModule'])
    .controller("couponCommentsCtrl", function($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                      personFactory, $auth, storeFactory, $q, commentsReportsFactory, $http) {
        console.log("store controller!");

        $scope.comments = [];
        $scope.filterComments = [];
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
            $scope.filterComments = $filter("filter")($scope.comments, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            var embedded = {
                "user": 1,
                "coupon": 1
            };
            var url = URL.coupons_comments+"?embedded="+JSON.stringify(embedded)+"&r="+Math.random();
            $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                $scope.comments = data.data._items;
                $scope.filterComments = data.data._items;
                angular.forEach($scope.comments, function(item) {
                    $scope.check.check[item._id] = false;
                });

                console.log("Comments are: ", $scope.comments)
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

            commentsReportsFactory.update(obj, $auth.getToken(), URL.coupons_comments).then(function (data) {
                console.log("After updating comment status: ", data.data);
                angular.forEach($scope.filterComments, function (json, index) {
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
                angular.forEach($scope.comments, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                    }
                });
            });
            var items = [];
            angular.forEach(deletedArray, function (item) {
                items.push(commentsReportsFactory.delete(item._id, URL.coupons_comments).then(function(data) {
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

        $scope.toggleSidebar = function(id) {
            if ($("#"+id).css("right") == "0px") {
                $("#"+id).animate({ "right": '-1000', 'display': 'none' }, 500);
            } else {
                $("#"+id).animate({ "right": '0', 'display': 'block' }, 500);
            }
        }
    });