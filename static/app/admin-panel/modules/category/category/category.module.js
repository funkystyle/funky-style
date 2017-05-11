/* store module */
angular.module("categoryModule", ['angular-table', 'constantModule', 'toastr', 'personFactoryModule',
    'storeFactoryModule', 'cgBusy', 'satellizer', 'ui.select', 'categoryFactoryModule'])
    .controller("categoryCtrl", function($scope, $filter, toastr,
                                         mainURL, URL, $state, $stateParams, personFactory, $auth,
                                         storeFactory, categoryFactory, $q) {
        console.log("category controller!");

        $scope.categories = [];
        $scope.filterCategories = [];
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
            $scope.filterCategories = $filter("filter")($scope.categories, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            // get all categories
            categoryFactory.get().then(function (data) {
                console.log(data);
                if(data) {
                    $scope.categories = data.data._items;
                    $scope.filterCategories = data.data._items;
                    angular.forEach($scope.categories, function(item) {
                        $scope.check.check[item._id] = false;
                    });
                }
            }, function (error) {
                console.log(error);
            });
        } else {
            $state.go('login');
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
                angular.forEach($scope.categories, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                    }
                });
            });

            var items = [];
            angular.forEach(deletedArray, function (item) {
                items.push(categoryFactory.delete(item._id).then(function(data) {
                    console.log(data);
                    toastr.success("Deleted "+item.name, 200);
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data._error.message, error.data._error.code);
                }));
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