angular.module("addStoreModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64", "categoryFactoryModule"])
    .controller("addStoreCtrl", function($scope, $state, $timeout, toastr, storeFactory, $auth, personFactory, categoryFactory) {
        $scope.store = {
            related_coupons: [],
            related_deals: []
        };
        $scope.menuTypes = [
            {
                text: "None",
                code: "none"
            },
            {
                text: "Top Menu",
                code: 'top'
            },
            {
                text: "Bottom Menu",
                code: 'bottom'
            }
        ];
        $scope.store.menu = $scope.menuTypes[0].code;
        $scope.selected_user = {}; $scope.persons = [];
        $scope.categories = [];
        $scope.breadcrumbs = [];
        $scope.clear = function() {
            $scope.store.relatedStore = undefined;
        };
        $scope.$watch('store.name', function(newVal, oldVal) {
            if($scope.seo && $scope.seo.selection_type.indexOf('single_store') > -1) {
                $scope.store.meta_title = replaceSeo($scope.seo.meta_title, newVal);
                $scope.store.meta_description = replaceSeo($scope.seo.meta_description, newVal);
            }

            $scope.store.url = (newVal) ? newVal.replace(/\s/g, "-") +"-coupons" : undefined;
        }, true);

        // get all stores into the array
        if($auth.isAuthenticated()) {
            $scope.load = storeFactory.get().then(function (data) {
                console.log(data);
                if(data['_items']) {
                    $scope.stores = data._items;
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });

            categoryFactory.get().then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.categories = data.data._items;
                    angular.forEach($scope.categories, function (item) {
                        $scope.breadcrumbs.push({
                            name: item.name,
                            url: item.url,
                            _id: item._id
                        });
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });

            personFactory.me().then(function (data) {
                $scope.persons.push(data.data.data);
                $scope.selected_user.user = $scope.persons[0];
                $scope.store.last_modified_by = $scope.persons[0]._id;
            }, function (error) {
                console.log(error);
            });
        }

        $scope.addStore = function(store) {
            console.log(store);
            if(store.image && Object.keys(store.image).length) {
                store.image = "data:image/jpeg;base64,"+store.image.base64;
            } else {
                toastr.error("Please select store Image", "Error!");
                return false;
            }
            if(store.top_banner && Object.keys(store.top_banner).length) {
                store.top_banner = "data:image/jpeg;base64,"+store.top_banner.base64;
            }
            if(store.side_banner && Object.keys(store.side_banner).length) {
                store.side_banner = "data:image/jpeg;base64,"+store.side_banner.base64;
            }
            if(store.all_tag_image && Object.keys(store.all_tag_image).length) {
                store.all_tag_image = "data:image/jpeg;base64,"+store.all_tag_image.base64;
            }
            storeFactory.insert(store, $auth.getToken()).then(function (data) {
                console.log(data);

                toastr.success("Created", "Success!");
                $state.go("header.stores");
            }, function (error) {
                console.log(error);
                if(error != null) {
                    toastr.error(error._error.message, error._error.code);
                } else {
                    toastr.error("Getting null response from the server", "400");
                }
            })
        };
    });