angular.module("DashboardModule", ["constantModule",
    "satellizer", "toastr", "personFactoryModule", "ui.select"])
    .directive("barChart", function () {
        return {
            restrict: "E",
            scope: {
                items: "=",
                from: "@",
                id: "@"
            },
            templateUrl: "static/app/admin-panel/modules/dashboard/barchart.directive.template.html",
            controller: "barController"
        }
    })
    .controller("barController", function ($scope, $log) {
        $scope.menuTypes = [
            {code: "month", text: "Month"},
            {code: "customdate", text: "By Custom Date"}
        ];
        $scope.select = {
            by: $scope.menuTypes[0].code
        };

        $scope.morris = undefined;
        setTimeout(function () {
            $scope.morris = Morris.Bar({
                element: 'bar-example-'+$scope.id,
                data: [],
                xkey: 'y',
                ykeys: ['a'],
                labels: [$scope.from],
                xLabelMargin: 10
            });
            $scope.changeChart();
        }, 1000);

        setTimeout(function () {
            $('#to-date-id-'+$scope.id).datepicker({
                maxDate: 0,
                onSelect: function(dateText) {
                    $('#from-date-id-'+$scope.id).datepicker('option', 'maxDate', this.value );
                    $scope.changeChart();
                }
            }).datepicker('setDate', new Date());

            var toDate = new Date($('#to-date-id-'+$scope.id).datepicker( "getDate" ));
            $('#from-date-id-'+$scope.id).datepicker({
                maxDate: toDate,
                onSelect: function(dateText) {
                    $scope.changeChart();
                }
            }).datepicker('setDate', toDate.setDate(toDate.getDate() - 7));
        }, 4000);

        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf())
            dat.setDate(dat.getDate() + days);
            return dat;
        };

        function getDates(startDate, stopDate) {
            var dateArray = [];
            var currentDate = startDate;
            while (currentDate <= stopDate) {
                dateArray.push( new Date (currentDate) )
                currentDate = currentDate.addDays(1);
            }
            return dateArray;
        }

        $scope.objItems = {};
        $scope.keyValues = [];
        function generateArrays () {
            angular.forEach($scope.objItems, function (val, key) {
                $scope.keyValues.push({y: key, a: val})
            });

            // console.log("Final Key Values: ", $scope.keyValues);
            setTimeout(function () {
                $scope.morris.setData($scope.keyValues);
            }, 1000);
        }
        $scope.changeChart = function () {
            $scope.keyValues = [];
            $scope.objItems = {};
            var created = undefined,
                type = undefined,
                fromDate = new Date($("#from-date-id-"+$scope.id).val()),
                toDate = new Date($("#to-date-id-"+$scope.id).val()),
                dates = [];

            if($scope.select.by == 'customdate') {
                $scope.objItems = {};
                dates = getDates(fromDate, toDate);
                angular.forEach(dates, function (date) {
                    $scope.objItems[moment(date).format("DD/MM/YYYY")] = 0;
                })
            } else {
                angular.forEach(monthNames, function (month) {
                    $scope.objItems[month] = 0
                });
            }
            angular.forEach($scope.items, function (item) {
                var date = new Date(item._created);
                if($scope.select.by == 'month') {
                    if(date.getFullYear() == new Date().getFullYear()) {
                        created = monthNames[date.getMonth()];
                        $scope.objItems[created] = $scope.objItems[created] + 1;
                    }
                } else if ($scope.select.by == 'customdate') {
                    angular.forEach($scope.objItems, function (val, key) {
                        if(key == moment(date).format('DD/MM/YYYY')) {
                            $scope.objItems[key] ++;
                        }
                    })
                }
            });

            generateArrays($scope.select.by);
        };

    })
    .controller("dashBoardCtrl", function ($scope, mainURL, URL, $state, $auth, $http, $compile, toastr, personFactory) {

        $scope.deals = [];
        $scope.coupons = [];
        $scope.categories = [];
        $scope.persons = [];
        $scope.stores = [];

        if($auth.isAuthenticated()) {
            // get the list of coupons
            var projection = {};
            projection['name'] = 1;
            $http({
                url: "/api/1.0/coupons?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
                mathod: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.coupons = data.data._items;
                    $("#coupon").remove();

                    setTimeout(function () {
                        var el = $compile('<bar-chart id="coupon" items="coupons" from="Coupons"></bar-chart>')($scope);
                        $("#chart-area").append(el);
                    }, 400);
                }
            }, function (error) {
                console.log(error);
            });

            // get list of persons
            var projection = {};
            projection['_id'] = 1;
            $http({
                url: "/api/1.0/persons?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
                mathod: "GET",
                headers: {
                    authorization: $auth.getToken()
                }
            }).then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.persons = data.data._items;
                    $("#persons").remove();

                    setTimeout(function () {
                        var el = $compile('<bar-chart id="persons" items="persons" from="Persons"></bar-chart>')($scope);
                        $("#chart-area").append(el);
                    }, 400);
                }
            }, function (error) {
                console.log(error);
            });

            // get list of persons
            var projection = {};
            projection['name'] = 1;
            $http({
                url: "/api/1.0/deals?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
                mathod: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.deals = data.data._items;
                    $("#deals").remove();

                    setTimeout(function () {
                        var el = $compile('<bar-chart id="deals" items="deals" from="Deals"></bar-chart>')($scope);
                        $("#chart-area").append(el);
                    }, 400);
                }
            }, function (error) {
                console.log(error);
            });


            // get the list of featured stores
            var projection = {};
            projection['name'] = 1;
            $http({
                url: "/api/1.0/stores?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
                mathod: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.stores = data.data._items;
                    $("#stores").remove();

                    setTimeout(function () {
                        var el = $compile('<bar-chart id="stores" items="stores" from="Stores"></bar-chart>')($scope);
                        $("#chart-area").append(el);
                    }, 400);
                }
            }, function (error) {
                console.log(error);
            });


            // get the list of Categories
            var projection = {};
            projection['name'] = 1;
            $http({
                url: "/api/1.0/categories?projection="+JSON.stringify(projection)+"&rand_number=" + new Date().getTime(),
                mathod: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.categories = data.data._items;
                }
            }, function (error) {
                console.log(error);
            });
        }

    });