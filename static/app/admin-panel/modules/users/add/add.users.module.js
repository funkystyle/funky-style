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
                level: "admin",
                text: "Admin"
            },
            {
                level: "submitter",
                text: "Submitter"
            },
            {
                level: "editor",
                text: "Editor"
            }
        ];
        $scope.user = {
            user_level: $scope.userLevels[0].level,
            gender: $scope.genders[0]['code']
        };

        $scope.createNow = function () {
            console.log("Create now User: ", $scope.user);
            $scope.load = personFactory.create([$scope.user]).then(function (data) {
                console.log(data);
                toastr.success(data.statusText, "Success!");
                $state.go('header.users.all');
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        }
    })
    .directive('onlyDigits', function() {
        return {
            restrict: 'A',
            require: '?ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function(inputValue) {
                    if (inputValue == undefined) return '';
                    var transformedInput = inputValue.replace(/[^0-9]/g, '');
                    if (transformedInput !== inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }
                    return transformedInput;
                });
            }
        };
    });