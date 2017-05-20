angular.module("updateDealCategoriesModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
    .controller("updateDealCategoriesCtrl", function ($scope, $stateParams, $timeout, toastr, $state,
                                                   storeFactory, $auth, personFactory, dealFactory) {

        $scope.selected_user = {};
        $scope.deal = {};
        $scope.persons = [];

        $scope.$watch('deal.name', function(newVal, oldVal) {
            $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-")+"-coupons" : undefined;
        }, true);

        if($auth.isAuthenticated() && $stateParams['id']) {
            $scope.load = dealFactory.get_deal_categories().then(function (data) {
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
        $scope.updateDealCategory = function (deal) {
            //deal.alt_image = "data:image/jpeg;base64,"+deal.image[0].base64
            deal.image = "";
            delete deal._created;
            delete deal._updated;
            delete deal._links;
            delete deal.image;
            delete deal.alt_image;

            console.log(deal);

            dealFactory.update_deal_categories(deal, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Updated", "Success!");
                $state.go("header.deal-categories");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });