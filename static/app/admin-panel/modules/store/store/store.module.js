/* store module */
angular.module("storeModule", ['angular-table', 'constantModule', 'toastr', 'personFactoryModule',
    'storeFactoryModule', 'cgBusy', 'satellizer', 'ui.select'])
    .controller("storeCtrl", function($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                      personFactory, $auth, storeFactory, $q) {
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
                    console.log(user, user.tokens.login);
                    $scope.load = storeFactory.get(user.tokens.login).then(function (data) {
                        console.log(data);
                        if(data) {
                            $scope.stores = data._items;
                            $scope.filterStores = data._items;
                            angular.forEach($scope.stores, function(item) {
                                console.log(item)
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
            angular.forEach($scope.check.check, function(val, key) {
                angular.forEach($scope.stores, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                    }
                });
            });
            var items = [];
            angular.forEach(deletedArray, function (item) {
                items.push(storeFactory.delete(item._id).then(function(data) {
                    console.log(data, item._id);
                    toastr.success("Deleted "+item.name, 200);
                    angular.forEach($scope.stores, function (store, index) {
                        if(item._id == store._id) {
                            $scope.stores.splice(index, 1);
                            $scope.filterStores.splice(index, 1);
                        }
                    });
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