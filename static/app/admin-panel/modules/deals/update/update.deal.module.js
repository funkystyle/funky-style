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

        // get all stores into the array
        if($auth.isAuthenticated() && $stateParams['id']) {
            $('#datetimepicker1').datetimepicker({
                defaultDate: new Date()
            });
            $scope.load = dealFactory.get().then(function (data) {
                console.log(data);
                if(data) {
                    $scope.deals = data.data._items;
                    angular.forEach($scope.deals, function (item) {
                        $scope.breadcrumbs.push({
                            name: item.name,
                            url: item.url,
                            _id: item._id
                        });
                        if(item._id == $stateParams.id) {
                            console.log(item);
                            $scope.deal = item;
                            
                            $("#datetimepicker1").find("input").val(item.expired_date);
                        }
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
    
        
        // addDealBrands function
        $scope.updateDeal = function (deal) {
            deal.expired_date = new Date(Date.parse($("#datetimepicker1").find("input").val())).toUTCString();

            delete deal.images;
            delete deal.top_banner;
            delete deal.side_banner;
            
            
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
                }, function (error) {
                    console.log(error);

                    toastr.error(error.data._error.message, error.data._error.code);
                });
            })
        }
    });