angular.module("couponModule", ['constantModule', 'toastr', 'cgBusy', 'satellizer', 'ui.select', 'couponFactoryModule'
    , 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection'])
    .controller("couponCtrl", function($scope, $filter, toastr, $http, $q,
                                       mainURL, URL, $state, $stateParams, $auth, couponFactory, $log) {
        $scope.coupons = [];
        var storeHeaderTemplate = '<div style="width: 100%;" class="ui-grid-column-menu-button">' +
            '<label style="float: left;">Store</label>' +
            '<i style="cursor: pointer; float: right;" class="ui-grid-icon-angle-down" aria-hidden="true">&nbsp;</i>' +
            '</div>';
        $scope.gridOptions = {
            data: [],
            enableRowSelection: true,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            enablePaginationControls: true,
            paginationPageSize: 25,
            showGridFooter:true,
            rowHeight: 35,
            columnDefs: [
                {
                    field: 'title', displayName: "Title", width: "25%",
                    cellTemplate: '<div class="coupon-name" style="padding: 5px;">' +
                    '<p>{{ row.entity.title }}</p>' +
                    '<p class="coupon-options">' +
                    '<span><a href="/store/{{ row.entity.related_stores[0].url }}" target="_blank">View</a></span> &nbsp;&nbsp;' +
                    '<span><a ui-sref="header.update-coupon({couponId: row.entity._id})">Edit</a></span></p>' +
                    '</div>'
                },
                {
                    field: "last_modified_by", displayName: "Submitted By",
                    cellTemplate: '<p style="text-transform: capitalize; padding: 5px;">{{ row.entity.last_modified_by.first_name }} {{ row.entity.last_modified_by.last_name }}</p>'
                },
                {
                    field: 'related_stores[0].name', displayName: "Store", enableFiltering: false,
                    headerCellTemplate: storeHeaderTemplate
                },
                {
                    field: 'related_categories', displayName: "Category", enableFiltering: false,
                    cellTemplate: '<p style="text-transform: capitalize; padding: 5px;">' +
                    '<span ng-repeat="i in row.entity.related_categories">' +
                    '<a ui-sref="header.update-category({categoryId: i._id})"> {{ i.name }}</a> ' +
                    '{{$last ? "" : ($index == row.entity.related_categories.length-2) ? " and " : ", "}}</span>' +
                    '</p>'
                },
                { field: 'coupon_type', displayName: "Coupon Type", enableFiltering: false },
                { field: 'coupon_code', displayName: "Coupon Code"
                },
                {
                    field: '_created', displayName: "Created Date", type: 'date', cellFilter: 'date', width: '15%', enableFiltering: false,
                    cellTemplate: "<p style='padding: 5px;'>{{ row.entity._created | date: 'dd MMM yyyy hh:mm a' }}</p>"
                },
                {
                    field: 'expire_date', displayName: "Expiry Date", type: 'date', cellFilter: 'date', width: '15%', enableFiltering: false,
                    cellTemplate: "<p style='padding: 5px;'>{{ row.entity.expire_date | date: 'dd MMM yyyy hh:mm a' }}</p>", sort: { direction: 'desc', priority: 0 }
                },
                {
                    field: 'number_of_clicks', displayName: "Clicks"
                }
            ]
        };

        $scope.getSelectedRows = function () {
            $scope.mySelectedRows = $scope.gridApi.selection.getSelectedRows();
        };
        // register API
        $scope.gridOptions.onRegisterApi = function(gridApi){
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope,function(row){
                $scope.getSelectedRows();
            });

            gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
                var msg = 'rows changed ' + rows;
                $scope.getSelectedRows();
            });
        };


        $scope.statusOptions = {};
        $scope.filterByStatus = function (array) {
            $scope.gridOptions.data = array;
        };
        if ($auth.isAuthenticated()) {
            var embedded = {
                "recommended_stores":1,
                "related_categories":1,
                "related_stores":1,
                "last_modified_by": 1
            };
            $scope.load = $http({
                url: '/api/1.0/coupons?embedded='+JSON.stringify(embedded)+'&rand_number=' + new Date().getTime(),
                method: "GET"
            }).then(function (data) {
                if(data['data']) {
                    $scope.coupons = data.data._items;
                    var destArray = _.groupBy(data.data._items, 'status');
                    destArray['All'] = $scope.coupons;
                    destArray['Expired Coupons'] = [];
                    angular.forEach($scope.coupons, function(item) {
                        if(new Date(item.expire_date) < new Date()) {
                            destArray['Expired Coupons'].push(item);
                        }
                        item._created = new Date(item._created);
                        item._expire_date = new Date(item.expire_date);
                        $scope.gridOptions.data.push(item);
                    });
                    // Sort by keys
                    var keys = Object.keys( destArray );
                    keys = keys.sort( function ( a, b ) { return a > b; } );
                    for ( var i = 0; i < keys.length; i++ ) {
                        $scope.statusOptions[keys[i]] = destArray[keys[i]];
                    }
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        } else {
            $state.go("login");
        }

        // delete selected check boxes
        $scope.deleteSelected = function(array) {
            var items = [];
            angular.forEach(array, function (item) {
                items.push(couponFactory.delete(item._id).then(function(data) {
                    console.log(data);
                    return data;
                }, function (error) {
                    console.log(error);
                    toastr.error(error.data._error.message, error.data._error.code);
                }));

                console.log(item);
            });
            $q.all(items).then(function (finalData) {
                toastr.success(items.length, "Deleted Selected Items");
                $state.reload();
            });
        };
    })
    .directive('myCustomModal', function() {
        return {
            template: '<label>{{colFilter.term}}</label><button ng-click="showAgeModal()">...</button>',
            controller: 'myCustomModalCtrl'
        };
    });