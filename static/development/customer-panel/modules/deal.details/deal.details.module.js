angular.module("dealDetailsModule", ["Directives"])
    .controller("dealDetailsCtrl", function ($scope, $ocLazyLoad, $http, $compile, $state, $stateParams, $sce, Query, DestionationUrl) {
        console.log("deal Details controller!");

        $scope.deal = {};
        $scope.showMore = {};
        $scope.imageShow = {};

        $scope.trustAsHtml = function(string) {
            if(string) {
                return $sce.trustAsHtml(string);
            }
        };

        $scope.goScroll = function (id) {
            var selector = $("#"+id);
            console.log(selector.position().top + 150);
            $('html, body').animate({
                'scrollTop' : selector.offset().top - 150
            });
        };

        var random = new Date().getDate();

        // get the list of top deal Brands
        var featured = JSON.stringify({
            featured: true
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


        // Get the top banner from banners table
        $scope.top_banner = {};
        var where = JSON.stringify({
            "top_banner_string": 'deal_individual',
            "expired_date": {
                "$gte": new Date().toGMTString()
            }
        });
        var url = "/api/1.0/banner?where="+where;
        Query.get(url).then(function (banner) {
            console.log("banner Details: ", banner.data._items);
            $scope.top_banner = banner.data._items[0];
        });

        // Get the Side banner from banners table
        $scope.side_banner = {};
        where = JSON.stringify({
            "side_banner_string": 'deal_individual'
        });
        url = "/api/1.0/banner?where="+where;
        Query.get(url).then(function (banner) {
            console.log("banner Details: ", banner.data._items);
            $scope.side_banner = banner.data._items[0];
        });

        // if stateParams of url found the call http request to get the deal details from ther server
        if($stateParams['url']) {
            // get the list of coupons
            where = JSON.stringify({
                url: $stateParams.url
            });

            var embedded = JSON.stringify({
                'related_deals': 1,
                'deal_brands': 1,
                'deal_category': 1,
                'stores': 1,
                'stores.store': 1,
                'store_temp': 1
            });

            url = '/api/1.0/deals'+'?where='+where+'&number_of_clicks=1&embedded='+embedded+'&rand_number'+Math.random();
            $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data'] && data['data']['_items'].length) {
                    console.log(data.data._items[0]);
                    $scope.deal = data.data._items[0];
                    $scope.deal.toDayDate = new Date();
                    $scope.deal.voting = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
                    $scope.deal.expired_date = new Date($scope.deal.expired_date);

                    // get the related coupons of selected store
                    if($scope.deal.deal_type === 'store') {
                        var temp = {};
                        temp["related_stores"] = {
                            "$in": [$scope.deal.store_temp._id]
                        };
                        var sort = "&max_results=5&sort=[('_updated', -1)]";
                        url = "/api/1.0/coupons"+"?where="+JSON.stringify(temp)+sort;
                        $http({
                            url: url,
                            method: "GET"
                        }).then(function (coupons_list) {
                            console.log("Coupons List: ", coupons_list);
                            $scope.store_related_coupons = coupons_list['data']['_items'];
                        });
                    }
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

        // open coupon popup code
        $scope.openCouponCode = function (store, item) {
            // get the Deeplink destionation URL for it
            DestionationUrl.destination_url(item.destination_url).then(function (data) {
                var output = data['data']['data']['output_url'],
                    generated_url = output ? output : item.destination_url;
                url = $state.href('main.deal_post_details', {url: $stateParams['url'], cc: item._id, destionationUrl: generated_url});
                //window.open(url,'_blank');
                $('<a href="'+url+'" target="_blank">&nbsp;</a>')[0].click();
                window.location.href = generated_url;
            }, function (error) {
                console.log(error);
            });
        };

        $scope.goDeeplink = function (url) {
            var obj = {
                destination_url : url
            };
            $scope.openCouponCode({}, obj);
        };

        //  ======== if stateParams having the coupon code
        if($stateParams['cc']) {
            $("coupon-info-popup").remove();
            embedded = JSON.stringify({
                'related_stores': 1,
                'related_categories': 1
            });
            url = "/api/1.0/coupons/"+$stateParams['cc']+"?number_of_clicks=1&embedded="+embedded+"&rand="+Math.random();
            $http.get(url).then(function (data) {
                console.log("$stateParams CC Data: ", data.data);
                $scope.couponInfo = data['data'];
                // open directive popup
                var el = $compile( "<coupon-info-popup parent='store' type='store' coupon='couponInfo'></coupon-info-popup>" )( $scope );
                $("body").append(el);
                setTimeout(function () {
                    $("#couponPopup").modal("show");
                }, 1000);
                console.log(el)
            }, function (error) {
                console.log("$stateParams CC: ", error);
                $state.go("main.deal_post_details", {url: $stateParams['url'], cc: undefined, destionationUrl: undefined});
            });
        }
    }).filter("quickLimit", function () {
        return function (item) {
            var object = {};

            angular.forEach(item, function (val, key) {
                if (Object.keys(object).length < 15) {
                    object[key] = val;
                }
            });

            return object;
        }
    })
    .factory("Query", function ($http, $q) {
        return {
            get: function (url) {
                var d = $q.defer();
                $http({
                    url: url+"&r="+Math.random(),
                    method: "GET"
                }).then(function (data) {
                    d.resolve(data);
                }, function (error) {
                    d.reject(error);
                });
                return d.promise;
            }
        }
    })