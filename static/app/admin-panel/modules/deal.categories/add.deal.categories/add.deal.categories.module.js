angular.module("addDealCategoriesModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
.controller("addDealCategoriesCtrl", function ($scope, $timeout, toastr,
                                               storeFactory, $auth, personFactory, dealFactory) {
    $scope.selected_user = {};
    $scope.deal = {};
    $scope.persons = [];

    if($auth.isAuthenticated()) {
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
    $scope.addDealCategory = function (deal) {
        //deal.alt_image = "data:image/jpeg;base64,"+deal.image[0].base64
        deal.image = "";
        console.log(deal);

        dealFactory.post_deal_categories(deal).then(function (data) {
            console.log(data);
            toastr.success(deal.name+" Created", "Success!");
        }, function (error) {
            console.log(error);

            toastr.error(error.data._error.message, error.data._error.code);
        });
    }
});