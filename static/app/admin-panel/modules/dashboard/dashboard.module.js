angular.module("DashboardModule", ["constantModule", "satellizer", "toastr", "personFactoryModule"])
.controller("dashBoardCtrl", function ($scope, $state, mainURL, URL, $state, $auth, $http, toastr, personFactory) {

	$scope.deals = [];
    $scope.coupons = [];
    $scope.categories = [];
    $scope.persons = [];
    $scope.stores = [];

	if($auth.isAuthenticated()) {
		// get the list of coupons
	    var embedded = {};
	    embedded['related_categories'] = 1;
	    embedded['related_stores'] = 1;
	    
	    var url = '/api/1.0/coupons/'+'?sort=-_created&embedded='+JSON.stringify(embedded);
	    $http({
	        url: url,
	        method: "GET"
	    }).then(function (data) {
	        console.log(data);
	        if(data['data']) {
	            $scope.coupons = data.data._items;
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
	        url: "/api/1.0/stores/?where="+JSON.stringify(store)+"&max_results="+24+"&projection="+JSON.stringify(projection),
	        mathod: "GET"
	    }).then(function (data) {
	        console.log(data);
	        if(data['data']) {
	            $scope.stores = data.data._items;
	        }
	    }, function (error) {
	        console.log(error);
	    });


	    // get the list of Categories
	    var cat = {};
	    cat['featured_category'] = true;

	    var projection = {};
	    projection['name'] = 1;
	    projection['url'] = 1;
	    projection['image'] = 1;
	    $http({
	        url: "/api/1.0/categories/?where="+JSON.stringify(cat)+"&max_results="+24+"&projection="+JSON.stringify(projection),
	        mathod: "GET"
	    }).then(function (data) {
	        console.log(data);
	        if(data['data']) {
	            $scope.categories = data.data._items;
	        }
	    }, function (error) {
	        console.log(error);
	    });
	}
	
});