angular.module("storeModule", ['angular-table', 'constantModule', 'toastr', 'personFactoryModule',
    'storeFactoryModule', 'cgBusy', 'satellizer', 'ui.select', 'couponFactoryModule'])
    .controller("storeCtrl", function($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                      personFactory, $auth, storeFactory, $q, $http, couponFactory) {
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
            var embedded = {};
            embedded['related_coupons'] = 1;

            var projections = {
                "related_coupons": {
                    "title": 1
                },
                "name": 1,
                "url": 1,
                "image": 1,
                "top_description": 1,
                "featured_store": 1
            };

            var random_number = new Date().getTime();

            var url = URL.stores+"?embedded="+JSON.stringify(embedded)+"&projection="+
                JSON.stringify(projections)+"&rand_number="+JSON.stringify(random_number);

            $scope.load = storeFactory.get(url).then(function (data) {
                console.log("Stores: ", data._items);
                if(data) {
                    $scope.stores = data._items;
                    $scope.filterStores = data._items;
                    angular.forEach($scope.stores, function(item, index) {
                        // check related coupons null ids
                        $scope.stores[index].related_coupons = clearNullIds(item.related_coupons);

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
                angular.forEach($scope.stores, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(
                            storeFactory.delete(item._id).then(function (storeDelete) {
                                console.log("stores deleted!", storeDelete);
                                return storeDelete;
                            })
                        );
                    }
                });
            });

            // show success message after deleting all the stores
            $q.all(deletedArray).then(function (data) {
                toastr.success("Selected Stores Deleted", "Success!");
                $state.reload();
            })
            
        };
    });