angular.module("updateStoreModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "categoryFactoryModule", "naif.base64"])
    .controller("updateStoreCtrl", function ($scope, $timeout, toastr, $state,
                                             storeFactory, $auth, personFactory, $stateParams, categoryFactory) {
        $scope.store = {};
        $scope.persons = [];
        $scope.stores = [];
        $scope.breadcrumbs = [];
        $scope.categories = [];

        $scope.$watch('store.name', function(newVal, oldVal) {
            $scope.store.url = (newVal) ? newVal+"-coupons" : undefined;
        }, true);

        // get all stores into the array
        if($auth.isAuthenticated() && $stateParams['storeId']) {
            $scope.load = storeFactory.get().then(function (data) {
                console.log(data);
                if(data) {
                    $scope.stores = data._items;
                    angular.forEach($scope.stores, function (item) {
                        if(item._id == $stateParams.storeId) {
                            $scope.store = item;
                        }
                    });
                }
            }, function (error) {
                console.log(error);
            });

            categoryFactory.get().then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.categories = data.data._items;

                    angular.forEach($scope.categories, function (item) {
                        $scope.breadcrumbs.push({
                            name: item.name,
                            url: item.url,
                            _id: item._id
                        });
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });

            // get all persons from collection
            personFactory.getAll($auth.getToken()).then(function (data) {
                $scope.persons = data.data._items;
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, "Error!");
            })
        }

        // update store now
        $scope.updateStore = function (store) {
            delete $scope.store._created;
            delete $scope.store._updated;
            delete $scope.store._links;


            console.log(store);
            storeFactory.update(store, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(store.name+" Updated!", "Success");
                $state.go("header.stores");
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    })
    .filter('propsFilter', function() {
        return function(items, props) {
            var out = [];
            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }
            return out;
        };
    });