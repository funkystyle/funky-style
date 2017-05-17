angular.module("updateCategoryModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr", "constantModule",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "categoryFactoryModule", "naif.base64"])
    .controller("updateCategoryCtrl", function ($scope, $state, $stateParams, $timeout,
                                                toastr, storeFactory, $auth, personFactory,
                                                categoryFactory, URL) {
        $scope.category = {};
        $scope.persons = [];
        $scope.categories = [];
        $scope.breadcrumbs = [];
        $scope.selected_user = {
            user: undefined
        };
        $scope.category_type = [
            {
                name: "Regular"
            },
            {
                name: "Bank"
            },
            {
                name: "Wallet"
            },
            {
                name:    "City"
            },
            {
                name: "Brands"
            },
            {
                name: "Festivals"
            }
        ];
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

        $scope.$watch('category.name', function(newVal, oldVal) {
            $scope.category.url = (newVal) ? newVal+"-coupons" : undefined;
        }, true);

        // get all stores into the array
        if($auth.isAuthenticated() && $stateParams['categoryId']) {
            $scope.load = storeFactory.get($auth.getToken()).then(function (data) {
                console.log(data);
                if(data['_items']) {
                    $scope.stores = data._items;
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });

            personFactory.me().then(function (data) {
                if(data['data']) {
                    $scope.persons.push(data.data.data);
                    $scope.selected_user.user = $scope.persons[0];
                    $scope.category.last_modified_by = $scope.persons[0]._id;
                }
            }, function (error) {
                console.log(error);
            });

            // get all categories
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
                        if(item._id == $stateParams.categoryId) {
                            $scope.category = item;
                        }
                    });
                }
            }, function (error) {
                console.log(error);
            });
        } else {
            $state.go('login');
        }

        // update category
        $scope.updateCategory = function (category) {
            if(typeof category.image === 'object') {
                category.image = "data:image/jpeg;base64,"+category.image.base64;
            }
            if(typeof category.top_banner === 'object') {
                category.top_banner = "data:image/jpeg;base64,"+category.top_banner.base64;
            }
            if(typeof category.side_banner === 'object') {
                category.side_banner = "data:image/jpeg;base64,"+category.side_banner.base64;
            }
            if(typeof category.alt_image === 'object') {
                category.alt_image = "data:image/jpeg;base64,"+category.alt_image.base64;
            }

            delete category._created;
            delete category._updated;
            delete category._links;

            console.log(category);

            // updating the category
            categoryFactory.update(category, $auth.getToken()).then(function (data) {
                toastr.success(category.name, "Updated!");
                $state.go("header.category");
            }, function (error) {
                console.log(error);
                toastr.error(error._error.message, error._error.code);
            });
        }
    })
    .filter('propsFilter', function() {
        return function(items, props) {
            var out = [];
            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }
            return out;
        };
    });