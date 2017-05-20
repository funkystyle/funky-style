angular.module("loginModule", ["constantModule", "satellizer", "toastr"])
    .controller("loginCtrl", function($scope, $http, URL, mainURL, $state, $stateParams, $auth, toastr) {
        // Declaring variables
        if($auth.isAuthenticated()) {
            $state.go('main.dashboard');
        }
        $scope.login = {};
        $scope.register = {
            user_level: ['user'],
            status: "inactive"
        };
        // login click
        $scope.loginNow = function(login) {
            $http({
                url: URL.login,
                method: "POST",
                data: login
            }).then(function(data) {
                if(data.data) {
                    $auth.setToken(data.data.data.login_token);
                    toastr.success("Logged in!", "Success!");
                    $state.go("main.dashboard", $stateParams, {reload: true});
                }
            }, function(error) {
                console.log("error", error);
                toastr.error(error.data._error.message, "Error!");
            });
        };

        $scope.registerNow = function(register) {
            register.city = "s";
            register.age = 25;
            register.gender = "male";
            $http({
                url: mainURL + URL.register,
                method: "POST",
                data: [register]
            }).then(function(data) {
                console.log("asdasdasdass", data);
                toastr.success("Please check your E-Mail!", "Successfully Registered!");
                setTimeout(function () {
                    $state.go('main.home')
                }, 500)
            }, function(error) {
                console.log("error", error);
                toastr.error(error.data._error.message, "Error!");
            });
        }
    });