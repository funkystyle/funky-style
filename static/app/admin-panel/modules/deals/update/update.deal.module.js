angular.module("updateDealModule", ["ui.select", "ngSanitize", "ui.bootstrap",
    "toastr", "satellizer","cgBusy", "naif.base64", "dealFactoryModule", "storeFactoryModule", "constantModule"])
    .controller("updateDealCtrl", function($scope, $state, $stateParams, $timeout, toastr,
                                           $auth, dealFactory, $q, storeFactory, URL, $http) {
        $scope.deal = {};
        $scope.deals = [];
        $scope.categories = [];
        $scope.breadcrumbs = [];
        $scope.stores = [];
        $scope.clear = function() {
            $scope.store.relatedStore = undefined;
        };
        $scope.dealTypes = [
            {
                text:"Product",
                code: "product"
            },
            {
                text: "Store",
                code: "store"
            }
        ];
        // get dynamic fields based on deal category selection
        $scope.getDynamicFields = function (item, model) {
            angular.forEach($scope.categories, function (category) {
                if(category._id == item._id) {
                    $scope.dynamicFields = category.fields;


                    console.log($scope.dynamicFields)
                }
            });
        };
        $scope.$watch('deal.name', function(newVal, oldVal) {
            if(newVal && $scope.seoList.length) {
                var data = replaceSeo(newVal, $scope.seoList, 'single_deal');
                $scope.deal.seo_title = data.title;
                $scope.deal.seo_description = data.description;

                if(data.h1) {
                    $scope.deal.h1 = data.h1;
                }
                if(data.h2) {
                    $scope.deal.h2 = data.h2;
                }
            }
            $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-").toLowerCase() : undefined;
        }, true);

        $scope.oldStore = undefined;
        $scope.newStore = undefined;

        $scope.$watch("deal.store_temp", function (newVal, oldVal) {
            console.log(oldVal, newVal);
            $scope.oldStore = oldVal;
            $scope.newStore = newVal;
        });

        $scope.removeImage = function (item) {
            console.log(item, $scope.deal_images);
            var index = $scope.deal_images.indexOf(item);
            if(index > -1) {
                $scope.deal_images.splice(index, 1);
            }
        };
        $scope.removeDealImage = function (item) {
            var index = $scope.deal.images.indexOf(item);
            if(index > -1) {
                $scope.deal.images.splice(index, 1);
            }
        };
        // get all stores into the array
        if($auth.isAuthenticated() && $stateParams['id']) {
            $('#datetimepicker1').datetimepicker({
                defaultDate: new Date()
            });
            $scope.load = dealFactory.get_deal_categories($auth.getToken()).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.categories = data.data._items;
                    angular.forEach($scope.categories, function (item) {
                        $scope.breadcrumbs.push({
                            name: item.name,
                            url: item.url,
                            _id: item._id
                        });
                    });
                }

                // get the list of deals
                var embedded = {
                    "deal_brands": 1,
                    "stores.store": 1,
                    "related_deals": 1,
                    "deal_category": 1,
                    "last_modified_by": 1
                };

                var random_number = new Date().getTime();

                var url = URL.deals+"?embedded="+JSON.stringify(embedded)+"&rand_number="+JSON.stringify(random_number);

                $http({
                    url: url,
                    method: "GET"
                }).then(function (data) {
                    console.log(data);
                    if(data) {
                        $scope.deals = data.data._items;
                        angular.forEach($scope.deals, function (item) {
                            $scope.breadcrumbs.push({
                                name: item.name,
                                url: item.url,
                                _id: item._id
                            });
                            // remove null id references from array
                            item.deal_brands = clearNullIds(item.deal_brands);
                            // item.store = (item.store)?item.store._id: undefined;
                            item.related_deals = clearNullIds(item.related_deals);
                            item.deal_category = clearNullIds(item.deal_category);
                            angular.forEach(item.stores, function (sel_store, index) {
                                item.stores[index].store = (sel_store.store)?sel_store.store._id: undefined;
                            });
                            // get the selected deal for an update/view
                            if(item._id == $stateParams.id) {
                                console.log("selected deal: ", item);
                                $scope.deal = item;
                                $scope.getDynamicFields({_id: item.deal_category}, undefined);
                                $scope.productLists = ($scope.deal.stores) ? $scope.deal.stores: $scope.productLists;
                                $scope.deal_images = $scope.deal.images;
                                $scope.deal.images = [];
                                $("#datetimepicker1").find("input").val(item.expired_date);

                                console.log("Deal product details are: ", $scope.deal, "product lists are: ", $scope.productLists)
                            }
                        });
                    }
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data._error.message, "Error!");
                });
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });

            // get the list of stores
            var embedded = {};
            embedded['related_stores'] = 1;
            embedded['top_stores'] = 1;
            embedded['top_catagory_store'] = 1;
            embedded['related_coupons'] = 1;
            embedded['related_deals'] = 1;

            var random_number = new Date().getTime();

            var url = URL.stores+"?embedded="+JSON.stringify(embedded)+"&rand_number="+JSON.stringify(random_number);

            $scope.load = storeFactory.get(url).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.stores = data._items;
                    angular.forEach($scope.stores, function (item) {
                        item.related_stores = clearNullIds(item.related_stores);
                        item.top_stores = clearNullIds(item.top_stores);
                        item.top_catagory_store = clearNullIds(item.top_catagory_store);
                        item.related_coupons = clearNullIds(item.related_coupons);
                        item.related_deals = clearNullIds(item.related_deals);
                    });
                }
            }, function (error) {
                console.log(error);
            });
            $scope.load = dealFactory.get_deal_brands($auth.getToken()).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.brands = data.data._items;
                    angular.forEach($scope.brands, function (item) {
                        $scope.breadcrumbs.push({
                            name: item.name,
                            url: item.url,
                            _id: item._id
                        });
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        } else {
            $state.go("login");
        }

        $scope.productLists = [
            {
                store: undefined,
                actual_price: undefined,
                discount_price: undefined
            }
        ];

        $scope.addOneMore = function () {
            $scope.productLists.push({
                store: undefined,
                actual_price: undefined,
                discount_price: undefined
            });
        };

        // update deal category for site map related
        function dealCategoryService(deal) {
            dealFactory.update_deal_categories(deal, $auth.getToken());
        }

        // update deal category for site map related
        function dealBrandService(deal) {
            dealFactory.update_deal_brands(deal, $auth.getToken());
        }

        // addDealBrands function
        $scope.updateDeal = function (deal) {
            deal.last_modified_by = $scope.user._id;

            // if product selected as deal_type
            if(deal.deal_type == 'product') {
                deal.stores = $scope.productLists;
            }

            deal.expired_date = new Date(Date.parse($("#datetimepicker1").find("input").val())).toUTCString();

            if(Array.isArray(deal.images)) {
                var images = [];
                angular.forEach(deal.images, function (item) {
                    images.push("data:image/jpeg;base64,"+item.base64);
                });
                angular.forEach($scope.deal_images, function (item) {
                   images.push(item);
                });
                console.log(images);
                deal.images = images;
            } else {
                toastr.error("Please select Deal Image", "Error!");
                return false;
            }
            delete deal._created;
            delete deal._updated;
            delete deal.store;
            delete deal._links;
            console.log(deal);

            var storeItems = [];

            function storeService(obj) {
                storeItems.push(
                    storeFactory.update(obj, $auth.getToken()).then(function (storeSuccess) {
                        console.log(storeSuccess);
                        return storeSuccess;
                    }, function (error) {
                        console.log(error);
                    })
                );
            }

            // update ths store with this deal
            function updateStore(store) {
                var obj = {};
                obj._id = store._id;
                obj.related_deals = store.related_deals;
                storeService(obj);
            }

            console.log($scope.productLists);

            // update store for if product lists we have
            angular.forEach($scope.productLists, function (product) {
                updateStore({_id: product.store});
            });
            
            
            // update this deal for the selected store
            if($scope.newStore != $scope.oldStore) {
                angular.forEach($scope.stores, function(storeItem) {
                    var deals = undefined;
                    if(storeItem._id == $scope.oldStore) {
                        storeItem.related_deals = _.filter(storeItem.related_deals, function(o) { return o !== deal._id; });
                        storeItem.related_deals = _.uniq(storeItem.related_deals);
                        updateStore(storeItem)
                    }
                    if(storeItem._id == $scope.newStore) {
                        storeItem.related_deals = _.uniq(storeItem.related_deals);
                        var index = storeItem.related_deals.indexOf(deal._id);
                        if(index == -1) {
                            storeItem.related_deals.push(deal._id);
                            updateStore(storeItem);
                        }
                    }
                })
            } else {
                updateStore({_id: $scope.deal.store});
            }


            // call update deal category or brand from here
            angular.forEach($scope.deal.deal_category, function (cat) {
                dealCategoryService({_id: cat});
            });
            angular.forEach($scope.deal.deal_brands, function (cat) {
                dealBrandService({_id: cat});
            });

            // after done withstoreItems
            $q.all(storeItems).then(function() {
                dealFactory.update(deal, $auth.getToken()).then(function (data) {
                    console.log(data);
                    toastr.success(deal.name+" Updated", "Success!");
                    $state.go("header.deals");
                }, function (error) {
                    console.log(error);

                    toastr.error(error.data._error.message, error.data._error.code);
                });
            })
        }
    });