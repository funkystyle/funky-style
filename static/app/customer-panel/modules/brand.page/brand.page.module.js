angular.module("brandPageModule", ["Directives"])
    .controller("brandPageCtrl", function ($scope, $state, $stateParams,
                                           $ocLazyLoad, $http, $sce, $filter) {
        console.log("brand page controller !");

        $scope.search_brands = {};
        $scope.search = {};
        $scope.filter = {
            priceRange: {},
            brands: {}
        };

        $scope.priceRange = [
            {
                text: "< 2000",
                range: "0-2000"
            },
            {
                text: "3000 - 5000",
                range: "3000-5000"
            },
            {
                text: "7000 - 10000",
                range: "7000-10000"
            },
            {
                text: "> 10000",
                range: "10000-40000"
            }
        ];

        // apply filter
        $scope.applyFilter = function () {
            $scope.filterDeals = $filter("applyFilter")($scope.deals, $scope.filter);
        };

        $ocLazyLoad.load([
            'static/bower_components/owl.carousel/owl.carousel.css',
            'static/bower_components/owl.carousel/owl.carousel.js'
        ]).then(function () {
            function getVals(){
                // Get slider values
                var parent = this.parentNode;
                var slides = parent.getElementsByTagName("input");
                var slide1 = parseFloat( slides[0].value );
                var slide2 = parseFloat( slides[1].value );
                // Neither slider will clip the other, so make sure we determine which is larger
                if( slide1 > slide2 ){ var tmp = slide2; slide2 = slide1; slide1 = tmp; }

                var displayElement = parent.getElementsByClassName("rangeValues")[0];
                displayElement.innerHTML = slide1 + " - " + slide2;
            }

            window.onload = function(){
                // Initialize Sliders
                var sliderSections = document.getElementsByClassName("range-slider");
                for( var x = 0; x < sliderSections.length; x++ ){
                    var sliders = sliderSections[x].getElementsByTagName("input");
                    for( var y = 0; y < sliders.length; y++ ){
                        if( sliders[y].type ==="range" ){
                            sliders[y].oninput = getVals;
                            // Manually trigger event first time to display values
                            sliders[y].oninput();
                        }
                    }
                }
            };


            $scope.trustAsHtml = function(string) {
                if(string) {
                    return $sce.trustAsHtml(string);
                }
            };

            // get the deal brand using stateparam URL
            $scope.deal = {};
            $scope.deals = [];
            $scope.brands = [];
            var random = new Date().getDate();
            if($stateParams['url']) {
                var where = {
                    "url": $stateParams.url
                };
                var embedded = {
                    "related_brands": 1
                };
                $http({
                    url: "/api/1.0/deal_brands?where="+JSON.stringify(where)+"&rand="+random+"&embedded="+JSON.stringify(embedded),
                    method: "GET"
                }).then(function (data) {
                    if(data.data._items.length == 0) {
                        $state.go('404');
                    }
                    console.log("Deal brand is: ", data.data._items[0]);
                    $scope.deal = data.data._items[0];
                    $scope.deal.date = new Date();

                    setTimeout(function () {
                        $("#owl-demo").owlCarousel({
                            autoPlay: 2000, //Set AutoPlay to 2 seconds
                            transitionStyle: "fade",
                            loop: true,
                            items: 5,
                            itemsDesktop: [1199, 3],
                            itemsDesktopSmall: [979, 3]
                        });
                    });

                    // get the list of deals related to selected deal brand
                    var embedded = {};
                    embedded['related_deals'] = 1;
                    embedded['deal_brands'] = 1;
                    embedded['deal_category'] = 1;
                    embedded['stores.store'] = 1;

                    var where = {
                        "deal_brands": $scope.deal._id
                    };

                    var url = '/api/1.0/deals'+'?where='+JSON.stringify(where)+'&embedded='+JSON.stringify(embedded)+'&rand_number=' + random;
                    $http({
                        url: url,
                        method: "GET"
                    }).then(function (data) {
                        console.log("All Related Deals: ", data.data._items);
                        if(data['data']) {
                            $scope.deals = data.data._items;
                            $scope.filterDeals = data.data._items;

                            angular.forEach($scope.deals, function (item) {
                               angular.forEach(item.deal_brands, function (brand) {
                                   var length = $filter('filter')($scope.brands, {_id: brand._id}).length;
                                   if(length == 0) {
                                       $scope.brands.push(brand);
                                   }
                               });
                            });
                        }
                    }, function (error) {
                        console.log(error);
                    });
                }, function (error) {
                    console.log(error);
                });
            }
        });
    })
    .filter("applyFilter", function ($filter) {
        return function (items, filter) {
            var list = [];
            if(!Object.keys(filter.priceRange).length && !Object.keys(filter.brands).length) {
                return items;
            }
            // return all items if all items of object is false
            var count = 0;
            angular.forEach(filter, function (values, keys) {
                angular.forEach(values, function (val, key) {
                    if(val == true) {
                        count ++;
                    }
                });
            });
            if(count == 0) {
                return items;
            }
            angular.forEach(items, function (item) {
                // for price range filter
                angular.forEach(filter.priceRange, function (val, key) {
                    var min = key.split('-')[0],
                        max = key.split('-')[1];
                    if(val == true && (item.actual_price > min && item.actual_price < max)) {
                        var length = $filter("filter")(list, {_id: item._id}).length;
                        if(length == 0) {
                            list.push(item);
                        }
                    }
                });

                // filter by brand wise
                angular.forEach(filter.brands, function (val, key) {
                    angular.forEach(item.deal_brands, function (deal_brand) {
                        if(val == true && key == deal_brand._id) {
                            var length = $filter("filter")(list, {_id: item._id}).length;
                            if(length == 0) {
                                list.push(item);
                            }
                        }
                    });
                });
            });
            return list;
        }
    });