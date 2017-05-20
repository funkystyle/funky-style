angular.module("dashboardModule", ["headerModule", "APP", "satellizer","toastr"])
    .controller("dashboardCtrl", function ($scope, auth, $auth, $state, $http, toastr) {
        console.log("dashboard controller!");

        // declaring the scope variables
    	$scope.user = {};
    	
    	if($auth.isAuthenticated()) {
            // getting the current user information
            auth.me().then(function (data) {
                console.log(data);
                $scope.user = data.data;
            }, function (error) {
                console.log(error.error);
            });
        } else {
    	    $state.go('main.login');
        }


        // logout
        $scope.logout = function () {
            if($auth.isAuthenticated()) {
                $http({
                    url: "/api/1.0/auth/logout",
                    method: "GET"
                }).then(function (data) {
                    console.log(data);
                    $auth.logout();

                    toastr.success("Successfully Logged out!", "Hey!");
                    $state.go('main.login');
                }, function (error) {
                    console.log(error);

                    toastr.error(error.data.error, 'Error');
                });
            }
        };
    });