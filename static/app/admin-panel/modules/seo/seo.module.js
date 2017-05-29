angular.module("seoModule", ["ui.select", "ngSanitize",
    "ui.bootstrap", "toastr", "satellizer", "personFactoryModule", "cgBusy", "constantModule"])
    .controller("seoCtrl", function ($scope, $timeout, toastr, $auth, personFactory, $log, URL, $state, $http) {
        console.log("Add seo Controller!");
        $scope.selection_type = [
            {
                text: "Home",
                code: "home"
            },
            {
                text: "All Categories",
                code: "category"
            },
            {
                text: "All Stores",
                code: "store"
            },
            {
                text: "Single Store",
                code: "single_store"
            },
            {
                text: "Single Category",
                code: "single_category"
            },
            {
                text: "Single Deal Category",
                code: "single_deal_category"
            },
            {
                text: "Single Deal Brand",
                code: "single_deal_brand"
            },
            {
                text: "All Deals Pages",
                code: "deal"
            },
            {
                text: "All Deal Categories",
                code: "deal_category"
            },
            {
                text: "All Deal Brands",
                code: "deal_brands"
            },
            {
                text: "Single Deal",
                code: "single_deal"
            }
        ];
        $scope.status = [
            {
                text: "Active",
                code: true
            },
            {
                text: "In Active",
                code: false
            }
        ];
        $scope.seo = {};

        $scope.seo = {
            meta_title: "%%title%% Offers, Coupons, Promo Codes Deals - %%currentmonth%% %%currentyear%%",
            status: $scope.status[0].code,
            selection_type: [$scope.selection_type[0].code],
            meta_description: "Latest %%title%% Coupons %%currentmonth%% %%currentyear%%. 100% Working Verified Promo Codes , Offers, Coupon codes, Discount Codes, Deals"
        };

        // get the master seo details
        $scope.no_seo = false;
        $http({
            url: URL.master_seo,
            method: "GET"
        }).then(function (data) {
            console.log("Success data: ", data);
            if(data.data._items.length != 0) {
                $scope.seo = data.data._items[0];
                $scope.no_seo = true;
            }
        }, function (error) {
            console.log(error);
        });

        // add seo to the database
        $scope.create = function (seo) {
            seo.last_modified_by = $scope.user._id;
            console.log(seo);
            $http({
                url: URL.master_seo,
                method: "POST",
                data: seo
            }).then(function (data) {
                console.log("Success data: ", data);
                toastr.success(seo.meta_title, "Created!");
                $state.reload();
            }, function (error) {
                console.log(error);
            });
        };

        // update seo
        $scope.update = function (seo) {
            console.log("update SEO: ", seo);

            delete seo._created;
            delete seo._updated;
            delete seo._links;


            console.log(seo);
            $http({
                url: URL.master_seo+'/'+seo._id+'?rand_number='+Math.random(),
                method: "PATCH",
                headers: {
                    authorization: $scope.user.tokens.login
                },
                data: seo
            }).then(function (data) {
                console.log(data);
                toastr.success(seo.meta_title, "Updated!");
                $state.reload();
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, error.data._error.code);
            });
        }
    });