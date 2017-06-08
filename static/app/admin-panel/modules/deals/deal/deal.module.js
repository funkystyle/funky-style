/* store module */
angular.module("dealModule", ['angular-table', 'constantModule', 'toastr', 'cgBusy',
    'satellizer', 'ui.select', 'dealFactoryModule'])
    .controller("dealCtrl", function ($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                                $auth, dealFactory, $q, $http) {
        $scope.deals = [];
        $scope.filterDeals = [];
        $scope.persons = [];
        $scope.stores = [];
        $scope.categories = [];
        $scope.deal_types = [];

        $scope.search = {
            search: undefined
        };
        $scope.show = false;
        $scope.check = {
            all: false,
            check: {}
        };
        $scope.filter = {};
        $scope.config = {
            itemsPerPage: 20,
            maxPages: 20,
            fillLastPage: "no"
        };

        // apply type filter for filtering the coupons from table
        $scope.applyTypeFilter = function () {
            console.log($scope.coupons, $scope.filter);
            $scope.filterDeals = $filter('typeDealFilter')($scope.deals, $scope.filter);
        };

        $scope.clearAll = function () {
            $scope.filterDeals = [];
            angular.forEach($scope.deals, function (item) {
                $scope.filterDeals.push(item);
            });

            $scope.filter = {};
        };

        $scope.updateFilteredList = function() {
            $scope.filterDeals = $filter("filter")($scope.deals, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            var embedded = {
                "deal_brands": 1,
                "store": 1,
                "related_deals": 1,
                "deal_category": 1,
                "last_modified_by": 1
            };

            var r = Math.random();

            var url = URL.deals+"?embedded="+JSON.stringify(embedded)+"&r="+JSON.stringify(r);

            $scope.load = $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                $scope.deals = data.data._items;
                $scope.filterDeals = data.data._items;
                angular.forEach($scope.deals, function(item) {
                    // push deal types
                    if($scope.deal_types.indexOf(item.deal_type) == -1) {
                        $scope.deal_types.push(item.deal_type);
                    }
                    // by store
                    if(item['store']) {
                        $scope.stores.push(item.store);
                    }

                    // by deal category
                    if(item['deal_category']) {
                        angular.forEach(item.deal_category, function (deal_item) {
                            $scope.categories.push(deal_item);
                        });
                    }

                    $scope.persons.push(item.last_modified_by);
                    $scope.check.check[item._id] = false;
                });
                // get unique stores
                $scope.stores = _.uniq($scope.stores, function(x){
                    return x['_id'];
                });

                // get unique persons
                $scope.persons = _.uniq($scope.persons, function(x){
                    return x['_id'];
                });

                // get unique persons
                $scope.categories = _.uniq($scope.categories, function(x){
                    return x['_id'];
                });

                console.log("Final persons: ", $scope.persons, "Deal Types: ", $scope.deal_types, "Stores: ", $scope.stores);
                console.log("Categories: ", $scope.categories)
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
    })
    .filter("typeDealFilter", function ($filter) {
        return function (items, filter) {
            console.log(items, filter);
            var list = [];
            if(!Object.keys(filter).length) {
                return items;
            }
            angular.forEach(filter, function (val, key) {
                if(key == 'store') {
                    angular.forEach(items, function (item) {
                        if(item['store']) {
                            if(item.store._id == val) {
                                list.push(item)
                            }
                        }
                    });
                } else if(key == 'deal_category') {
                    angular.forEach(items, function (item) {
                        if(Array.isArray(item[key])) {
                            angular.forEach(item[key], function (type) {
                                if(type._id == val) {
                                    list.push(item);
                                }

                            });
                        }
                    });
                } else if (key == 'last_modified_by') {
                    angular.forEach(items, function (item) {
                        if(item.last_modified_by['_id'] == val) {
                            list.push(item);
                        }
                    });
                } else if (key == 'deal_type') {
                    angular.forEach(items, function (item) {
                        if(item.deal_type == val) {
                            list.push(item);
                        }
                    });
                }
            });

            var uniqueList = _.uniq(list, function(item, key, a) {
                return item._id;
            });

            console.log("Final unique Items: ", uniqueList)
            return uniqueList;
        }
    });