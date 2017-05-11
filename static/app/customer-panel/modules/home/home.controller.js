angular.module('homeModule', ["headerModule", "storeServiceModule",
    "footerModule", "couponFactoryModule", "dealFactoryModule"])
    .controller('homeCtrl', function ($scope, storeFactory, couponFactory, $filter, dealFactory) {
        console.log("home controller");

        $('.carousel').carousel({
            interval: 4000,
            pause: true
        });
        $scope.coupons = [];
        $scope.deals = [];

        // get the list of coupons
        couponFactory.get().then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.coupons = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });

        dealFactory.get().then(function (data) {
            console.log("Deal factory ---", data);
            if(data['data']) {
                $scope.deals = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });
    });
