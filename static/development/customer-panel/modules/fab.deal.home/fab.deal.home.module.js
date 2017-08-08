angular.module("allDealsModule", ["Directives"])
    .controller("allDealsCtrl", function ($scope, $state, $stateParams, $http, SEO, $rootScope) {
        console.log("All Deals Controller!");

        $scope.deals = [];
        $scope.deal_categories = [];
        $scope.deal_brands = [];
        $scope.stores = [];

        var random = new Date().getDate();

        // get the list of top deal categories
        var featured = JSON.stringify({
            featured: true
        });
        $http({
            url: "/api/1.0/deal_categories?where="+featured+"&max_results=4&rand="+random,
            method: "GET"
        }).then(function (data) {
            console.log("Deal Categories are: ", data.data._items);
            $scope.deal_categories = data.data._items;
        }, function (error) {
            console.log(error);
        });

        $http({
            url: "/api/1.0/deal_brands?where="+featured+"&max_results=8&rand="+random,
            method: "GET"
        }).then(function (data) {
            console.log("Deal Brands are: ", data.data._items);
            $scope.deal_brands = data.data._items;
        }, function (error) {
            console.log(error);
        });

        // get the list of Best selling deals based on number of clicks
        var url = '/api/1.0/deals'+'?sort=-number_of_clicks&rand_number=' + random;
        $http({
            url: url,
            method: "GET"
        }).then(function (data) {
            console.log("All deals are: ", data.data._items);
            if(data['data']) {
                $scope.best_deals = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });

        // get the list of deals based on upcoming field in database
        var url = '/api/1.0/deals'+'?sort=-upcoming&rand_number=' + random;
        $http({
            url: url,
            method: "GET"
        }).then(function (data) {
            console.log("All deals are: ", data.data._items);
            if(data['data']) {
                $scope.upcoming_deals = data.data._items;
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


        // get the list of SEO
        SEO.getSEO().then(function (data) {
            angular.forEach(data, function (item) {
                if(item.selection_type.code == 'deal') {
                    var data = SEO.seo("", item, 'deal');
                    $rootScope.pageTitle = data.title;
                    $rootScope.pageDescription = data.description;
                }
            });
        });
    })