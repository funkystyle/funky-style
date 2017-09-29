angular.module("updateDeeplinkModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr","cgBusy"])
    .controller("updateDeeplinkCtrl", function($scope, $state, $timeout, toastr, $auth, $http, $stateParams) {
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

        if($auth.isAuthenticated() && $stateParams['id']) {
            $http({
                url: " /api/1.0/deep_link/"+$stateParams.id,
                method: "GET"
            }).then(function (data) {
                console.log("Success deeplink GET: ", data);
                $scope.deeplink = data.data;
                $scope.deeplink.affiliate_network = ($scope.deeplink.affiliate_network.indexOf('://') === -1) ? 'http://' + $scope.deeplink.affiliate_network : $scope.deeplink.affiliate_network;
            }, function (error) {
                console.log("Error Deeplink Save: ", error);
                toastr.error('Something went wrong!');
            });
        }

        // deeplinkReplace
        $scope.deeplinkReplace = function (value) {
            (value)? $scope.deeplink.replace.push({
                replace_string: "",
                find_string: "",
                encode: $scope.condition[1].code
            }): $scope.deeplink.replace.pop();
        };

        // Insert deeplink data to the database using addDeeplink()
        $scope.updateDeeplink = function (deeplink) {
            delete deeplink.$$hashKey;
            delete deeplink._updated;
            delete deeplink._created;
            delete deeplink._links;

            $http({
                url: "/api/1.0/deep_link/"+$stateParams.id,
                method: "PATCH",
                data: deeplink
            }).then(function (data) {
                console.log("Success deeplink Updated: ", data);
                toastr.success("Successfully Updated Deeplink", deeplink.affiliate_network);
                $state.go("header.deeplink");
            }, function (error) {
                console.log("Error Deeplink Save: ", error);
                toastr.error('Something went wrong!');
            });
        }
    });