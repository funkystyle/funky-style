angular.module('homeModule', ["headerModule", "storeServiceModule",
    "footerModule", "couponFactoryModule", "dealFactoryModule", "categoryFactoryModule"])
    .controller('homeCtrl', function ($scope, storeFactory, $http, couponFactory, $filter, dealFactory,
                                      categoryFactory, $ocLazyLoad, $stateParams) {
        console.log("home controller");
        $scope.params = undefined;
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
        couponFactory.getCoupon(JSON.stringify(obj)).then(function (data) {
            console.log(data);
            if(data['data']) {
                var coupons = data.data._items;
                angular.forEach(coupons, function (item) {
                    if(new Date(item.expire_date) > new Date()) {
                        if($scope.coupons.indexOf(item) == -1) {
                            $scope.coupons.push(item);
                        }
                    }
                });
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


        //  ======== if stateParams having the coupon code
        if($stateParams['cc']) {
            $scope.params = $stateParams.cc;
            $ocLazyLoad.load("static/bower_components/clipboard/dist/clipboard.min.js").then(function (data) {
                var clipboard = new Clipboard('.btn');

                clipboard.on('success', function(e) {
                    console.info('Action:', e.action);
                    console.info('Text:', e.text);
                    console.info('Trigger:', e.trigger);

                    e.clearSelection();
                });
                $scope.$watch('coupons', function (newVal, oldVal) {
                    console.log(newVal, oldVal);
                    if(newVal) {
                        angular.forEach(newVal, function (item) {
                            if(item._id == $stateParams.cc) {
                                $scope.couponInfo = item;
                            }
                        });
                    }
                }, true);
                clipboard.on('error', function(e) {
                    console.error('Action:', e.action);
                    console.error('Trigger:', e.trigger);
                });
            });
        }
    });
