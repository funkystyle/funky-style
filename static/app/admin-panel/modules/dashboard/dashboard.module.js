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
    .controller("barController", function ($scope, $state) {
        $scope.menuTypes = [
            {code: "month", text: "Month"},
            {code: "customdate", text: "By Custom Date"}
        ];
        $scope.select = {
            by: $scope.menuTypes[0].code
        };

        var morris = undefined;
        setTimeout(function () {
            morris = Morris.Bar({
                element: 'bar-example-'+$scope.id,
                data: [],
                xkey: 'y',
                ykeys: ['a'],
                labels: [$scope.from],
                xLabelMargin: 10
            });
        }, 1000);

        setTimeout(function () {
            $('#to-date-id-'+$scope.id).datepicker({
                maxDate: 0,
                onSelect: function(dateText) {
                    $('#from-date-id-'+$scope.id).datepicker('option', 'maxDate', this.value );
                    console.log("Selected date: " + dateText + "; input's current value: " + this.value);
                    $scope.changeChart();
                }
            }).datepicker('setDate', new Date());

            var toDate = new Date($('#to-date-id-'+$scope.id).datepicker( "getDate" ));
            $('#from-date-id-'+$scope.id).datepicker({
                maxDate: toDate,
                onSelect: function(dateText) {
                    console.log("Selected date: " + dateText + "; input's current value: " + this.value);
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
            var dateArray = new Array();
            var currentDate = startDate;
            while (currentDate <= stopDate) {
                dateArray.push( new Date (currentDate) )
                currentDate = currentDate.addDays(1);
            }
            return dateArray;
        }

        var objItems = {},
            keyValues = [];
        function generateArrays () {
            angular.forEach(objItems, function (val, key) {
                keyValues.push({y: key, a: val})
            });

            console.log("Final Key Values: ", keyValues);
            setTimeout(function () {
                morris.setData(keyValues);
            }, 1000);
        }
        $scope.changeChart = function () {
            keyValues = [];
            objItems = {};
            var created = undefined,
                type = undefined,
                fromDate = new Date($("#from-date-id-"+$scope.id).val()),
                toDate = new Date($("#to-date-id-"+$scope.id).val()),
                dates = [];

            if($scope.select.by == 'customdate') {
                objItems = {};
                dates = getDates(fromDate, toDate);
                angular.forEach(dates, function (date) {
                    objItems[moment(date).format("DD/MM/YYYY")] = 0;
                })
            } else {
                angular.forEach(monthNames, function (month) {
                    objItems[month] = 0
                });
            }
            angular.forEach($scope.items, function (item) {
                var date = new Date(item._created);
                if($scope.select.by == 'month') {
                    created = monthNames[date.getMonth()];
                    objItems[created] = objItems[created] + 1;
                } else if ($scope.select.by == 'customdate') {
                    if(objItems[moment(date).format('DD/MM/YYYY')]) {
                        objItems[moment(date).format('DD/MM/YYYY')] = objItems[moment(date).format('DD/MM/YYYY')] + 1;
                    }
                }
            });

            console.log("objItems: ", objItems);
            generateArrays($scope.select.by);
        };

        $scope.changeChart();

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