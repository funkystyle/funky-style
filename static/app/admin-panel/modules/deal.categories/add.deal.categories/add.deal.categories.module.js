angular.module("addDealCategoriesModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
.controller("addDealCategoriesCtrl", function ($scope, $timeout, toastr, $state,
                                               storeFactory, $auth, personFactory, dealFactory) {
    $scope.selected_user = {};
    $scope.deal = {};
    $scope.persons = [];

    if($auth.isAuthenticated()) {
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

    $scope.$watch('deal.name', function(newVal, oldVal) {
        $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-")+"-coupons" : undefined;
    }, true);

    $scope.removeImage = function (item) {
        if($scope.deal.image.length) {
            angular.forEach($scope.deal.image, function(image, index) {
                if(image.base64 == item.base64) {
                    $scope.deal.image.splice(index, 1);
                }
            })
        }
    }

    $scope.$watch('deal.name', function(newVal, oldVal) {
        $scope.deal.url = (newVal) ? newVal+"-coupons" : undefined;
    }, true);

    // addDealBrands function
    $scope.addDealCategory = function (deal) {
        if(Array.isArray(deal.image)) {
            var images = [];
            angular.forEach(deal.image, function (item) {
                images.push("data:image/jpeg;base64,"+item.base64);
            });

            console.log(images);
            deal.image = images;

            $scope.images = images;
        } else {
            toastr.error("Please select Deal Image", "Error!");
            // return false;
        }
        delete deal.image;
        delete deal.alt_image;
        console.log(deal);
        dealFactory.post_deal_categories(deal).then(function (data) {
            console.log(data);
            toastr.success(deal.name+" Created", "Success!");
            $state.go("header.deal-categories");
        }, function (error) {
            console.log(error);

            toastr.error(error.data._error.message, error.data._error.code);
        });
    }
});