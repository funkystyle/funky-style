angular
    .module("storeinfoModule", ["categoryFactoryModule", "Directives", "satellizer"])
    .controller("storeinfoController", function ($scope, $stateParams, $http, $state, $auth,
                                                 categoryFactory, $filter, $sce, $ocLazyLoad,
                                                 $rootScope, $compile, Query, $q) {
        $scope.favorite = {
            favorite: false
        };
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

        // comment now
        $scope.commentNow = function (item) {
            $scope.comment.store = item.related_stores[0];
        };

        // manageFavorite function
        $scope.manageFavorite = function () {
            $scope.favorite.favorite = !$scope.favorite.favorite;
        };

        // apply filter for coupons array
        $scope.applyFilter = function () {
            $scope.filterCoupons = $filter("couponFilter")($scope.coupons, $scope.filter);
            $scope.dealsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'offer'});
            $scope.couponsLength = $filter('filter')($scope.filterCoupons, {coupon_type: 'coupon'});
        };

        // open coupon popup code
        $scope.openCouponCode = function (store, item) {
            // put a request to update the no of clicks into the particular coupon document
            var url = "/api/1.0/coupons/"+item._id+"?number_of_clicks=1";
            Query.get(url);

            if(store.store_url) {
                setTimeout(function () {
                    window.location.href = store.store_url;
                }, 500);
            }

            url = $state.href('main.store-info', {url: store.url, cc: item._id});
            window.open(url,'_blank');
        };

        if($stateParams['url']) {
            var embedded = {};
            embedded['recommended_stores'] = 1;
            embedded['related_categories'] = 1;
            embedded['top_stores'] = 1;
            embedded['related_stores'] = 1;
            embedded['related_deals'] = 1;

            var url = '/api/1.0/stores/'+$stateParams.url+'?embedded='+
                JSON.stringify(embedded)+"&number_of_clicks=1";
            Query.get(url).then(function (store) {
                console.log(store)
                if(store.data) {
                    if(!store.data) {
                        $state.go('404');
                    }
                    $scope.store = store.data;
                    $scope.store.toDayDate = new Date();
                    $scope.store.voting = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
                    $rootScope.pageTitle = $scope.store.meta_title;
                    $rootScope.pageDescription = $scope.store.meta_description;
                    console.log($scope.store);

                    // get the suggested coupons from coupons table, from recommended stores field
                    embedded = {
                        "related_categories": 1,
                        "related_stores": 1
                    };
                    embedded = JSON.stringify(embedded);
                    var temp = {};
                    temp["recommended_stores"] = {
                        "$in": [$scope.store._id]
                    };
                    url = "/api/1.0/coupons"+"?where="+JSON.stringify(temp)+"&embedded="+embedded;
                    Query.get(url).then(function (suggested) {
                        console.log("Suggested Coupons Data: ", suggested.data._items);
                        $scope.suggestedCoupons = suggested.data._items;
                    });

                    // get the related coupons from the coupons table, with related store
                    temp = {
                        "related_stores": {
                            "$in": [$scope.store._id]
                        }
                    };
                    url = "/api/1.0/coupons"+"?where="+JSON.stringify(temp)+"&embedded="+embedded;
                    Query.get(url).then(function (coupons) {
                        var items = coupons.data._items,
                            qItems = [];
                        console.log("Stores Coupons Data: ", items);
                        angular.forEach(items, function (item) {
                            // get related categories of each coupon
                            angular.forEach(item.related_categories, function (category) {
                                console.log("Related Category: ", category);
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

                            if(new Date(item.expire_date) > new Date()) {
                                item._updated = new Date(item._updated);
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
                            } else {
                                if($scope.expiredCoupons.indexOf(item) == -1) {
                                    $scope.expiredCoupons.push(item);
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
                        Query.get(url).then(function (related) {
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

                    // if top stores length is zero query to stores for fetching featured stores
                    if($scope.store.top_stores.length == 0) {
                        var top_store_url = '/api/1.0/stores?where={"featured_store": true}&max_results=2';
                        Query.get(top_store_url).then(function (top_stores) {
                            console.log(top_stores);
                            if(top_stores.data['_items']) {
                                $scope.store.top_stores = top_stores.data._items;

                                angular.forEach($scope.store.related_stores, function (related_store) {
                                    angular.forEach($scope.store.top_stores, function (item, index) {
                                        if(item._id == related_store._id) {
                                            $scope.store.top_stores.splice(index, 1);
                                        }
                                    })
                                });
                            }
                        }, function (error) {
                            console.log(error);
                        })
                    }
                    console.log("Final categories are ", $scope.categories);

                    console.log($scope.expiredCoupons, $scope.coupons, "suggested coupons ", $scope.suggestedCoupons, "Related coupons ", $scope.relatedCoupons);
                }
            }, function (error) {
                console.log(error);
            }); // end of getting store

            // Get the top banner from banners table
            $scope.top_banner = {};
            var where = JSON.stringify({
                "top_banner_string": 'store'
            });
            var url = "/api/1.0/banner?where="+where;
            Query.get(url).then(function (banner) {
                console.log("banner Details: ", banner.data._items);
                $scope.top_banner = banner.data._items[0];
            });
        } else {
            $state.go('main.home');
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
            } else {
                $state.go('main.login');
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
                            var el = $compile( "<coupon-info-popup parent='store' type='store' coupon='couponInfo'></coupon-info-popup>" )( $scope );
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