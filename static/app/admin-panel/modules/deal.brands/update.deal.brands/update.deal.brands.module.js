angular.module("updateDealBrandsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule", "constantModule"])
    .controller("updateDealBrandsCtrl", function ($scope, $timeout, $stateParams, $state, URL, $http,
                                                  toastr, storeFactory, $auth, personFactory, dealFactory) {

        $scope.selected_user = {};
        $scope.deal = {};
        $scope.brands = [];
        $scope.persons = [];

        $scope.$watch('deal.name', function(newVal, oldVal) {
            $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-")+"-deals" : undefined;
        }, true);

        if($auth.isAuthenticated() && $stateParams['id']) {
            var embedded = {
                "related_brands": 1
            };

            var random_number = new Date().getTime();

            var url = URL.deal_brands+"?embedded="+JSON.stringify(embedded)+"&rand_number="+JSON.stringify(random_number);
            $scope.load = $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);

                if(data['data']) {
                    $scope.brands = data.data._items;
                    angular.forEach($scope.brands, function (item) {
                        console.log(item);
                        // clear null IDs from the array list
                        item.related_brands = clearNullIds(item.related_brands);
                        if(item._id == $stateParams.id) {
                            $scope.deal = item;
                        }
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });

            personFactory.me().then(function (data) {
                console.log(data);
                $scope.persons.push(data.data.data);
                $scope.selected_user.user = $scope.persons[0];
                $scope.deal.last_modified_by = $scope.persons[0]._id;
            }, function (error) {
                console.log(error);
            });
        } else {
            $state.go("login");
        }

        // addDealBrands function
        $scope.updateDealBrands = function (deal) {
            // for brand image
            if(typeof deal.image === 'object') {
                deal.image = "data:image/jpeg;base64,"+deal.image.base64;
            }

            // for an alt_image
            if(typeof deal.alt_image === 'object') {
                deal.alt_image = "data:image/jpeg;base64,"+deal.alt_image.base64;
            }
            delete deal._created;
            delete deal._updated;
            delete deal._links;

            console.log(deal);

            dealFactory.update_deal_brands(deal, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Updated", "Success!");
                $state.go("header.deal-brands");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });