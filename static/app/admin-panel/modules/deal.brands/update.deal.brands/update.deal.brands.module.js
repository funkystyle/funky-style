angular.module("updateDealBrandsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
    .controller("updateDealBrandsCtrl", function ($scope, $timeout, $stateParams, $state,
                                                  toastr, storeFactory, $auth, personFactory, dealFactory) {

        $scope.selected_user = {};
        $scope.deal = {};
        $scope.stores = [];
        $scope.persons = [];

        if($auth.isAuthenticated() && $stateParams['id']) {
            $scope.load = dealFactory.get_deal_brands().then(function (data) {
                console.log(data);

                if(data['data']) {
                    var items = data.data._items;
                    angular.forEach(items, function (item) {
                        if(item._id == $stateParams.id) {
                            $scope.deal = item;
                        }
                    });
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
        $scope.updateDealBrands = function (deal) {
            //deal.alt_image = "data:image/jpeg;base64,"+deal.image[0].base64
            deal.image = "";
            delete deal._created;
            delete deal._updated;
            delete deal._links;

            console.log(deal);

            dealFactory.update_deal_brands(deal, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Updated", "Success!");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });