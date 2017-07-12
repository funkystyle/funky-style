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
                find_string: "",
                encode: $scope.condition[1].code
            }]
        };

        // deeplinkReplace
        $scope.deeplinkReplace = function (value) {
            (value)? $scope.deeplink.replace.push({
                replace_string: "",
                find_string: "",
                encode: $scope.condition[1].code
            }): $scope.deeplink.replace.pop();
        };

        // Insert deeplink data to the database using addDeeplink()
        $scope.addDeeplink = function (deeplink) {
            delete deeplink.$$hashKey;
            console.log(deeplink, JSON.stringify(deeplink));

            $http({
                url: "/api/1.0/deep_link",
                method: "POST",
                data: deeplink
            }).then(function (data) {
                console.log("Success deeplink Save: ", data);
                toastr.success("Successfully Created Deeplink");
                $state.go("header.deeplink");
            }, function (error) {
                console.log("Error Deeplink Save: ", error);
                toastr.error('Something went wrong!');
            });
        }
    });