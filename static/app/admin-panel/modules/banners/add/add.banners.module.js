angular.module("addBannersModule", ["ui.select", "ngSanitize",
    "ui.bootstrap", "toastr", "satellizer", "personFactoryModule","naif.base64", "cgBusy", "constantModule"])
    .controller("addBannersCtrl", function ($scope, $timeout, toastr, $auth, personFactory, $log, URL, $state, $http) {
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
        $scope.banner = {
            expired_date: $('#datetimepicker1').datetimepicker({
                defaultDate: new Date()
            }),
            deal_of_the_day_banner: $scope.deal_of_the_day[0].code,
            top_banner_string: $scope.selection_type[0].code,
            side_banner_string: $scope.selection_type[0].code,
            status: $scope.status[0].code
        };
        // add banner to the database
        $scope.addbanner = function (banner) {
            if(banner.image && Object.keys(banner.image).length) {
                banner.image = "data:image/jpeg;base64,"+banner.image.base64;
            } else {
                toastr.error("Please select Banner Image", "Error!");
                return false;
            }

            banner.expired_date = new Date(Date.parse($("#datetimepicker1").find("input").val())).toUTCString();
            banner.last_modified_by = $scope.user._id;
            console.log(banner);
            $http({
                url: URL.banner,
                method: "POST",
                data: banner
            }).then(function (data) {
                console.log("Success data: ", data);
                toastr.success(banner.title, "Created!");
                $state.go("header.banners");
            }, function (error) {
                console.log(error);
            });
        }
    });