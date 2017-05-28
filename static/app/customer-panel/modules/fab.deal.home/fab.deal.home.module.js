angular.module("allDealsModule", [])
    .controller("allDealsCtrl", function ($scope, $state, $stateParams, $http) {
        console.log("All Deals Controller!");

        $scope.deals = [];
        $scope.deal_categories = [];
        $scope.deal_brands = [];
        $scope.stores = [];

        var random = new Date().getDate();

        // get the list of top deal categories
        $http({
            url: "/api/1.0/deal_categories?max_results=4&rand="+random,
            method: "GET"
        }).then(function (data) {
            console.log("Deal Categories are: ", data.data._items);
            $scope.deal_categories = data.data._items;
        }, function (error) {
            console.log(error);
        });

        $http({
            url: "/api/1.0/deal_brands?max_results=8&rand="+random,
            method: "GET"
        }).then(function (data) {
            console.log("Deal Brands are: ", data.data._items);
            $scope.deal_brands = data.data._items;
        }, function (error) {
            console.log(error);
        });

        // get the list of deals related to selected deal brand
        var url = '/api/1.0/deals'+'?rand_number=' + random;
        $http({
            url: url,
            method: "GET"
        }).then(function (data) {
            console.log("All deals are: ", data.data._items);
            if(data['data']) {
                $scope.deals = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });


        // get the list of featured stores
        var store = {};
        store['featured_store'] = true;

        var projection = {};
        projection['name'] = 1;
        projection['url'] = 1;
        projection['image'] = 1;
        projection['menu'] = 1;
        $http({
            url: "/api/1.0/stores/?where="+JSON.stringify(store)+"&max_results=8"+"&projection="+JSON.stringify(projection)+"&rand_number" + new Date().getTime(),
            mathod: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.stores = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });
    });