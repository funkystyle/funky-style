angular.module("loginModule", ["Directives", "cgBusy", "constantModule", "satellizer", "toastr"])
    .controller("loginCtrl", function($scope, $http, mainURL, URL, $auth, $state, toastr) {
        // Declaring variables
        $scope.login = {};
        console.log($scope.login)
        // login click function
        $scope.loginNow = function(login) {
            $scope.load = $http({
                url: URL.login,
                method: "POST",
                data: login
            }).then(function(data) {
                console.log(data);
                if(data['data']['data']) {
                    console.log(data.data.data);
                    $auth.setToken(data.data.data.login_token);
                } else  {
                    $auth.setToken(data.data.login_token);
                }
                toastr.success("Successfully Logged in", "Success!");
                setTimeout(function () {
                    $state.go("header.dashboard");
                }, 1500);
            }, function(error) {
                console.log("error", error);
                toastr.error(error.data._error.message, "Error!");
            });
        }
    });