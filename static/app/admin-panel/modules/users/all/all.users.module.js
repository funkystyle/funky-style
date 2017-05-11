angular.module("allUsersModule", ['constantModule', 'toastr', 'personFactoryModule', 'cgBusy',
    'satellizer', 'ui.select', 'angular-table'])
.controller("allUsersCtrl", function ($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
    personFactory, $auth) {
    $scope.search = {
        search: undefined
    };
    $scope.show = false;
    $scope.check = {
        all: false,
        check: {}
    };
    $scope.pageSize = 10;
    $scope.persons = [];
    $scope.filterPersons = [];
    $scope.config = {
        itemsPerPage: 5,
        maxPages: 20,
        fillLastPage: "no"
    };
    $scope.userLevels = [
        {
            level: "submitter",
            text: "Submitter"
        },
        {
            level: "editor",
            text: "Editor"
        },
        {
            level: "admin",
            text: "Admin"
        }
    ];

    $scope.updateFilteredList = function() {
        $scope.filterPersons = $filter("filter")($scope.persons, $scope.search.search);
    };

    if ($auth.isAuthenticated()) {
        personFactory.me().then(function(data) {
            if(data['data']['data']) {
                var user = data.data.data;
                console.log(user, user.tokens.login);
                $scope.load = personFactory.getAll(user.tokens.login).then(function (data) {
                    $scope.persons = data.data._items;
                    $scope.filterPersons = data.data._items;
                    console.log($scope.persons);

                    angular.forEach($scope.persons, function(item) {
                        $scope.check.check[item._id] = false;
                    })
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data._error.message, "Error!");
                });
            }
        }, function (error) {
            console.log(error);
            toastr.error(error.data._error.message, 'Error!')
        });
    }

    // selectAll function
    $scope.selectAll = function() {
        angular.forEach($scope.check.check, function(val, key) {
            $scope.check.check[key] = $scope.check.all;
        });
        $scope.show = $scope.check.all;
    };

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
    };

    // update user
    $scope.viewUser = function (obj) {
        console.log(obj);
        $scope.u_user = obj;
        var f = $filter('filter')($scope.userLevels, {level: obj.user_level[0]});
        $scope.u_user.level = (f.length) ? f[0]: $scope.userLevels[0];
    };

    $scope.change_user_level = function () {
        angular.forEach($scope.userLevels, function (item, index) {
            if(item.level = $scope.u_user.level.level) {
                $scope.u_user.user_level = [item.level];
            }
        });
    };

    // updateUser
    $scope.updateUser = function () {
        console.log($scope.u_user);
        delete $scope.u_user._created;
        delete $scope.u_user._links;
        delete $scope.u_user._updated;
        delete $scope.u_user.level;
        personFactory.update($scope.u_user, $scope.u_user.tokens.token).then(function (data) {
            console.log(data);
            toastr.success("Updated!", "Success!");
            $scope.toggleSidebar('sidebar-affix');
        }, function (error) {
            console.log(error);
            toastr.error(error.data._error.message, "Error!");
        });
    };

    // delete selected check boxes
    $scope.deleteSelected = function() {
        var deletedArray = [];
        angular.forEach($scope.check.check, function(val, key) {
            angular.forEach($scope.persons, function(item, i) {
                if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                    deletedArray.push(item._id);
                    $scope.persons.splice(i, 1);
                }
            });
        });

        $scope.show = false;

        $scope.load = personFactory.delete('persons', deletedArray).then(function (data) {
            console.log(data);
        }, function (error) {
            console.log(error);

            toastr.error(error.data._error.message, 'Error!');
        });
    };

    $scope.pageChangeHandler = function(num) {
        console.log('drinks page changed to ' + num);
    };

    $scope.toggleSidebar = function(id) {
        if ($("#"+id).css("right") == "0px") {
            $("#"+id).animate({ "right": '-1000', 'display': 'none' }, 500);
        } else {
            $("#"+id).animate({ "right": '0', 'display': 'block' }, 500);
        }
    }
});