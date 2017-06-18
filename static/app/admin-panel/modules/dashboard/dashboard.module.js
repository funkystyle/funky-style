angular.module("DashboardModule", ["constantModule",
    "satellizer", "toastr", "personFactoryModule", "highCharts", "ui.select"])
    .directive("barChart", function () {
        return {
            restrict: "E",
            scope: {
                items: "=",
                from: "@"
            },
            templateUrl: "static/app/admin-panel/modules/dashboard/barchart.directive.template.html",
            controller: "barController"
        }
    })
    .controller("barController", function ($scope, $state) {
        $scope.menuTypes = [
            {code: "month", text: "Month"}, {code: "week", text: "Week"}
        ]

        $scope.showDateType = {
            month: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ],
            week: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        };

        $scope.$watch('items', function (items, oldVal) {
            angular.forEach(items, function (item) {
                console.log("Item is: ", item);
            });
        });

        var chartOptions = {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Monthly Average Rainfall'
            },
            subtitle: {
                text: 'Source: WorldClimate.com'
            },
            xAxis: {
                categories: $scope.showDateType.week,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Rainfall (mm)'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: 'Tokyo',
                data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

            }, {
                name: 'New York',
                data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

            }, {
                name: 'London',
                data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

            }, {
                name: 'Berlin',
                data: [42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4, 60.4, 47.6, 39.1, 46.8, 51.1]

            }]
        };

        Highcharts.chart('container', chartOptions);
    })
    .controller("dashBoardCtrl", function ($scope, mainURL, URL, $state, $auth, $http, toastr, personFactory) {

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