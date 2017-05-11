angular.module("categoryModule", ["categoryFactoryModule"])
    .controller("categoryCtrl", function($scope, categoryFactory) {
        console.log("category controller");

        $scope.sorting = {
            sorting: "ALL"
        };
        $scope.categories = [];

        // set sort key for get array from object
        $scope.setSortkey = function(key, val) {
            if (val.array.length) {
                $scope.sorting.sorting = key;
            }
        };
        $scope.categoryAlphabet = {
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

        // get all categories
        categoryFactory.get().then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.categories = data.data._items;
                $scope.categoryAlphabet['ALL']['array'] = $scope.categories;
                angular.forEach($scope.categories, function(item) {
                    var key = item.name.charAt(0).toUpperCase();
                    if (parseInt(item.name.charAt(0))) {
                        if ($scope.categoryAlphabet['#'].array.indexOf(item) == -1) {
                            $scope.categoryAlphabet["#"].enable = true;
                            $scope.categoryAlphabet["#"].array.push(item);
                        }
                    } else {
                        if ($scope.categoryAlphabet[key].array.indexOf(item) == -1) {
                            $scope.categoryAlphabet[key].enable = true;
                            $scope.categoryAlphabet[key].array.push(item);
                        }
                    }
                });
            }
        }, function (error) {
            console.log(error);
        });
    });