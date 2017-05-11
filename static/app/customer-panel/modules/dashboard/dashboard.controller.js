angular.module("dashboardModule", ["headerModule", "APP", "satellizer",])
    .controller("dashboardCtrl", function ($scope, auth, $auth, $state) {
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
    });