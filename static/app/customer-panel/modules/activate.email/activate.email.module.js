angular.module("activateEmailModule", ["constantModule"])
    .controller("activateEmailCtrl", function($scope, $http, URL, mainURL, $stateParams, $state) {
        
        console.log($stateParams);
        $scope.message = {
            text: "Please wait..."
        }

        if($stateParams.token && $stateParams.user_id) {
            $http({
                url: mainURL + URL.emailActivation,
                data: $stateParams,
                method: "POST"
            }).then(function (success) {
                console.log(success);
                $scope.message = {
                    text: "You are Re-directing...",
                    type: 'success',
                    message: success.data.data
                };
                setTimeout(function () {
                    $state.go('main.login');
                }, 2800);
            }, function (error) {
                console.log(error);

                $scope.message = {
                    text: "We are Sorry.!",
                    type: "error",
                    message: error.data.error
                };

                setTimeout(function () {
                    $state.go('main.login');
                }, 2800);
            });
        };

    });