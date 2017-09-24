angular.module("addDealBrandsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr", "constantModule",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
    .controller("addDealBrandsCtrl", function ($scope, $state, $stateParams, $timeout, toastr, $http,
                                               storeFactory, $auth, personFactory, dealFactory, URL) {
        $scope.selected_user = {};
        $scope.deal = {};
        $scope.brands = [];
        $scope.persons = [];

        $scope.$watch('deal.name', function(newVal, oldVal) {
            if(newVal && $scope.seoList.length) {
                var data = replaceSeo(newVal, $scope.seoList, 'single_deal_brand');
                $scope.deal.seo_title = data.title;
                $scope.deal.seo_description = data.description;

                $scope.deal.h1 = data.h1;
                $scope.deal.h2 = data.h2;

                console.log(data)
            }
            $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-").toLowerCase()+"-deals" : undefined;
        }, true);

        if($auth.isAuthenticated()) {
            // get the list of deal brands
            $scope.load = dealFactory.get_deal_brands().then(function (data) {
                console.log(data);

                if(data['data']) {
                    $scope.brands = data.data._items;

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
        $scope.addDealBrands = function (deal) {
            if(deal.image && Object.keys(deal.image).length) {
                deal.image = "data:image/jpeg;base64,"+deal.image.base64;
            } else {
                toastr.error("Please select Brand Image", "Error!");
                return false;
            }

            // for an alt_image
            if(deal.alt_image && Object.keys(deal.alt_image).length) {
                deal.alt_image = "data:image/jpeg;base64,"+deal.alt_image.base64;
            }


            console.log(deal);

            dealFactory.post_deal_brands(deal).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Created", "Success!");
                $state.go("header.deal-brands");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });