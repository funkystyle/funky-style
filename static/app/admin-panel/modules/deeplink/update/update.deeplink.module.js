angular.module("addDeeplinkModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr","cgBusy"])
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
        $scope.deeplink = {
            is_default: $scope.condition[1].code,
            start_url: {
                encode: $scope.condition[1].code
            },
            end_url: {
                encode: $scope.condition[1].code
            },
            tags: {
                replace: $scope.condition[1].code
            },
            replace: [{
                replace_string: "",
                find_string: ""
            }]
        };

        // deeplinkReplace
        $scope.deeplinkReplace = function (value) {
            (value)? $scope.deeplink.replace.push({
                replace_string: "",
                find_string: ""
            }): $scope.deeplink.replace.pop();
        };

        // Insert deeplink data to the database using addDeeplink()
        $scope.addDeeplink = function (deeplink) {
            console.log(deeplink);

            $http({
                url: "/api/1.0/deep_link",
                method: "POST",
                data: deeplink
            }).then(function (data) {
                console.log("Success deeplink Save: ", data);
            }, function (error) {
                console.log("Error Deeplink Save: ", error);
            });
        }
    });