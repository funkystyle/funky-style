angular.module('homeModule', ["headerModule", "storeServiceModule",
    "footerModule", "couponFactoryModule", "dealFactoryModule", "categoryFactoryModule"])
    .controller('homeCtrl', function ($scope, storeFactory, $http, couponFactory, $filter, dealFactory, categoryFactory) {
        console.log("home controller");

        $('.carousel').carousel({
            interval: 4000,
            pause: true
        });
        $scope.deals = [];
        $scope.coupons = [];
        $scope.categories = [];

        // get the list of coupons
        var obj = {};
        obj['featured_coupon'] = true;
        $http({
            url: "/api/1.0/coupons/?where="+JSON.stringify(obj),
            mathod: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.coupons = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });

        // get the list of Categories
        var cat = {};
        cat['featured_category'] = true;
        $http({
            url: "/api/1.0/categories/?where="+JSON.stringify(cat),
            mathod: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.categories = data.data._items;
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
