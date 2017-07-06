angular.module("changePasswordModule", ["constantModule", "toastr", "satellizer", "personFactoryModule"])
    .controller('changePasswordCtrl', function($scope, $http, mainURL, URL, toastr, $auth, personFactory){
        $scope.change = {};

        if ($auth.isAuthenticated()) {
            personFactory.me().then(function(data) {
                if(data['data']['data']) {
                    $scope.u_user = data.data.data;
                    console.log($scope.u_user, $scope.u_user.tokens.login);
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, 'Error!')
            });
        }

        // change password click function
        $scope.changePassword = function (obj) {
            var object = {
                user_id: $scope.u_user._id,
                token: $scope.u_user.tokens.login,
                new_password: obj.new_password
            };

            $http({
                url: URL.changePassword,
                method: "POST",
                data: object
            }).then(function (data) {
                console.log(data);
                toastr.success("Please login Again!", "Password Changed Successfully!");
                $scope.logout();
            }, function (error) {
                console.log(error);
                toastr.error(error.data.error, "Error!");
            });
        }
    });