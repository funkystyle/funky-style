angular.module("updateDealCategoriesModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "constantModule", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
    .controller("updateDealCategoriesCtrl", function ($scope, $stateParams, $timeout, toastr, $state,
                                                   storeFactory, $auth, personFactory, dealFactory, URL, $http) {

        $scope.selected_user = {};
        $scope.deal = {};
        $scope.categories = [];
        $scope.persons = [];

        $scope.$watch('deal.name', function(newVal, oldVal) {
            $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-")+"-deals" : undefined;
        }, true);

        if($auth.isAuthenticated() && $stateParams['id']) {
            var embedded = {
                "related_categories": 1
            };

            var random_number = new Date().getTime();

            var url = URL.deal_categories+"?embedded="+JSON.stringify(embedded)+"&rand_number="+JSON.stringify(random_number);
            $scope.load = $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);

                if(data['data']) {
                    $scope.categories = data.data._items;

                    // remove null items from array
                    angular.forEach($scope.categories, function (item) {
                        item.related_categories = clearNullIds(item.related_categories);

                        if(item._id == $stateParams.id) {
                            console.log("Deal Item: ", item);
                            $scope.deal = item;
                        }
                    })
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
        $scope.updateDealCategory = function (deal) {
            //deal.alt_image = "data:image/jpeg;base64,"+deal.image[0].base64
            deal.image = "";
            delete deal._created;
            delete deal._updated;
            delete deal._links;
            delete deal.image;
            delete deal.alt_image;

            console.log(deal);

            dealFactory.update_deal_categories(deal, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(deal.name+" Updated", "Success!");
                $state.go("header.deal-categories");
            }, function (error) {
                console.log(error);

                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });