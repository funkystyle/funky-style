/* module for add users */
angular.module("addUsersModule", ['constantModule', 'toastr', 'ui.select', 'personFactoryModule', 'cgBusy'])
    .controller("addUsersCtrl", function (toastr, $scope, $state, mainURL, URL, personFactory, $location) {
        $scope.genders = [
            {
                text: "Male",
                code: "male"
            },
            {
                text: "Female",
                code: 'female'
            }
        ];

        $scope.userLevels = [
            {
                level: "submitter",
                text: "Submitter"
            },
            {
                level: "editor",
                text: "Editor"
            },
            {
                level: "admin",
                text: "Admin"
            }
        ];
        $scope.user = {
            user_level: $scope.userLevels[0]['level'],
            gender: $scope.genders[0]['code']
        };

        $scope.createNow = function () {
            $scope.user.user_level = [$scope.user.user_level];
            $scope.load = personFactory.create([$scope.user]).then(function (data) {
                console.log(data);
                toastr.success(data.statusText, "Success!");
                $state.go('header.users.all');
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        }
    });