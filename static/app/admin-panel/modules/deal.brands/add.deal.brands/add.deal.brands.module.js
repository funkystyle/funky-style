angular.module("addDealBrandsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
    .controller("addDealBrandsCtrl", function ($scope, $state, $stateParams, $timeout, toastr,
                                               storeFactory, $auth, personFactory, dealFactory) {
        $scope.selected_user = {};
        $scope.deal = {};
        $scope.stores = [];
        $scope.persons = [];

        if($auth.isAuthenticated()) {
            $scope.load = storeFactory.get($auth.getToken()).then(function (data) {
                console.log(data);
                if(data['_items']) {
                    $scope.stores = data._items;
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });

            personFactory.me().then(function (data) {
                console.log(data);
                $scope.persons.push(data.data.data);
                $scope.selected_user.user = $scope.persons[0];
                $scope.deal.last_modified_by = $scope.persons[0]._id;
            }, function (error) {
                console.log(error);
            });
        } else {

            $state.go("login");
        }

        // addDealBrands function
        $scope.addDealBrands = function (deal) {
            // deal.alt_image = "data:image/jpeg;base64,"+deal.image[0].base64
            deal.image = "";
            console.log(deal);

            dealFactory.post_deal_brands(deal).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Created", "Success!");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });