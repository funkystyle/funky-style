angular.module("seoModule", ['angular-table', 'constantModule', 'toastr', 'personFactoryModule', 'cgBusy', 'satellizer', 'ui.select'])
    .controller("seoCtrl", function($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                      personFactory, $auth, $q, $http) {
        console.log("seo Controller!");


        $scope.seos = [];
        $scope.filterSeos = [];
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
            $scope.filterSeos = $filter("filter")($scope.seos, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            var rand = new Date().getTime(),
                embedded = {
                    "last_modified_by": 1
                };
            var url = URL.master_seo+"?embedded="+ JSON.stringify(embedded)+"&r="+JSON.stringify(rand);

            $scope.load = $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                if(data.data._items) {
                    $scope.seos = data.data._items;
                    $scope.filterSeos = data.data._items;
                    angular.forEach($scope.seos, function(item) {
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
                angular.forEach($scope.seos, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(
                            $http({
                                url: URL.master_seo+'/'+item._id+'?rand_number='+Math.random(),
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

            // show success message after deleting all the stores
            $q.all(deletedArray).then(function (data) {
                toastr.success("Deleted Selected Items!", "Success!");
                $state.reload();
            });

        };
    });