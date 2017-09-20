angular
    .module("storeinfoModule", ["Directives", "satellizer", "APP"])
    .controller("storeinfoController", function ($scope, $stateParams, $http, $state, $auth, $filter, $sce, $ocLazyLoad,
                                                 $rootScope, $compile, StoreQuery, $q, DestionationUrl, SEO) {
        $scope.favorites = {};
        $scope.comment = {};
        $scope.filter = {
            category: {},
            wallet: {},
            bank: {},
            city: {},
            brands: {},
            festivals: {}
        };
        $scope.search = {
            category: undefined,
            wallet: undefined,
            bank: undefined,
            city: undefined,
            brands: undefined,
            festivals: undefined
        };
        $scope.showMore = {
            all: {},
            deals: {},
            coupons: {}
        };
        $scope.store = {};
        $scope.coupons = [];
        $scope.expiredCoupons = [];
        $scope.suggestedCoupons = [];
        $scope.relatedCoupons = [];
        $scope.filterCoupons = [];
        $scope.categories = {};

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
        };

        // apply filter for coupons array
        $scope.applyFilter = function () {
            $scope.filterCoupons = $filter("couponFilter")($scope.coupons, $scope.filter);
            $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
            $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
        };

        // open coupon popup code
        $scope.openCouponCode = function (store, item) {
            // get the Deeplink destionation URL for it
            DestionationUrl.destination_url(item.destination_url).then(function (data) {
                var output = data['data']['data']['output_url'],
                    generated_url = output ? output : item.destination_url;
                url = $state.href('main.store-info', {url: store.url, cc: item._id, destionationUrl: generated_url});
                //window.open(url,'_blank');
                $('<a href="'+url+'" target="_blank">&nbsp;</a>')[0].click();
                window.location.href = generated_url;
            }, function (error) {
                console.log(error);
            });
        };
        $("#top_banner_area").hide();
        if($stateParams['url']) {
            // get store information
            var embedded = {};
            embedded['recommended_stores'] = 1;
            embedded['related_categories'] = 1;
            embedded['related_stores'] = 1;
            var url = '/api/1.0/stores/'+$stateParams.url+'?embedded='+
                JSON.stringify(embedded)+"&number_of_clicks=1";
            StoreQuery.get(url).then(function (store) {
                console.log(store);
                if(store.data && typeof store.data === 'object') {
                    $scope.store = store.data;
                    $scope.store.related_stores = clearNullIds($scope.store.related_stores);
                    $scope.store.related_deals = clearNullIds($scope.store.related_deals);
                    $scope.store.toDayDate = new Date();
                    $scope.store.voting = Math.floor(Math.random() * (500 - 300 + 1)) + 300;

                    var obj = {
                        meta_title: $scope.store.meta_title,
                        meta_description: $scope.store.meta_description
                    };
                    SEO.seo({}, obj, '');

                    // get the suggested coupons from coupons table, from recommended stores field
                    embedded = JSON.stringify({
                        "related_categories": 1,
                        "related_stores": 1
                    });
                    var temp = {};
                    temp["recommended_stores"] = {
                        "$in": [$scope.store._id]
                    };
                    url = "/api/1.0/coupons"+"?where="+JSON.stringify(temp)+"&embedded="+embedded;
                    StoreQuery.get(url).then(function (suggested) {
                        console.log("Suggested Coupons Data: ", suggested.data._items);
                        $scope.suggestedCoupons = suggested.data._items;
                    });

                    // get the related coupons from the coupons table, with related store
                    temp = {
                        "related_stores": {
                            "$in": [$scope.store._id]
                        }
                    };
                    url = "/api/1.0/coupons"+"?where="+JSON.stringify(temp)+"&max_results=1000&embedded="+embedded;
                    console.log("url ------------------------------ ",url);
                    StoreQuery.get(url).then(function (coupons) {
                        var items = coupons.data._items;
                        $scope.store.totalCouponsLength = items.length;
                        console.log("Stores Coupons Data: ", items);
                        angular.forEach(items, function (item) {
                            // get related categories of each coupon
                            angular.forEach(item.related_categories, function (category) {
                                if(category === null) return true;
                                if(!$scope.categories[category.category_type]) {
                                    $scope.categories[category.category_type] = [];
                                    $scope.categories[category.category_type].push(category);
                                } else {
                                    var items = $filter('filter')($scope.categories[category.category_type], {_id: category._id});
                                    if(!items.length) {
                                        $scope.categories[category.category_type].push(category);
                                    }
                                }
                            });

                            if(new Date(item.expire_date) > new Date()) {
                                item._updated = new Date(item._updated);
                                if($scope.coupons.indexOf(item) === -1) {
                                    $scope.coupons.push(item);
                                    $scope.filterCoupons.push(item);
                                    $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
                                    $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
                                }
                            } else {
                                if($scope.expiredCoupons.indexOf(item) === -1) {
                                    $scope.expiredCoupons.push(item);
                                }
                            }
                        });
                    });

                    // getting related coupons from the related stores
                    angular.forEach($scope.store.related_stores, function (item) {
                        console.log("Related Stores: ", item.name, item._id);
                        temp = JSON.stringify(temp = {
                            "related_stores": {
                                "$in": [item._id]
                            }
                        });
                        var sort = "&max_results=1&sort=[('_updated', -1)]";
                        url = "/api/1.0/coupons"+"?where="+temp+sort+"&embedded="+embedded;
                        StoreQuery.get(url).then(function (related) {
                            var items = related.data._items;
                            console.log("Related Coupons: ", items);
                            angular.forEach(items, function (item) {
                                var length = $filter('filter')($scope.relatedCoupons, {_id: item._id});
                                if(!length.length) {
                                    $scope.relatedCoupons.push(item);
                                }
                            });
                        });
                    });

                    // if top stores length is zero StoreQuery to stores for fetching featured stores
                    var top_store_url = '/api/1.0/stores?where={"featured_store": true}&max_results=10';
                    StoreQuery.get(top_store_url).then(function (top_stores) {
                        console.log(top_stores);
                        if(top_stores.data['_items']) {
                            $scope.store.top_stores = top_stores.data._items;
                        }
                    }, function (error) {
                        console.log(error);
                    });


                    // get the list of deals related to selected deal brand
                    var embedded = {};
                    embedded['related_deals'] = 1;
                    embedded['deal_brands'] = 1;
                    embedded['deal_category'] = 1;
                    embedded['stores.store'] = 1;

                    where = JSON.stringify({
                        "store_temp": $scope.store._id,
                        "status": true
                    });
                    var random = new Date().getDate();
                    url = '/api/1.0/deals'+'?where='+where+'&embedded='+JSON.stringify(embedded)+'&rand_number=' + random;
                    $http({
                        url: url,
                        method: "GET"
                    }).then(function (data) {
                        if(data['data']) {
                            $scope.deals = data.data._items;
                        }
                    }, function (error) {
                        console.log(error);
                    });

                    if(!$scope.store.top_banner) {
                        // Get the top banner from banners table if no top_banner available
                        $scope.top_banner = {};
                        where = JSON.stringify({
                            "top_banner_string": 'store',
                            "expired_date": {
                                "$gte": new Date().toGMTString()
                            }
                        });
                        url = "/api/1.0/banner?where="+where;
                        StoreQuery.get(url).then(function (banner) {
                            console.log("banner Details: ", banner.data._items);
                            $scope.top_banner = banner.data._items[0];
                            $("#top_banner_area").show();
                        });
                    }

                    if (!$scope.store.side_banner) {
                        // Get the Side banner from banners table if no top_banner available
                        $scope.side_banner = {};
                        where = JSON.stringify({
                            "side_banner_string": 'store',
                            "expired_date": {
                                "$gte": new Date().toGMTString()
                            }
                        });
                        url = "/api/1.0/banner?where="+where;
                        StoreQuery.get(url).then(function (banner) {
                            console.log("Side banner Details: ", banner.data._items);
                            $scope.side_banner = banner.data._items[0];
                        });
                    }
                } else {
                    $state.go('404');
                }
            }, function (error) {
                console.log(error);
            }); // end of getting store
        } else {
            $state.go('main.home');
        }

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
                $state.go("main.store-info", {url: $stateParams['url'], cc: undefined, destionationUrl: undefined});
            });
        }
    })

    // apply filters on filters
    .filter('couponFilter', function () {
        return function (items, filter) {
            var list = [];
            if(!Object.keys(filter.category).length && !Object.keys(filter.wallet).length &&
                !Object.keys(filter.bank).length && !Object.keys(filter.city).length &&
                !Object.keys(filter.brands).length && !Object.keys(filter.festivals).length) {
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
                angular.forEach(item.related_categories, function (category) {
                    angular.forEach(filter, function (values, keys) {
                        angular.forEach(values, function (val, key) {
                            if(category && val == true && key == category._id && list.indexOf(item) == -1) {
                                list.push(item);
                            }
                        });
                    });
                });
            });
            return list;
        }
    })
    .factory("StoreQuery", function ($http, $q) {
        return {
            postFav: function (object) {
                var d = $q.defer();
                $http(object).then(function (data) {
                    d.resolve(data);
                }, function (error) {
                    d.reject(error);
                });
                return d.promise;
            },
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
    .directive('ddTextCollapse', ['$compile', '$sce', function($compile, $sce) {

        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attrs) {

                /* start collapsed */
                scope.collapsed = false;

                /* create the function to toggle the collapse */
                scope.toggle = function() {
                    scope.collapsed = !scope.collapsed;
                };

                function htmlToPlaintext(text) {
                    return text ? String(text).replace(/<[^>]+>/gm, '') : '';
                }

                /* wait for changes on the text */
                attrs.$observe('ddTextCollapseText', function(text) {

                    text = htmlToPlaintext(text);
                    /* get the length from the attributes */
                    var maxLength = scope.$eval(attrs.ddTextCollapseMaxLength);
                    if (text.length > maxLength) {
                        /* split the text in two parts, the first always showing */
                        var firstPart = String(text).substring(0, maxLength);
                        var secondPart = String(text).substring(maxLength, text.length);

                        /* create some new html elements to hold the separate info */
                        var firstSpan = $compile('<span>' + firstPart + '</span>')(scope);
                        var secondSpan = $compile('<span ng-if="collapsed">' + secondPart + '</span>')(scope);
                        var moreIndicatorSpan = $compile('<span ng-if="!collapsed">... </span>')(scope);
                        var lineBreak = $compile('<br ng-if="collapsed">')(scope);
                        var toggleButton = $compile('<span style="cursor: pointer; color: #165ba8;" class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "Show Less" : "Show More"}}</span>')(scope);

                        /* remove the current contents of the element
                         and add the new ones we created */
                        element.empty();
                        element.append(firstSpan);
                        element.append(secondSpan);
                        element.append(moreIndicatorSpan);
                        element.append(lineBreak);
                        element.append(toggleButton);
                    }
                    else {
                        element.empty();
                        element.append(text);
                    }
                });
            }
        };
    }]);
