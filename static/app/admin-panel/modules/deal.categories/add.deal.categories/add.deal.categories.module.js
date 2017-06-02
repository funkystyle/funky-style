angular.module("addDealCategoriesModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "dealFactoryModule"])
.controller("addDealCategoriesCtrl", function ($scope, $timeout, toastr, $state,
                                               storeFactory, $auth, personFactory, dealFactory) {
    $scope.selected_user = {};
    $scope.deal = {};
    $scope.persons = [];
    $scope.categories = [];

    if($auth.isAuthenticated()) {
        // get the list of deals categories
        dealFactory.get_deal_categories().then(function (data) {
            console.log("Deal categories: ", data);
            if(data.data) {
                $scope.categories = data.data._items;
            }
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

    $scope.$watch('deal.name', function(newVal, oldVal) {
        if(newVal && $scope.seoList.length) {
            var data = replaceSeo(newVal, $scope.seoList, 'single_deal_category');
            $scope.deal.seo_title = data.title;
            $scope.deal.seo_description = data.description;
        }
        $scope.deal.url = (newVal) ? newVal.replace(/\s/g, "-")+"-deals" : undefined;
    }, true);


    // addDealBrands function
    $scope.addDealCategory = function (deal) {
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