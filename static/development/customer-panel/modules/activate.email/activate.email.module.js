angular.module("activateEmailModule", ["constantModule", "satellizer", "toastr"])
    .controller("activateEmailCtrl", function($scope, $http, URL, $location, mainURL, $state, $stateParams, $auth, toastr) {
        
        console.log('Activate email controller');
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

                toastr.success("Please login!");
                $location.path('/')
            });
        };

    });