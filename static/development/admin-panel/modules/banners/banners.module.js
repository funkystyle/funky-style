angular.module("bannersModule", ['angular-table', 'constantModule', 'toastr', 'cgBusy', 'satellizer', 'ui.select'])
    .controller("bannersCtrl", function($scope, $filter, toastr, mainURL, URL, $state, $stateParams, $auth, $q, $http) {
        console.log("store controller!");

        $scope.banners = [];
        $scope.filterbanners = [];
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
            $scope.filterbanners = $filter("filter")($scope.banners, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            var embedded = {};
            embedded['last_modified_by'] = 1;

            var rand = new Date().getTime();

            var url = URL.banner+"?embedded="+JSON.stringify(embedded)+"&rand="+JSON.stringify(rand);

            $scope.load = $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.banners = data.data._items;
                    $scope.filterbanners = data.data._items;
                    angular.forEach($scope.banners, function(item) {
                        $scope.check.check[item._id] = false;
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
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
            angular.forEach($scope.check.check, function(val, key) {
                angular.forEach($scope.banners, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(
                            $http({
                                url: URL.banner+'/'+item._id+'?rand_number='+Math.random(),
                                method: "DELETE"
                            }).then(function (data) {
                                console.log(data);
                                return data;
                            }, function (error) {
                                console.log(error);
                                return error;
                            })
                        );
                    }
                });
            });

            // show success message after deleting all the banners
            $q.all(deletedArray).then(function (data) {
                toastr.success("Selected banners Deleted", "Success!");
                $state.reload();
            })

        };
    });