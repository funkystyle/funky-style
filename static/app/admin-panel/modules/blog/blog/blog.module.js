/* store module */
angular.module("blogModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "blogFactoryModule", "angular-table"])
    .controller("blogCtrl", function($scope, $q, $timeout, toastr, storeFactory,
                                        $auth, personFactory, $log, couponFactory, categoryFactory, URL, blogFactory) {
        $scope.blogs = [];
        $scope.filterBlogs = [];
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
            $scope.filterBlogs = $filter("filter")($scope.blogs, $scope.search.search);
        };

        if ($auth.isAuthenticated()) {
            // get all Blogs
            blogFactory.get().then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.blogs = data.data._items;
                    $scope.filterBlogs = data.data._items;
                    angular.forEach($scope.blogs, function(item) {
                        $scope.check.check[item._id] = false;
                    })
                }
            }, function (error) {
                console.log(error);
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

        /// delete selected check boxes
        $scope.deleteSelected = function() {
            var deletedArray = [];
            angular.forEach($scope.check.check, function(val, key) {
                angular.forEach($scope.blogs, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(item);
                    }
                });
            });

            var items = [];
            angular.forEach(deletedArray, function (item) {
                items.push(blogFactory.delete(item._id).then(function(data) {
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

        $scope.toggleSidebar = function(id) {
            if ($("#"+id).css("right") == "0px") {
                $("#"+id).animate({ "right": '-1000', 'display': 'none' }, 500);
            } else {
                $("#"+id).animate({ "right": '0', 'display': 'block' }, 500);
            }
        }
    });