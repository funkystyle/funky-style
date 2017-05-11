angular.module("addDealModule", ["ui.select", "ngSanitize", "ui.bootstrap",
    "toastr", "satellizer","cgBusy", "naif.base64", "dealFactoryModule", "storeFactoryModule"])
    .controller("addDealCtrl", function($scope, $timeout, toastr, $auth, dealFactory, storeFactory) {
        $scope.deal = {
            expired_date: new Date()
        };
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
        if($auth.isAuthenticated()) {
            $scope.load = dealFactory.get().then(function (data) {
                console.log(data);
                if(data) {
                    $scope.deals = data.data._items;
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
        }

        // addDealBrands function
        $scope.addDeal = function (deal) {
            // deal.alt_image = "data:image/jpeg;base64,"+deal.image[0].base64
            console.log(deal);
            deal.top_banner = "";
            deal.side_banner = "";
            console.log(deal);

            dealFactory.post(deal).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Created", "Success!");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });