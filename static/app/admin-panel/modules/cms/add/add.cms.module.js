angular.module("addCmsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "cmsFactoryModule"])
    .controller("addCmsCtrl", function($scope, $timeout, toastr, storeFactory, $state, $stateParams,
                                        $auth, personFactory, $log, couponFactory, categoryFactory, URL, cmsFactory) {
        if($auth.isAuthenticated()) {
            $scope.cms = {};
            // add blog now
            $scope.addCms = function (cms) {
                cms.last_modified_by = $scope.user._id;
                console.log(cms);
                cmsFactory.post(cms).then(function (data) {
                    console.log(data);
                    toastr.success(cms.name+' Created', "Created!");
                    $state.go("header.cms");
                }, function (error) {
                    console.log(error);
                    if(error.data._error) {
                        toastr.error(error.data._error.message, error.data._error.code);
                    }
                });
            }
        } else {
            $state.go("login");
        }

    });