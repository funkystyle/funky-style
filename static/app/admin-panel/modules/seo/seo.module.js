angular.module("seoModule", ["ui.select", "ngSanitize",
    "ui.bootstrap", "toastr", "satellizer", "personFactoryModule", "cgBusy", "constantModule", "angular-table"])
    .controller("seoCtrl", function ($scope, $filter, $q, $timeout, toastr, $auth, personFactory, $log, URL, $state, $http) {
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
                code: "deal_brand"
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

        $scope.showForm = undefined;
        $scope.addSeo = function () {
            $scope.showForm = true;
            $scope.seo = {
                meta_title: "%%title%% Offers, Coupons, Promo Codes Deals - %%currentmonth%% %%currentyear%%",
                status: $scope.status[0].code,
                selection_type: $scope.selection_type[0],
                meta_description: "Latest %%title%% Coupons %%currentmonth%% %%currentyear%%. 100% Working Verified Promo Codes , Offers, Coupon codes, Discount Codes, Deals"
            };
        };

        // get seoDetails
        $scope.getSeoDetails();

        $scope.seoList = [];
        $scope.filterSeoList = [];
        $scope.search = {
            search: undefined
        };
        $scope.show = false;
        $scope.check = {
            all: false,
            check: {}
        };

        $scope.config = {
            itemsPerPage: 20,
            maxPages: 20,
            fillLastPage: "no"
        };

        $scope.updateFilteredList = function() {
            $scope.filterSeoList = $filter("filter")($scope.seoList, $scope.search.search);
        };

        // update seo
        $scope.updateSeo = function (seo) {
           $scope.showForm = true;
           $scope.no_seo = true;
           $scope.seo = seo;
        };

        // get the master seo details
        var embedded = {
            "last_modified_by": 1
        };
        $http({
            url: URL.master_seo+"?embedded="+JSON.stringify(embedded)+"&rand="+Math.random(),
            method: "GET"
        }).then(function (data) {
            console.log("Success SEO list data: ", data);
            if(data.data) {
                $scope.seoList = data.data._items;
                $scope.filterSeoList = data.data._items;
                angular.forEach($scope.seoList, function(item) {
                    $scope.check.check[item._id] = false;
                });
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
                if(error.data['_issues']) {
                    if(error.data._issues['selection_type']) {
                        toastr.error("Selection type must be Unique", "Error!");
                    }
                }
            });
        };

        // update seo
        $scope.update = function (seo) {

            seo.last_modified_by = $scope.user._id;
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
        };


        // check for individual check boxes
        $scope.checkBox = function(val) {
            var count = 0;
            angular.forEach($scope.check.check, function(val, key) {
                if (val) {
                    count++
                }
            });
            $scope.check.all = (count == Object.keys($scope.check.check).length) ? true : false;
            $scope.show = (count == 0) ? false : true;
            $scope.check.count = count;
        };

        // delete selected check boxes
        $scope.deleteSelected = function() {
            var deletedArray = [];
            angular.forEach($scope.check.check, function(val, key) {
                angular.forEach($scope.seoList, function(item, i) {
                    if (item._id == key && val && deletedArray.indexOf(item._id) == -1) {
                        deletedArray.push(
                            $http({
                                url: URL.master_seo+'/'+item._id+'?rand_number='+Math.random(),
                                method: "DELETE"
                            }).then(function (data) {
                                console.log(data);
                                return data;
                            }, function (error) {
                                console.log(error);
                                return error;
                            })
                        );
                    }
                });
            });

            // show success message after deleting all the banners
            $q.all(deletedArray).then(function (data) {
                toastr.success("Selected banners Deleted", "Success!");
                $state.reload();
            })

        };
    });