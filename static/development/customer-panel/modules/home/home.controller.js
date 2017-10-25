angular.module('homeModule', ["headerModule", "Directives", "toastr"])
    .controller('homeCtrl', function ($scope, $sce, $http, $filter, toastr, $ocLazyLoad, $state,
                                      $stateParams, $rootScope, SEO, $compile, Query, DestionationUrl) {
        $scope.params = undefined;
        $scope.deals = [];
        $scope.categories = [];

        // get the list of coupons
        var embedded = {};
        embedded['related_categories'] = 1;
        embedded['related_stores'] = 1;

        $scope.fillCoupons = function (url) {
            $scope.coupons = [];
            Query.get(url).then(function (data) {
                console.log(data);
                if(data['data']) {
                    var coupons = data.data._items;
                    angular.forEach(coupons, function (item) {
                        if(new Date(item.expire_date) > new Date()) {
                            if($scope.coupons.indexOf(item) === -1) {
                                $scope.coupons.push(item);
                            }
                        }
                    });
                }
            }, function (error) {
                console.log(error);
            });
        };

        $scope.featuredResults = function () {
            // get the list of top deal categories
            var featured = JSON.stringify({
                featured_coupon: true,
                'status': 'Publish'
            });
            var url = '/api/1.0/coupons'+'?where='+featured+'&max_results=10&sort=-_created&embedded='+JSON.stringify(embedded)+'&rand=' + Math.random();
            $scope.fillCoupons(url);
        };

        $scope.featuredResults();

        // Get the most used, top coupons from the server
        $scope.fetchCoupons = function (sort) {
            var where = JSON.stringify({
                'status': 'Publish'
            });
            var url = '/api/1.0/coupons'+'?where='+where+'&max_results=10&sort=-'+sort+'&embedded='+JSON.stringify(embedded)+'&rand=' + Math.random();
            $scope.fillCoupons(url);
        };


        // get the list of SEO
        SEO.getSEO().then(function (data) {
            angular.forEach(data, function (item) {
                if(item.selection_type.code === 'home') {
                    SEO.seo("", item, 'home');
                }
            });
        });

        // get the slider banners
        $scope.banners = [];
        var where = JSON.stringify({
            "top_banner_string": 'home',
            "expired_date": {
                "$gte": new Date().toGMTString()
            }
        });
        projection = {
            "top_banner_string": 1,
            "image": 1,
            "title": 1,
            "image_text": 1,
            "destination_url": 1
        };

        url = '/api/1.0/banner'+'?where='+where+'&projection='+JSON.stringify(projection);
        Query.get(url).then(function (data) {
            console.log(data);
            if(data['data']) {
                console.log("Banners: ", data.data._items);
                $scope.banners = data.data._items;

                $('#myCarousel').carousel({
                    interval: 4000,
                    pause: "hover",
                    loop: true
                });
            }
        }, function (error) {
            console.log(error);
        });

        // open coupon popup code
        $scope.openCouponCode = function (store, item) {
            // get the Deeplink destionation URL for it
            DestionationUrl.destination_url(item.destination_url).then(function (data) {
                var output = data['data']['data']['output_url'],
                    generated_url = output ? output : item.destination_url,
                    href_link = $state.go('main.home', {cc: item._id, destionationUrl: generated_url});
                var tabOpen = window.open(href_link, 'newtab');
                if (tabOpen === null || typeof(tabOpen) === 'undefined') {
                    toastr.error('Please disable your pop-up blocker and click the link again to copy your Coupon Code', "Disable Pop-Up Blocker!");
                }
                else {
                    tabOpen.focus();
                    window.location.href = generated_url;
                }
            });
        };

        // get the list of featured stores
        var store = {};
        store['featured_store'] = true;

        projection = {};
        projection['name'] = 1;
        projection['url'] = 1;
        projection['image'] = 1;
        projection['menu'] = 1;
        projection['related_coupons'] = 1;
        url = "/api/1.0/stores/?where="+JSON.stringify(store)+"&max_results=24&projection="+JSON.stringify(projection);
        Query.get(url).then(function (data) {
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
        url = "/api/1.0/categories/?where="+JSON.stringify(cat)+"&max_results=24&projection="+JSON.stringify(projection);
        Query.get(url).then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.categories = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });

        where = JSON.stringify({
            "status": true
        });
        // get the list of featured stores
        url = "/api/1.0/deals?where="+where+"&max_results=24";
        Query.get(url).then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.deals = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });


        //  ======== if stateParams having the coupon code
        if($stateParams['cc']) {
            $("coupon-info-popup").remove();
            embedded = JSON.stringify({
                'related_stores': 1,
                'related_categories': 1
            });
            url = "/api/1.0/coupons/"+$stateParams['cc']+"?number_of_clicks=1&embedded="+embedded+"&rand="+Math.random();
            Query.get(url).then(function (data) {
                console.log("$stateParams CC Data: ", data.data);
                $scope.couponInfo = data['data'];
                // open directive popup
                var el = $compile( "<coupon-info-popup type='home' coupon='couponInfo'></coupon-info-popup>" )( $scope );
                $("body").append(el);
                setTimeout(function () {
                    $("#couponPopup").modal("show");
                }, 1000);
            }, function (error) {
                console.log("$stateParams CC: ", error);
                $state.go("main.home", {cc: undefined, destionationUrl: undefined});
            });
        }

        $scope.trustAsHtml = function(string) {
            if(string) {
                return $sce.trustAsHtml(string);
            }
        };

        // show description
        $scope.showDescription = function (id) {
            $(".show-description").hide();
            $("#show-desc-"+id).fadeIn(200);
        };
        $scope.closeDescription = function () {
            $(".show-description").fadeOut();
        }
    })
    .factory("Query", function ($http, $q) {
        return {
            get: function (url) {
                var d = $q.defer();
                $http({
                    url: url+"&r="+Math.random(),
                    method: "GET",
                    headers: {
                        "Content-Encoding": "gzip"
                    }
                }).then(function (data) {
                    d.resolve(data);
                }, function (error) {
                    d.reject(error);
                });
                return d.promise;
            }
        }
    });
