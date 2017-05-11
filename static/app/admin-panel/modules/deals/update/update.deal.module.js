angular.module("updateDealModule", ["ui.select", "ngSanitize", "ui.bootstrap",
    "toastr", "satellizer","cgBusy", "naif.base64", "dealFactoryModule", "storeFactoryModule"])
    .controller("updateDealCtrl", function($scope, $state, $stateParams, $timeout, toastr, $auth, dealFactory, storeFactory) {
        $scope.deal = {};
        $scope.deals = [];
        $scope.categories = [];
        $scope.stores = [];
        $scope.clear = function() {
            $scope.store.relatedStore = undefined;
        };
        $scope.$watch('deal.name', function(newVal, oldVal) {
            $scope.deal.url = (newVal) ? newVal+"-deal" : undefined;
        }, true);
        // get all stores into the array
        if($auth.isAuthenticated() && $stateParams['id']) {
            $scope.load = dealFactory.get().then(function (data) {
                console.log(data);
                if(data) {
                    $scope.deals = data.data._items;
                    angular.forEach($scope.deals, function (item) {
                        if(item._id == $stateParams.id) {
                            console.log(item.name, item._id);
                            $scope.deal = item;
                        }
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
            $scope.load = dealFactory.get_deal_categories($auth.getToken()).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.categories = data.data._items;
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
            $scope.load = storeFactory.get().then(function (data) {
                console.log(data);
                if(data) {
                    $scope.stores = data._items;
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
            $scope.load = dealFactory.get_deal_brands($auth.getToken()).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.brands = data.data._items;
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        } else {
            $state.go("login");
        }

        // addDealBrands function
        $scope.updateDeal = function (deal) {
            delete deal._created;
            delete deal._updated;
            delete deal._links;
            console.log(deal);

            dealFactory.update(deal, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Updated", "Success!");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });