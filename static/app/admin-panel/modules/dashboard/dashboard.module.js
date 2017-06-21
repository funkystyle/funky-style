angular.module("DashboardModule", ["constantModule",
    "satellizer", "toastr", "personFactoryModule", "ui.select", "chart.js"])
    .config(function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colors: ['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
        });
        // Configure all doughnut charts
        ChartJsProvider.setOptions('doughnut', {
            cutoutPercentage: 60
        });
        ChartJsProvider.setOptions('bar', {
            tooltips: { enabled: false }
        });
    })
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
        }, 2000);

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

        var objItems = {};
        function generateArrays () {
            angular.forEach(objItems, function (val, key) {
                $scope.labels.push(key);
                $scope.data[0].push(val);
            });
            window.dispatchEvent(new Event('resize'));
            console.log($scope.labels, $scope.data[0]);
        }
        $scope.changeChart = function () {
            $scope.labels = [];
            $scope.data = [[]];
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

            console.log(objItems);
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
                        var el = $compile('<bar-chart id="coupon" items="coupons" from="Coupons Graph"></bar-chart>')($scope);
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
                        var el = $compile('<bar-chart id="persons" items="persons" from="Persons Graph"></bar-chart>')($scope);
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
                        var el = $compile('<bar-chart id="deals" items="deals" from="Deals Graph"></bar-chart>')($scope);
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
                        var el = $compile('<bar-chart id="stores" items="stores" from="Stores Graph"></bar-chart>')($scope);
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