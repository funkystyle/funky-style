angular.module("updateSeoModule", ["ui.select", "ngSanitize",
    "ui.bootstrap", "toastr", "satellizer", "personFactoryModule", "cgBusy", "constantModule"])
    .controller("updateSeoCtrl", function ($scope, $stateParams, $timeout, toastr, $auth,
                                           personFactory, $log, URL, $state, $http) {
        console.log("Update seo Controller!");
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
        $scope.seo = {};

        if($stateParams['id']) {
            var embedded = {
                "last_modified_by": 1
            };
            $scope.load = $http({
                url: URL.master_seo+'/'+$stateParams.id+'?embedded='+JSON.stringify(embedded)+'&rand_number='+Math.random(),
                method: "GET"
            }).then(function (data) {
                console.log(data);
                $scope.seo = data.data;
            }, function (error) {
                console.log(error);
            });
        }

        // add seo to the database
        $scope.updateSeo = function (seo) {
            seo.last_modified_by = $scope.user._id;
            delete seo._created;
            delete seo._updated;
            delete seo._links;
            console.log(seo);
            $http({
                url: URL.master_seo,
                method: "PATCH",
                headers: {
                    authorization: $scope.user.tokens.login
                },
                data: seo
            }).then(function (data) {
                console.log("Success data: ", data);
                toastr.success(seo.meta_title, "Updated!");
                $state.go("header.seo");
            }, function (error) {
                console.log(error);
            });
        }
    });