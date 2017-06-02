angular.module("headerModule", ["constantModule", "satellizer", "toastr", "personFactoryModule"])
    .controller("headerCtrl", function($scope, $state, mainURL, URL, $state, $auth, $http, toastr, personFactory) {
        $scope.state = $state;
        $scope.user = {};
        $scope.selected_user = {};
        $scope.status = ["Pending", "Draft", "Trash", "Verified", "Publish"];


        if ($auth.isAuthenticated()) {
            personFactory.me().then(function(data) {
                if(data['data']['data']) {
                    $scope.user = data.data.data;

                    console.log("logged user is ------ ", $scope.user);
                }
            }, function (error) {
                console.log(error);
                $auth.removeToken();
                $state.go('login');
            });

            
        }

        $scope.logout = function () {
            if($auth.isAuthenticated()) {
                $http({
                    url: URL.logout,
                    method: "GET"
                }).then(function (data) {
                    console.log(data);
                    $auth.logout();

                    $state.go('login');
                }, function (error) {
                    console.log(error);

                    toastr.error(error.data.error, 'Error');
                });
            }
        };
    })