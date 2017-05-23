angular.module("DashboardModule", ["constantModule", "satellizer", "toastr", "personFactoryModule"])
.controller("dashBoardCtrl", function ($scope, $state, mainURL, URL, $state, $auth, $http, toastr, personFactory) {

	$scope.deals = [];
    $scope.coupons = [];
    $scope.categories = [];
    $scope.persons = [];
    $scope.stores = [];

	if($auth.isAuthenticated()) {
		// get the list of coupons
	    var projection = {};
	    projection['name'] = 1;
	    $http({
	        url: "/api/1.0/coupons?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
	        mathod: "GET"
	    }).then(function (data) {
	        console.log(data);
	        if(data['data']) {
	            $scope.coupons = data.data._items;
	        }
	    }, function (error) {
	        console.log(error);
	    });

	    // get list of persons
	    var projection = {};
	    projection['name'] = 1;
	    $http({
	        url: "/api/1.0/persons?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
	        mathod: "GET",
	        headers: {
                authorization: $auth.getToken()
            }
	    }).then(function (data) {
	        console.log(data);
	        if(data['data']) {
	            $scope.persons = data.data._items;
	        }
	    }, function (error) {
	        console.log(error);
	    });

	    // get list of persons
	    var projection = {};
	    projection['name'] = 1;
	    $http({
	        url: "/api/1.0/deals?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
	        mathod: "GET"
	    }).then(function (data) {
	        console.log(data);
	        if(data['data']) {
	            $scope.deals = data.data._items;
	        }
	    }, function (error) {
	        console.log(error);
	    });


	    // get the list of featured stores
	    var projection = {};
	    projection['name'] = 1;
	    $http({
	        url: "/api/1.0/stores?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
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
	    var projection = {};
	    projection['name'] = 1;
	    $http({
	        url: "/api/1.0/categories?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
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