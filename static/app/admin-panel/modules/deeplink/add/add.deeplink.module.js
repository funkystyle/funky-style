angular.module("addDeeplinkModule", ["ui.select", "ngSanitize", "ui.bootstrap",
    "toastr","cgBusy"])
    .controller("addDeeplinkCtrl", function($scope, $state, $timeout, toastr, $auth, $http) {
        // true or false
        $scope.condition = [
            {
                text: "True",
                code: true
            },
            {
                text: "False",
                code: false
            }
        ];
        var obj = {
            replace_string: undefined,
            find_string: undefined
        };
        $scope.indexArray = [obj];
        $scope.deeplink = {
            is_default: $scope.condition[1].code,
            start_url: {},
            end_url: {},
            tags: {},
            replace: []
        };

        // deeplinkReplace
        $scope.deeplinkReplace = function (value) {
            (value)? $scope.indexArray.push(obj): $scope.indexArray.pop();
        }
    });