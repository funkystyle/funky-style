angular.module("brandPageModule", [])
    .controller("brandPageCtrl", function ($scope, $state, $stateParams, $ocLazyLoad, $http) {
        console.log("brand page controller !");

        $ocLazyLoad.load([
            'static/bower_components/owl.carousel/owl.carousel.css',
            'static/bower_components/owl.carousel/owl.carousel.js'
        ]).then(function () {
            $(document).ready(function() {
                $("#owl-demo").owlCarousel({
                    autoPlay: 2000, //Set AutoPlay to 2 seconds
                    transitionStyle: "fade",
                    loop: true,
                    items: 5,
                    itemsDesktop: [1199, 3],
                    itemsDesktopSmall: [979, 3]
                });
            });
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

            // get the list of deals
            $scope.deals = [];

            var embedded = {};
            embedded['related_deals'] = 1;
            embedded['deal_brands'] = 1;
            embedded['deal_category'] = 1;
            embedded['stores.store'] = 1;

            var url = '/api/1.0/deals'+'?&embedded='+JSON.stringify(embedded)+'&rand_number' + new Date().getTime();
            $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.deals = data.data._items;
                }
            }, function (error) {
                console.log(error);
            });
        });
    });