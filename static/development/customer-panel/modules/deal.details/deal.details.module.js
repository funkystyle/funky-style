angular.module("dealDetailsModule", ["Directives"])
    .controller("dealDetailsCtrl", function ($scope, $ocLazyLoad, $http, $state, $stateParams, $sce) {
        console.log("deal Details controller!");

        $scope.deal = {};
        $scope.showMore = {};
        $scope.imageShow = {};

        $scope.trustAsHtml = function(string) {
            if(string) {
                return $sce.trustAsHtml(string);
            }
        };

        // if stateParams of url found the call http request to get the deal details from ther server
        if($stateParams['url']) {
            // get the list of coupons
            var where = JSON.stringify({
                url: $stateParams.url
            });

            var embedded = JSON.stringify({
                'related_deals': 1,
                'deal_brands': 1,
                'deal_category': 1,
                'stores': 1,
                'stores.store': 1
            });

            var url = '/api/1.0/deals'+'?where='+where+'&number_of_clicks=1&embedded='+embedded+'&rand_number'+Math.random();
            $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data'] && data['data']['_items'].length) {
                    console.log(data.data._items[0]);
                    $scope.deal = data.data._items[0];
                    $scope.deal.voting = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
                    $scope.deal.expired_date = new Date($scope.deal.expired_date);
                } else {
                    $state.go('404');
                }
            }, function (error) {
                console.log(error);
            });


            // get the list of top stores
            $scope.top_stores = [];
            var projection = {
                "name": 1,
                "url": 1,
                "image": 1
            };

            $http({
                url: "/api/1.0/stores?projection="+JSON.stringify(projection)+'&rand_number' + new Date().getTime(),
                method: "GET"
            }).then(function (data) {
                if(data['data']) {
                    $scope.top_stores = data.data._items;
                }
            }, function (error) {
                console.log(error);
            });
        }
    });