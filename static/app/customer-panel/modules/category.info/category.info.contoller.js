angular
    .module("categoryinfoModule", ["categoryFactoryModule",
        "storeServiceModule", "couponFactoryModule", "Directives", "satellizer"])
    .controller("categoryinfoCtrl", function ($scope, $state, $filter, $ocLazyLoad, $sce, Query, $q,
                                              $stateParams, $http, $rootScope, $compile, $auth) {
        $scope.favorite = {
            favorite: false
        };
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
        $scope.manageFavorite = function () {
            $scope.favorite.favorite = !$scope.favorite.favorite;
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

            url = $state.href('main.categoryinfo', {url: category.url, cc: item._id});
            window.open(url,'_blank');
        };

        if($stateParams['url']) {
            var embedded = {};
            embedded['related_categories'] = 1;
            embedded['top_stores'] = 1;
            embedded['related_coupons'] = 1;
            embedded['related_coupons.related_categories'] = 1;
            embedded['related_coupons.related_stores'] = 1;
            
            url = '/api/1.0/categories/'+$stateParams.url+'?embedded='+JSON.stringify(embedded)+"&number_of_clicks=1&r="+Math.random();
            $http({
                url: url,
                method: "GET"
            }).then(function (category) {
                console.log(category);
                if(category['data']) {
                    if(category.data) {
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
                        $rootScope.pageTitle = $scope.category.seo_title;
                        $rootScope.pageDescription = $scope.category.seo_description;

                        console.log("Final Category details: ", $scope.category);

                        var qItems = [];
                        
                        angular.forEach($scope.category.related_coupons, function (item) {
                            item._updated = new Date(item._updated);
                            if(new Date(item.expire_date) > new Date()) {
                                if($scope.coupons.indexOf(item) == -1) {
                                    $scope.coupons.push(item);
                                    $scope.filterCoupons.push(item);
                                    $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
                                    $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});

                                    // get the Coupon comments
                                    var embedded = JSON.stringify({
                                        "user":1
                                    });
                                    temp = JSON.stringify({
                                        "coupon": item._id,
                                        "status": true
                                    });
                                    url = "/api/1.0/coupons_comments?embedded="+embedded+"&where="+temp;
                                    qItems.push(Query.get(url).then(function (comment) {
                                        console.log(comment.data._items);
                                        return comment;
                                    }));
                                }
                            }
                        });

                        // after getting all the coupons comments
                        $q.all(qItems).then(function (fComments) {
                            console.log("Comments Are: ", fComments, "Coupons: ", $scope.coupons);
                            var comments = [];
                            // push comments to coupons document
                            angular.forEach(fComments, function (fComment) {
                                angular.forEach(fComment.data._items, function (com) {
                                    comments.push(com);
                                });
                            });
                            // push comments items into coupon obj
                            angular.forEach($scope.coupons, function (item) {
                                item['comments'] = [];
                                angular.forEach(comments, function (comment) {
                                    comment._created = new Date(comment._created);
                                    if(comment.coupon == item._id) {
                                        item.comments.push(comment);
                                    }
                                });
                            });
                            $scope.filterComments = angular.copy($scope.coupons);
                        });

                        angular.forEach($scope.coupons, function (item) {
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
                        });


                        console.log($scope.stores, $scope.coupons, "categories", $scope.categories);
                    } else {
                        $state.go('404');
                    }
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
            });
        } else {
            $state.go('main.category');
        }

        // oepn comment section
        $scope.openComment = function (item) {
            console.log("Comment Coupon Item: ", item);
            $("comments").remove();
            if($auth.isAuthenticated()) {
                $scope.info = {
                    item: item,
                    token: $auth.getToken()
                };
                // open directive popup
                var el = $compile( "<comments info='info'></comments>" )( $scope );
                $("body").append(el);
                setTimeout(function () {
                    $("#commentPopup").modal("show");
                }, 1000);
                console.log(el)
            }
        };

        // oepn Report section
        $scope.openReport = function (item) {
            console.log("Report Coupon Item: ", item);
            $("reports").remove();
            if($auth.isAuthenticated()) {
                $scope.info = {
                    item: item,
                    token: $auth.getToken()
                };
                // open directive popup
                var el = $compile( "<reports info='info'></reports>" )( $scope );
                $("body").append(el);
                setTimeout(function () {
                    $("#reportPopup").modal("show");
                }, 1000);
                console.log(el)
            } else {
                $state.go('main.login');
            }
        };

        //  ======== if stateParams having the coupon code
        if($stateParams['cc']) {
            $("coupon-info-popup").remove();
            $scope.$watch('coupons', function (newVal, oldVal) {
                console.log(newVal, oldVal);
                if(newVal) {
                    angular.forEach(newVal, function (item) {
                        if(item._id == $stateParams.cc) {
                            $scope.couponInfo = item;

                            // open directive popup
                            var el = $compile( "<coupon-info-popup parent='category' type='category' coupon='couponInfo'></coupon-info-popup>" )( $scope );
                            $("body").append(el);
                            setTimeout(function () {
                                $("#couponPopup").modal("show");
                            }, 1000);
                            console.log(el)
                        }
                    });
                }
            }, true);
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
    });