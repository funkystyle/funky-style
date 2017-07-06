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
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, 'Error!')
            });
        }

        // updateUser
        $scope.updateUser = function (user) {
            delete user.created_date;
            delete user.modified_date;
            delete user._updated;

            console.log(user);
            personFactory.update(user, user.tokens.token).then(function (data) {
                console.log(data);
                toastr.success("Please login Again!", "Need login!");
                $state.go("header.dashboard");

                $scope.logout();
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        };

    });