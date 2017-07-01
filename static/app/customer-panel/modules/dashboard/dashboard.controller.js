angular.module("dashboardModule", ["headerModule", "APP", "satellizer","toastr", "Directives"])
    .controller("dashboardCtrl", function ($scope, auth, $auth, $state, $http, toastr, $sce) {
        console.log("dashboard controller!");

        // declaring the scope variables
    	if(!$auth.isAuthenticated()) {
    	    $state.go('main.login');
        } else {
            setTimeout(function () {
                console.log($scope.user);

                var embedded = JSON.stringify({
                    "fav_stores": 1,
                    "fav_coupons": 1
                }),
                    url = "/api/1.0/persons/"+$scope.user._id+"?embedded="+embedded+"&r="+Math.random();
                $http({
                    url: url,
                    method: "GET",
                    headers: {
                        authorization: $auth.getToken()
                    }
                }).then(function (data) {
                    console.log(data);
                    $scope.user = data.data;
                }, function (error) {
                    console.log(error);
                });
            }, 1000);
        }

        $scope.trustAsHtml = function(string) {
            if(string) {
                return $sce.trustAsHtml(string);
            }
        };


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