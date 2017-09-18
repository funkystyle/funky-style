angular.module("headerModule", ["constantModule", "satellizer", "toastr", "personFactoryModule"])
    .controller("headerCtrl", function($scope, $rootScope, mainURL, URL, $state, $auth, $http, toastr, personFactory) {
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

        $scope.checkRole = function () {
            return $scope.user.user_level !== 'submitter';
        };

        // get the seo details
        $scope.seoList = [];
        $scope.getSeoDetails = function () {
            $http({
                // TODO
                url: URL.master_seo+"?rand="+Math.random(),
                method: "GET"
            }).then(function (data) {
                console.log("SEO data: ", data);
                if(data.data._items.length !== 0) {
                    $scope.seoList = data.data._items;
                }
            }, function (error) {
                console.log(error);
            });
        };

        $scope.getSeoDetails();

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