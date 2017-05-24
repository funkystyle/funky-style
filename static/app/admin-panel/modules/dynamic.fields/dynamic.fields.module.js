angular.module("dynamicFieldsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
    .controller("dynamicFieldsCtrl", function ($scope, $state, $stateParams, dealFactory, $auth, $http) {
        console.log("dynamic field controller!");

        $scope.fields = {
            deal_category: undefined,
            fields: []
        };
        $scope.types = [
            {
                text: "Text",
                code: "text"
            },
            {
                text: "List",
                code: "list"
            }
        ];
        $scope.required = [
            {
                text: "Yes",
                code: true
            },
            {
                text: "No",
                code: false
            }
        ];
        $scope.repeatItems = [
            {
                name: undefined,
                type: undefined,
                required: undefined
            }
        ];

        $scope.addOneMoreField = function () {
            $scope.repeatItems.push({
                name: undefined,
                type: undefined,
                required: undefined
            });
        };

        $scope.removeField = function (index) {
            if($scope.repeatItems.length > 1) {
                $scope.repeatItems.splice(index, 1);
            }
        };

        // store this dynamic fields into the table
        $scope.storeDynamicFilelds = function (object) {
            console.log(object);

            $http({
                url: "",
                method: "POST",
                data: object
            }).then(function (data) {
                console.log(data);
            }, function (error) {
                console.log(error);
            });
        };

        if($auth.isAuthenticated()) {
            $scope.load = dealFactory.get_deal_categories($auth.getToken()).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.categories = data.data._items;

                    console.log($scope.categories);
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        }
    });