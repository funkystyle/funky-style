/* store module */
angular.module("dealModule", ['angular-table', 'constantModule', 'toastr', 'cgBusy',
    'satellizer', 'ui.select', 'dealFactoryModule'])
    .controller("dealCtrl", function ($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                                $auth, dealFactory, $q) {
        $scope.deals = [];
        $scope.filterDeals = [];
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
            $scope.filterDeals = $filter("filter")($scope.deals, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            $scope.load = dealFactory.get().then(function (data) {
                console.log(data);
                if(data) {
                    $scope.deals = data.data._items;
                    $scope.filterDeals = data.data._items;
                    angular.forEach($scope.deals, function(item) {
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
                angular.forEach($scope.deals, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                    }
                });
            });
            var items = [];
            angular.forEach(deletedArray, function (item) {
                items.push(dealFactory.delete(item._id).then(function(data) {
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