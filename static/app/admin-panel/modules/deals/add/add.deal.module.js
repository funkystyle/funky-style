angular.module("addDealModule", ["ui.select", "ngSanitize", "ui.bootstrap",
    "toastr", "satellizer","cgBusy", "naif.base64", "dealFactoryModule", "storeFactoryModule"])
    .controller("addDealCtrl", function($scope, $state, $timeout, toastr, $auth, dealFactory, storeFactory) {
        $scope.deal = {
            expired_date: new Date()
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
        $scope.deal.deal_type = $scope.dealTypes[0].code;

        $scope.$watch('deal.name', function(newVal, oldVal) {
            $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-")+"-deal" : undefined;
        }, true);
        // get all stores into the array
        if($auth.isAuthenticated()) {
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
        }

        // addDealBrands function
        $scope.addDeal = function (deal) {
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
                // return false;
            }

            deal.top_banner = "";
            deal.side_banner = "";
            delete deal.images;
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