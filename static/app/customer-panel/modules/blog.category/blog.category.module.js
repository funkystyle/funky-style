angular.module("blogCategoryModule", [])
    .controller("blogCategoryCtrl", function ($scope, $state, $stateParams, $http) {
        console.log("Blog category controller!");


        // ==== jquery Script
        $(document).ready(function(){
            // Activate Carousel
            $("#myCarousel").carousel({interval: 1500});

            // Enable Carousel Indicators
            $(".item1").click(function(){
                $("#myCarousel").carousel(0);
            });
            $(".item2").click(function(){
                $("#myCarousel").carousel(1);
            });
        });

        // get all the list of categories
        $scope.categories = [];
        var projection = {
            "name": 1,
            "url": 1
        };
        var url = '/api/1.0/categories?projection='+JSON.stringify(projection)+"&rand="+Math.random();
        $http({
            url: url,
            method: "GET"
        }).then(function (data) {
            console.log("Categories Data: ", data.data._items);
            if(data['data']) {
                $scope.categories = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });
    });