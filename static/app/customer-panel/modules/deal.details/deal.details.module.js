angular.module("dealDetailsModule", ["footerModule"])
    .controller("dealDetailsCtrl", function ($scope, $ocLazyLoad, $http, $state, $stateParams) {
        console.log("deal Details controller!");

        $scope.deal = {};
        // if stateParams of url found the call http request to get the deal details from ther server
        if($stateParams['url']) {
            // get the list of coupons
            var where = {};
            where['url'] = $stateParams.url;

            var embedded = {};
            embedded['related_deals'] = 1;
            embedded['deal_brands'] = 1;
            embedded['deal_category'] = 1;
            embedded['stores.store'] = 1;



            var url = '/api/1.0/deals'+'?where='+JSON.stringify(where)+'&embedded='+JSON.stringify(embedded)+'&rand_number' + new Date().getTime();
            $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data'] && data['data']['_items'].length) {
                    console.log(data.data._items[0]);
                    $scope.deal = data.data._items[0];
                    $scope.deal.expired_date = new Date($scope.deal.expired_date);
                }
            }, function (error) {
                console.log(error);
            });
        }
    });