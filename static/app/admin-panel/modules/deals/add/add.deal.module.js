angular.module("addDealModule", ["ui.select", "ngSanitize", "ui.bootstrap",
    "toastr", "satellizer","cgBusy", "naif.base64", "dealFactoryModule", "storeFactoryModule", "constantModule"])
    .controller("addDealCtrl", function($scope, $state, $timeout, toastr, $auth,
                                        dealFactory, storeFactory, URL, $http) {
        $scope.deal = {
            expired_date: new Date(),
            dynamic_fields: {}
        };
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
        $scope.deal.deal_type = $scope.dealTypes[1].code;

        $scope.$watch('deal.name', function(newVal, oldVal) {
            if($scope.seo.selection_type.indexOf('single_deal') > -1) {
                $scope.deal.seo_title = $scope.seo.meta_title.replace("%%title%%", newVal).replace("%%currentmonth%%", month).replace("%%currentyear%%", year);
                $scope.deal.seo_description = $scope.seo.meta_description.replace("%%title%%", newVal).replace("%%currentmonth%%", month).replace("%%currentyear%%", year);
            }
            $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-")+"-deal" : undefined;
        }, true);
        // get all stores into the array
        if($auth.isAuthenticated()) {
            $('#datetimepicker1').datetimepicker({
                defaultDate: new Date()
            });

            var embedded = {
                "deal_brands": 1,
                "store": 1,
                "related_deals": 1,
                "deal_category": 1
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
                        item.store = (item.store)?item.store._id: undefined;
                        item.related_deals = clearNullIds(item.related_deals);
                        item.deal_category = clearNullIds(item.deal_category);
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
            $scope.load = dealFactory.get_deal_categories($auth.getToken()).then(function (data) {
                console.log(data);
                if(data) {
                    $scope.categories = data.data._items;
                }
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
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
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

        // get dynamic fields based on deal category selection
        $scope.getDynamicFields = function (item, model) {
            angular.forEach($scope.categories, function (category) {
                if(category._id == item._id) {
                    $scope.dynamicFields = item.fields;
                }
            });
        };

        $scope.removeImage = function (item) {
            var index = $scope.deal.images.indexOf(item);
            if(index > -1) {
                $scope.deal.images.splice(index, 1);
            }
        };

        // addDealBrands function
        $scope.addDeal = function (deal) {
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

                console.log(images);
                deal.images = images;
            } else {
                toastr.error("Please select Deal Image", "Error!");
                return false;
            }

            deal.top_banner = "";
            deal.side_banner = "";
            delete deal.top_banner;
            delete deal.side_banner;
            console.log(deal);
            // save this deal into table
            dealFactory.post(deal).then(function (data) {
                console.log(data);
                toastr.success(deal.name, "Created!");
                // save this deal into related_deals inside store documentp
                angular.forEach($scope.stores, function (store) {
                    if(store._id == deal.store) {
                        store.related_deals.push(data.data._id);
                        var items = store.related_deals;
                        var obj = {_id: store._id, related_deals: items};
                        storeFactory.update(obj, $auth.getToken()).then(function (storeSuccess) {
                            console.log(storeSuccess);
                            toastr.success("Updated in "+ store.name, deal.name);
                            $state.go('header.deals');
                        }, function (storeError) {
                            console.log(storeError);
                        });
                    }
                });
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });