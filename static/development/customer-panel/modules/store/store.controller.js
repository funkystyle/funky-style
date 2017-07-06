angular
    .module("storeModule", ["storeServiceModule"])
    .controller("storeCtrl", function($scope, storeFactory, SEO, $rootScope) {
        $scope.sorting = {
            sorting: "ALL"
        };
        $scope.stores = [];

        // set sort key for get array from object
        $scope.setSortkey = function(key, val) {
            if (val.array.length) {
                $scope.sorting.sorting = key;
            }
        };
        $scope.storeAlphabet = {
            "ALL": { enable: false, array: [] },
            "#": { enable: false, array: [] },
            "A": { enable: false, array: [] },
            "B": { enable: false, array: [] },
            "C": { enable: false, array: [] },
            "D": { enable: false, array: [] },
            "E": { enable: false, array: [] },
            "F": { enable: false, array: [] },
            "G": { enable: false, array: [] },
            "H": { enable: false, array: [] },
            "I": { enable: false, array: [] },
            "J": { enable: false, array: [] },
            "K": { enable: false, array: [] },
            "L": { enable: false, array: [] },
            "M": { enable: false, array: [] },
            "N": { enable: false, array: [] },
            "O": { enable: false, array: [] },
            "P": { enable: false, array: [] },
            "Q": { enable: false, array: [] },
            "R": { enable: false, array: [] },
            "S": { enable: false, array: [] },
            "T": { enable: false, array: [] },
            "U": { enable: false, array: [] },
            "V": { enable: false, array: [] },
            "W": { enable: false, array: [] },
            "X": { enable: false, array: [] },
            "Y": { enable: false, array: [] },
            "Z": { enable: false, array: [] }
        };

        // get all the stores
        var url = "/api/1.0/stores";
        storeFactory.get(url, undefined).then(function (data) {
            console.log(data);
            if(data['_items']) {
                $scope.stores = data._items;
                $scope.storeAlphabet['ALL']['array'] = $scope.stores;
                angular.forEach($scope.stores, function(item) {
                    if (parseInt(item.name.charAt(0))) {
                        if ($scope.storeAlphabet['#'].array.indexOf(item) == -1) {
                            $scope.storeAlphabet["#"].enable = true;
                            $scope.storeAlphabet["#"].array.push(item);
                        }
                    } else {
                        var key = item.name.charAt(0).toUpperCase();
                        if ($scope.storeAlphabet[key].array.indexOf(item) == -1) {
                            $scope.storeAlphabet[key].enable = true;
                            $scope.storeAlphabet[key].array.push(item);
                        }
                    }
                });
            }
        }, function (error) {
            console.log(error);
        });


        // get the list of SEO
        SEO.getSEO().then(function (data) {
            angular.forEach(data, function (item) {
                if(item.selection_type.code == 'store') {
                    var data = SEO.seo("", item, 'store');
                    $rootScope.pageTitle = data.title;
                    $rootScope.pageDescription = data.description;
                }
            });
        });
    });