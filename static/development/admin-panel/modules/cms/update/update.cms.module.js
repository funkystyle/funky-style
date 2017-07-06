angular.module("updateCmsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "cmsFactoryModule"])
    .controller("updateCmsCtrl", function($scope, $timeout, toastr, storeFactory, $state, $stateParams,
                                       $auth, personFactory, $log, couponFactory, categoryFactory, URL, cmsFactory) {
        if($auth.isAuthenticated() && $stateParams['id']) {
            $scope.cms = {};

            // get all CMS
            cmsFactory.get().then(function (data) {
                console.log(data);
                if(data['data']) {
                    var items = data.data._items;
                    angular.forEach(items, function (item) {
                        if(item._id == $stateParams.id) {
                            $scope.cms = item;
                        }
                    });
                }
            }, function (error) {
                console.log(error);
            });

            // add blog now
            $scope.updateCms = function (cms) {
                delete cms._created;
                delete cms._updated;
                delete cms._links;

                console.log(cms);
                cmsFactory.update(cms, $auth.getToken()).then(function (data) {
                    console.log(data);
                    toastr.success(cms.name+" Updated!", "Success");
                    $state.go("header.cms");
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data._error.message, error.data._error.code);
                });
            }
        } else {
            $state.go("login");
        }

    });