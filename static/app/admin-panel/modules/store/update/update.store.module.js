angular.module("updateStoreModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "categoryFactoryModule", "naif.base64"])
    .controller("updateStoreCtrl", function ($scope, $timeout, toastr, $state,
                                             storeFactory, $auth, personFactory, $stateParams, categoryFactory) {
        $scope.store = {};
        $scope.persons = [];
        $scope.stores = [];
        $scope.breadcrumbs = [];
        $scope.categories = [];
        $scope.selected_user = {};

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
                            personFactory.getPerson($scope.store.last_modified_by, $auth.getToken()).then(function (data) {
                                $scope.persons.push(data.data);
                                $scope.selected_user.user = $scope.persons[0];
                            });
                            console.log("selected store ------- ", $scope.store);
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
        }

        // update store now
        $scope.updateStore = function (store) {
            if(typeof store.image === 'object') {
                store.image = "data:image/jpeg;base64,"+store.image.base64;
            }
            if(typeof store.top_banner === 'object') {
                store.top_banner = "data:image/jpeg;base64,"+store.top_banner.base64;
            }
            if(typeof store.side_banner === 'object') {
                store.side_banner = "data:image/jpeg;base64,"+store.side_banner.base64;
            }
            if(typeof store.all_tag_image === 'object') {
                store.all_tag_image = "data:image/jpeg;base64,"+store.all_tag_image.base64;
            }

            console.log(store);

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