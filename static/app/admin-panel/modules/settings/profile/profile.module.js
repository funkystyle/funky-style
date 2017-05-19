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
            },
            {
                level: "user",
                text: "User"
            }
        ];
        $scope.u_user = {};
        $scope.userLevel = {};
        $scope.userLevel.level = undefined;

        if ($auth.isAuthenticated()) {
            personFactory.me().then(function(data) {
                if(data['data']['data']) {
                    $scope.u_user = data.data.data;
                    console.log($scope.u_user, $scope.u_user.tokens.login);
                    
                    $scope.userLevel.level = $scope.u_user.user_level[0];


                    console.log($scope.userLevel)
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, 'Error!')
            });
        }

        // updateUser
        $scope.updateUser = function () {
            delete $scope.u_user.created_date;
            delete $scope.u_user.modified_date;
            delete $scope.u_user._updated;

            $scope.u_user.user_level = [$scope.userLevel.level];
            console.log($scope.u_user);
            personFactory.update($scope.u_user, $scope.u_user.tokens.token).then(function (data) {
                console.log(data);
                toastr.success("Updated!", "Success!");

               setTimeout(function () {
                    $state.reload();
               }, 1000);
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        };

    });