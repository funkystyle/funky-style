angular.module("updateDealModule", ["ui.select", "ngSanitize", "ui.bootstrap",
    "toastr", "satellizer","cgBusy", "naif.base64", "dealFactoryModule", "storeFactoryModule"])
    .controller("updateDealCtrl", function($scope, $state, $stateParams, $timeout, toastr, $auth, dealFactory, $q, storeFactory) {
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
            $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-")+"-deal" : undefined;
        }, true);

        $scope.oldStore = undefined;
        $scope.newStore = undefined;
    
        $scope.$watch("deal.store", function (newVal, oldVal) {
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
                }
                // get the list of deals
                dealFactory.get().then(function (data) {
                    console.log(data);
                    if(data) {
                        $scope.deals = data.data._items;
                        angular.forEach($scope.deals, function (item) {
                            $scope.breadcrumbs.push({
                                name: item.name,
                                url: item.url,
                                _id: item._id
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

                                console.log("product lists are: ", $scope.productLists)
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
            $scope.load = storeFactory.get().then(function (data) {
                console.log(data);
                if(data) {
                    $scope.stores = data._items;
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
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
        // addDealBrands function
        $scope.updateDeal = function (deal) {

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
            delete deal._links;
            console.log(deal);

            var storeItems = [];
            // update ths store with this deal
            function updateStore(store) {
                var obj = {};
                obj._id = store._id;
                obj.related_deals = store.related_deals;
                storeItems.push(
                    storeFactory.update(obj, $auth.getToken()).then(function (storeSuccess) {
                        console.log(storeSuccess);
                        return storeSuccess;
                    }, function (error) {
                        console.log(error);
                    })
                );
            };
            
            
            // update this deal for the selected store
            if($scope.newStore != $scope.oldStore) {
                angular.forEach($scope.stores, function(storeItem) {
                    var deals = undefined;
                    if(storeItem._id == $scope.oldStore) {
                        var index = storeItem.related_deals.indexOf(deal._id);
                        if(index > -1) {
                            storeItem.related_deals.splice(index, 1);
                            storeItem.related_deals;
                            updateStore(storeItem);
                        }
                    }
                    if(storeItem._id == $scope.newStore) {
                        var index = storeItem.related_deals.indexOf($scope.newStore);
                        if(index == -1) {
                            storeItem.related_deals.push(deal._id);
                            deals = storeItem.related_deals;
                            updateStore(storeItem);
                        }
                    }
                })
            }
            
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