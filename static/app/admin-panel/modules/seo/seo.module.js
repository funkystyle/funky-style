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
        $scope.seo = {
            status: $scope.status[0].code,
            selection_type: [$scope.selection_type[0].code]
        };
        // add seo to the database
        $scope.addSeo = function (seo) {
            seo.last_modified_by = $scope.user._id;
            console.log(seo);
            $http({
                url: URL.master_seo,
                method: "POST",
                data: seo
            }).then(function (data) {
                console.log("Success data: ", data);
                toastr.success(seo.meta_title, "Created!");
                $state.go("header.seo");
            }, function (error) {
                console.log(error);
            });
        }
    });