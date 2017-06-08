angular.module("updateBannersModule", ["ui.select", "ngSanitize",
    "ui.bootstrap", "toastr", "satellizer", "personFactoryModule","naif.base64", "cgBusy", "constantModule"])
    .controller("updateBannersCtrl", function ($scope, $timeout, $stateParams, toastr, $auth, personFactory, $log, URL, $state, $http) {
        console.log("Add seo Controller!");
        $scope.selection_type = [
            {
                text: "None",
                code: "none"
            },
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
                text: "All Deals",
                code: "deal"
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
        $scope.deal_of_the_day = [
            {
                text: "Site Wide",
                code: "site"
            },
            {
                text: "None",
                code: null
            }
        ];

        // get the list of banners from the banners table
        $scope.banners = [];
        $scope.banner = {};
        if($stateParams['id']) {
            $scope.load = $http({
                url: URL.banner,
                method: "GET"
            }).then(function (data) {
                $scope.banners = data.data._items;

                angular.forEach($scope.banners, function (item) {
                    if(item._id == $stateParams.id) {
                        $scope.banner = item;
                        $("#datetimepicker1").find("input").val(item.expired_date);
                    }
                });
            }, function (error) {
                console.log(error);
            });
        }
        // add banner to the database
        $scope.updateBanner = function (banner) {
            banner.last_modified_by = $scope.user._id;
            if(typeof banner.image === 'object') {
                banner.image = "data:image/jpeg;base64,"+banner.image.base64;
            }

            banner.expired_date = new Date(Date.parse($("#datetimepicker1").find("input").val())).toUTCString();

            delete banner._created;
            delete banner._updated;
            delete banner._links;

            console.log(banner);

            $http({
                url: URL.banner+'/'+banner._id+'?rand_number='+Math.random(),
                method: "PATCH",
                headers: {
                    authorization: $scope.user.tokens.login
                },
                data: banner
            }).then(function (data) {
                console.log("Success data: ", data);
                toastr.success(banner.title, "Updated!");
                $state.go("header.banners");
            }, function (error) {
                console.log(error);
            });
        }
    });