angular.module("couponModule", ['constantModule', 'toastr', 'cgBusy', 'satellizer', 'ui.select', 'couponFactoryModule',
    'storeFactoryModule', 'categoryFactoryModule', 'personFactoryModule', 'ui.grid', 'ui.grid.pagination'])
    .controller("couponCtrl", function($scope, $filter, toastr, $http, $q,
                                       mainURL, URL, $state, $stateParams, $auth, couponFactory,
                                       storeFactory, categoryFactory, personFactory) {
        $scope.coupons = [];
        $scope.gridOptions = {
            data: [],
            enablePaginationControls: true,
            paginationPageSize: 25,
            columnDefs: [
                {
                    field: 'title', displayName: "Title", width: "25%",
                    cellTemplate: '<div class="coupon-name">' +
                    '<p>{{ row.entity.title }}</p>' +
                    '<p class="coupon-options">' +
                    '<span><a href="/store/{{ row.entity.related_stores[0].url }}" target="_blank">View</a></span> &nbsp;&nbsp;' +
                    '<span><a ui-sref="header.update-coupon({couponId: row.entity._id})">Edit</a></span></p>' +
                    '</div>'
                },
                {
                    field: "last_modified_by", displayName: "Submitted By",
                    cellTemplate: '<p style="text-transform: capitalize;">{{ row.entity.last_modified_by.first_name }} {{ row.entity.last_modified_by.last_name }}</p>'
                },
                { field: 'related_stores[0].name', displayName: "Store", enableFiltering: false },
                {
                    field: 'related_categories', displayName: "Category", enableFiltering: false,
                    cellTemplate: '<p style="text-transform: capitalize;">' +
                    '<span ng-repeat="i in row.entity.related_categories">' +
                    '<a ui-sref="header.update-category({categoryId: i._id})"> {{ i.name }}</a> ' +
                    '{{$last ? "" : ($index == row.entity.related_categories.length-2) ? " and " : ", "}}</span>' +
                    '</p>'
                },
                { field: 'coupon_type', displayName: "Coupon Type", enableFiltering: false },
                { field: 'coupon_code', displayName: "Coupon Code"
                },
                {
                    field: '_created', displayName: "Created Date", type: 'date', cellFilter: 'date', width: '15%', enableFiltering: false,
                    cellTemplate: "<p>{{ row.entity._created | date: 'dd MMM yyyy hh:mm a' }}</p>"
                },
                {
                    field: 'expire_date', displayName: "Expiry Date", type: 'date', cellFilter: 'date', width: '15%', enableFiltering: false,
                    cellTemplate: "<p>{{ row.entity.expire_date | date: 'dd MMM yyyy hh:mm a' }}</p>", sort: { direction: 'desc', priority: 0 }
                },
                {
                    field: 'number_of_clicks', displayName: "Clicks"
                }
            ]
        };






        $scope.stores = [];
        $scope.categories = [];
        $scope.persons = [];
        $scope.filterCoupons = [];
        $scope.search = {
            search: undefined
        };
        $scope.coupon_type = ["coupon", "offer"];
        $scope.show = false;
        $scope.check = {
            all: false,
            check: {}
        };
        $scope.filter = {};
        $scope.statusOptions = {};

        $scope.config = {
            itemsPerPage: 10,
            maxPages: 20,
            fillLastPage: "no"
        };
        $scope.filterByStatus = function (array) {
            $scope.filterCoupons = array;
        };
        $scope.clearAll = function () {
            $scope.filterCoupons = [];
            angular.forEach($scope.coupons, function (item) {
                $scope.filterCoupons.push(item);
            });

            $scope.filter = {};
        };

        // apply type filter for filtering the coupons from table
        $scope.applyTypeFilter = function () {
            console.log($scope.coupons, $scope.filter);
            $scope.filterCoupons = $filter('typeCouponFilter')($scope.coupons, $scope.filter);
        };
        $scope.updateFilteredList = function() {
            $scope.filterCoupons = $filter("filter")($scope.coupons, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {

            var embedded = {
                "recommended_stores":1,
                "related_categories":1,
                "related_stores":1,
                "last_modified_by": 1
            };

            $scope.load = $http({
                url: '/api/1.0/coupons?embedded='+JSON.stringify(embedded)+'&rand_number=' + new Date().getTime(),
                method: "GET"
            }).then(function (data) {
                // console.log(data);
                if(data['data']) {
                    $scope.coupons = data.data._items;
                    $scope.filterCoupons = data.data._items;
                    console.log($scope.gridOptions.data);
                    var destArray = _.groupBy(data.data._items, 'status');
                    destArray['All'] = $scope.coupons;
                    destArray['Expired Coupons'] = [];
                    angular.forEach($scope.coupons, function(item) {
                        if(new Date(item.expire_date) < new Date()) {
                            destArray['Expired Coupons'].push(item);
                        }
                        // get the related stores
                        angular.forEach(item.related_stores, function (store) {
                            if(store) {
                                $scope.stores.push(store);
                            }
                        });
                        // get the related categories
                        angular.forEach(item.related_categories, function (cat) {
                            if(cat) {
                                $scope.categories.push(cat);
                            }
                        });

                        if(item.last_modified_by) {
                            $scope.persons.push(item.last_modified_by);
                        }
                        $scope.check.check[item._id] = false;
                        item._created = new Date(item._created);
                        item._expire_date = new Date(item.expire_date);
                        $scope.gridOptions.data.push(item);
                    });
                    // Sort by keys
                    var keys = Object.keys( destArray );
                    keys = keys.sort( function ( a, b ) { return a > b; } );
                    for ( var i = 0; i < keys.length; i++ ) {
                        $scope.statusOptions[keys[i]] = destArray[keys[i]];
                    }
                    $scope.persons = _.uniq($scope.persons, function(x){
                        return x['_id'];
                    });
                    $scope.stores = _.uniq($scope.stores, function(x){
                        return x['_id'];
                    });
                    $scope.categories = _.uniq($scope.categories, function(x){
                        return x['_id'];
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        } else {
            $state.go("login");
        }

        // check for individual check boxes
        $scope.checkBox = function(selectAll) {
            var count = 0;
            angular.forEach($scope.check.check, function(val, key) {
                if(selectAll) {
                    val = true;
                }
                if (val) {
                    count++;
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
                angular.forEach($scope.coupons, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                    }
                });
            });

            var items = [];
            angular.forEach(deletedArray, function (item) {
                items.push(couponFactory.delete(item._id).then(function(data) {
                    console.log(data);
                    return data;
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data._error.message, error.data._error.code);
                }));

                console.log(item);
            });
            $q.all(items).then(function (finalData) {
                toastr.success("Deleted selected items", 200);
                $state.reload();
            });
        };
    })
    .filter("typeCouponFilter", function ($filter) {
        return function (items, filter) {
            console.log(items, filter);
            var list = [];
            if(!Object.keys(filter).length) {
                return items;
            }
            angular.forEach(filter, function (val, key) {
                if(key == 'related_categories' || key == 'related_stores') {
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
                } else if (key == 'coupon_type') {
                    angular.forEach(items, function (item) {
                        if(item.coupon_type == val) {
                            list.push(item);
                        }
                    });
                }
            });

            var uniqueList = _.uniq(list, function(item, key, a) {
                return item._id;
            });
            return uniqueList;
        }
    });