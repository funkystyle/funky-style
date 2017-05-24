angular.module("dynamicFieldsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
    .controller("dynamicFieldsCtrl", function ($scope, $state, $stateParams, dealFactory, $auth, $http, toastr) {
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
                text: "Number",
                code: "number"
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
                field_name: undefined,
                field_type: undefined
            }
        ];

        $scope.addOneMoreField = function () {
            $scope.repeatItems.push({
                field_name: undefined,
                field_type: undefined
            });
        };

        $scope.removeField = function (index) {
            if($scope.repeatItems.length > 1) {
                $scope.repeatItems.splice(index, 1);
            }
        };

        // selected category
        $scope.selectedCategory = function (item, model) {
            angular.forEach($scope.categories, function (category) {
               if(category._id == item._id) {
                   if(category['fields']) {
                       $scope.repeatItems = category.fields;
                   } else {
                       $scope.repeatItems = [
                           {
                               field_name: undefined,
                               field_type: undefined
                           }
                       ];
                   }
               }
            });
        };

        // store this dynamic fields into the table
        $scope.storeDynamicFilelds = function (deal) {
            console.log("deal is ", deal, "Repeated Items for fields --- ", $scope.repeatItems);
            var obj = {
                _id: deal.deal_category,
                fields: $scope.repeatItems
            };
            dealFactory.update_deal_categories(obj, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Updated", "Success!");
                $state.go("header.deal-categories");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
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