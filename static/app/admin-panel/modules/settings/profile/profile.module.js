// angular module for settings/profile
angular.module("profileModule", ["constantModule", "ui.select", "personFactoryModule", "satellizer", "toastr"])
    .controller("profileCtrl", function($scope, $state, URL, personFactory, $filter, $auth, toastr) {

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
        $scope.u_user = {};

        if ($auth.isAuthenticated()) {
            personFactory.me().then(function(data) {
                if(data['data']['data']) {
                    $scope.u_user = data.data.data;
                    console.log($scope.u_user, $scope.u_user.tokens.login);
                    var f = $filter('filter')($scope.userLevels, {level: $scope.u_user.user_level[0]});
                    $scope.u_user.level = (f.length) ? f[0]: $scope.userLevels[0];
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, 'Error!')
            });
        }

        // updateUser
        $scope.updateUser = function () {
            console.log($scope.u_user);
            delete $scope.u_user._created;
            delete $scope.u_user._links;
            delete $scope.u_user._updated;
            delete $scope.u_user.level;
            delete $scope.u_user.created_date;
            delete $scope.u_user.modified_date;

            personFactory.update($scope.u_user, $scope.u_user.tokens.token).then(function (data) {
                console.log(data);
                toastr.success("Updated!", "Success!");
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        };

    });