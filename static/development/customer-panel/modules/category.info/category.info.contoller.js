angular
    .module("categoryinfoModule", ["Directives", "satellizer", "APP"])
    .controller("categoryinfoCtrl", function ($scope, $state, $filter, $ocLazyLoad, $sce, Query, $q,
                                              $stateParams, $http, $rootScope, $compile, $auth, DestionationUrl, SEO) {
        $scope.favorites = {};
        $scope.filter = {
            store: {},
            wallet: {}
        };
        $scope.showMore = {
            all: {},
            deals: {},
            coupons: {}
        };
        $scope.params = undefined;
        $scope.search = {
            store: undefined,
            wallet: undefined
        };
        $scope.category = undefined;
        $scope.coupons = [];
        $scope.filterCoupons = [];
        $scope.expiredCoupons = [];
        $scope.categories = {};
        $scope.stores = [];
        // manageFavorite function
        $scope.manageFavorite = function (where, id) {
            var status = !$scope.favorites[id];
            if(!$auth.isAuthenticated()) {
                return true;
            }
            console.log(where, $scope.user[where], id);
            var object = {
                url: "/api/1.0/persons/"+$scope.user._id,
                method: "PATCH",
                data: {}
            };
            var index = $scope.user[where].indexOf(id);
            if(status) {
                if(index === -1) {
                    $scope.user[where].push(id);
                }
            } else {
                $scope.user[where].splice(index, 1);
            }
            object.data[where] = $scope.user[where];
            StoreQuery.postFav(object).then(function (success) {
                console.log("Success Store Favorite: ", success);
                $scope.favorites[id] = status;
            }, function (error) {
                console.log(error);
            });
        };
        $scope.trustAsHtml = function(string) {
            return $sce.trustAsHtml(string);
        };

        // apply filter for coupons array
        $scope.applyFilter = function () {
            $scope.filterCoupons = $filter("couponFilter")($scope.coupons, $scope.filter);
            $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
            $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
        };

        // open coupon popup code
        $scope.openCouponCode = function (category, item) {

            // put a request to update the no of clicks into the particular coupon document
            var url = "/api/1.0/coupons/"+item._id+"?number_of_clicks=1";
            Query.get(url);

            // get the Deeplink destionation URL for it
            DestionationUrl.destination_url(item.destination_url).then(function (data) {
                $scope.destionationUrl = data['data']['data']['output_url'];
                url = $state.href('main.categoryinfo', {url: category.url, cc: item._id, destionationUrl: $scope.destionationUrl});
                // window.open(url,'_blank');
                $('<a href="'+url+'" target="_blank">&nbsp;</a>')[0].click();
                window.location.href = $scope.destionationUrl;
            }, function (error) {
                console.log(error);
            });

        };

        if($stateParams['url']) {
            // get category information
            var where = {};
            where['url'] = $stateParams.url;

            var embedded = {};
            embedded['related_categories'] = 1;
            embedded['top_stores'] = 1;
            /*embedded['related_coupons'] = 1;
            embedded['related_coupons.related_categories'] = 1;
            embedded['related_coupons.related_stores'] = 1;*/
            
            url = '/api/1.0/categories/'+$stateParams.url+'?embedded='+JSON.stringify(embedded)+"&r="+Math.random();
            $http({
                url: url,
                method: "GET"
            }).then(function (category) {
                console.log(category);
                if(category['data']) {
                    $scope.category = category.data;
                    $scope.category.toDayDate = new Date();
                    $scope.category.voting = Math.floor(Math.random() * (500 - 300 + 1)) + 300;

                    // clear null ids for related, etc
                    $scope.category.top_stores = clearNullIds($scope.category.top_stores);
                    $scope.category.related_categories = clearNullIds($scope.category.related_categories);
                    $scope.category.top_categories = clearNullIds($scope.category.top_categories);
                    $scope.category.related_deals = clearNullIds($scope.category.related_deals);
                    $scope.category.related_coupons = clearNullIds($scope.category.related_coupons);

                    // SEO title and description
                    var obj = {
                        meta_title: $scope.category.seo_title,
                        meta_description: $scope.category.seo_description
                    };
                    SEO.seo({}, obj, '');

                    // ==================== get the list of coupons related to this category
                    var temp = {
                        "related_categories": {
                            "$in": [$scope.category._id]
                        }
                    };
                    embedded = JSON.stringify({
                        'related_stores': 1,
                        'related_categories': 1
                    });
                    url = "/api/1.0/coupons"+"?where="+JSON.stringify(temp)+"&sort=-_updated&embedded="+embedded;
                    $http.get(url).then(function (data) {
                        var items = data['data']['_items'];

                        console.log("All related Coupons Data; ", data, items);

                        angular.forEach(items, function (item) {
                            item._updated = new Date(item._updated);
                            if(new Date(item.expire_date) > new Date()) {
                                if($scope.coupons.indexOf(item) == -1) {
                                    $scope.coupons.push(item);
                                    $scope.filterCoupons.push(item);
                                    $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
                                    $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
                                }
                            }

                            // get the list of categories under particular coupons
                            angular.forEach(item.related_categories, function (category) {
                                if(category == null) return true;
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
                            // get the list of stores from the coupon store
                            angular.forEach(item.related_stores, function(rel_store) {
                                var items = $filter('filter')($scope.stores, {_id: rel_store._id});
                                if(!items.length) {
                                    $scope.stores.push(rel_store);
                                }
                            });

                            console.log($scope.stores, $scope.coupons, "categories", $scope.categories);
                        });
                    }, function (error) {
                        console.log(error);
                    });
                }

                // Get the top banner from banners table
                $scope.top_banner = {};
                var where = JSON.stringify({
                    "top_banner_string": 'category'
                });
                var url = "/api/1.0/banner?where="+where;
                Query.get(url).then(function (banner) {
                    console.log("banner Details: ", banner.data._items);
                    $scope.top_banner = banner.data._items[0];
                });
            }, function (error) {
                console.log(error);
                $state.go('404');
            });
        } else {
            $state.go('main.category');
        }

        //  ======== if stateParams having the coupon code
        if($stateParams['cc']) {
            $("coupon-info-popup").remove();
            embedded = JSON.stringify({
                'related_stores': 1,
                'related_categories': 1
            });
            url = "/api/1.0/coupons/"+$stateParams['cc']+"?embedded="+embedded+"&rand="+Math.random();
            $http.get(url).then(function (data) {
                console.log("$stateParams CC Data: ", data.data)
                $scope.couponInfo = data['data'];
                // open directive popup
                var el = $compile( "<coupon-info-popup parent='category' type='category' coupon='couponInfo'></coupon-info-popup>" )( $scope );
                $("body").append(el);
                setTimeout(function () {
                    $("#couponPopup").modal("show");
                }, 1000);
                console.log(el)
            }, function (error) {
                console.log("$stateParams CC: ", error);
                $state.go("main.categoryinfo", {cc: undefined, destionationUrl: undefined});
            });
        }
    })

    // apply filters on filters
    .filter('couponFilter', function () {
        return function (items, filter) {
            var list = [];
            if(!Object.keys(filter.store).length && !Object.keys(filter.wallet).length) {
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
                angular.forEach(filter, function (values, keys) {
                    angular.forEach(values, function (val, key) {
                        angular.forEach(item.related_stores, function (store) {
                            if(store && val == true && key == store._id && list.indexOf(item) == -1) {
                                list.push(item);
                            }
                        });
                        angular.forEach(item.related_categories, function (category) {
                            console.log("Related Category: ", category);
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