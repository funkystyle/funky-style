angular.module("couponModule", ['constantModule', 'toastr', 'cgBusy', 'satellizer', 'ui.select', 'couponFactoryModule'
    , 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.grid.exporter'])
    .controller("couponCtrl", function($scope, $filter, toastr, $http, $q,
                                       mainURL, URL, $state, $stateParams, $auth, couponFactory, uiGridConstants, $templateCache) {
        $scope.coupons = [];
        $scope.categories = [];
        $scope.stores = [];
        $scope.persons = [];

        $templateCache.put('ui-grid/date-cell',
            "<div class='ui-grid-cell-contents'>{{COL_FIELD | date:'yyyy-MM-dd'}}</div>"
        );

        // Custom template using Bootstrap DatePickerPopup
        // Custom template using Bootstrap DatePickerPopup
        $templateCache.put('ui-grid/ui-grid-date-filter',
            "<div class=\"ui-grid-filter-container date-filter-container\" ng-repeat=\"colFilter in col.filters\" >" +
            "<input type=\"text\" class=\"ui-grid-filter-input date-filter-input ui-grid-filter-input-{{$index}}\"" +
            "style=\"font-size:1em; width:11em!important\" ng-model=\"colFilter.term\" ng-attr-placeholder=\"{{colFilter.placeholder || ''}}\" " +
            " aria-label=\"{{colFilter.ariaLabel || aria.defaultFilterLabel}}\" />"
        );

        $scope.highlightFilteredHeader = function( row, rowRenderIndex, col, colRenderIndex ) {
            if( col.filters[0].term ){
                return 'header-filtered';
            } else {
                return '';
            }
        };

        setTimeout(function () {
            $('.date-filter-input').datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function(dateText) {
                    $(this).trigger('input')
                }
            });
        }, 1000);

        $scope.gridOptions = {
            data: [],
            exporterMenuCsv: false,
            enableHorizontalScrollbar: uiGridConstants.scrollbars.ALWAYS,
            enableVerticalScrollbar: uiGridConstants.scrollbars.ALWAYS,
            enableColumnResizing: true,
            enableGridMenu: true,
            enableRowSelection: true,
            enableSelectAll: true,
            selectionRowHeaderWidth: 35,
            enablePaginationControls: true,
            paginationPageSize: 25,
            showGridFooter:true,
            enableFiltering: true,
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
                    field: "last_modified_by", width: "20%", displayName: "Submitted By", enableSorting: false,
                    filter: {
                        condition: function (searchTerm, cellValue, row, column) {
                            console.log(cellValue, searchTerm);
                            var filtered = false;
                            filtered = cellValue._id === searchTerm;
                            return filtered;
                        },
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: $scope.persons
                    },
                    cellTemplate: "<div>{{ row.entity[col.field].email }}</div>"
                },
                {
                    field: 'related_stores', width: "20%", displayName: "Store",
                    enableSorting: false,
                    filter: {
                        condition: function (searchTerm, cellValue, row, column) {
                            var filtered = false;
                            for (var i = 0; i < cellValue.length; i++) {
                                filtered = cellValue[i]._id === searchTerm;
                                if (filtered) {
                                    break;
                                }
                            }
                            return filtered;
                        },
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: $scope.stores
                    },
                    cellTemplate: "<div ng-repeat='item in row.entity[col.field]'>{{ item.name }}</div>"
                },
                {
                    field: 'related_categories', width: "20%", displayName: "Category",
                    enableSorting: false,
                    filter: {
                        condition: function (searchTerm, cellValue, row, column) {
                            var filtered = false;
                            for (var i = 0; i < cellValue.length; i++) {
                                filtered = cellValue[i]._id === searchTerm;
                                if (filtered) {
                                    break;
                                }
                            }
                            return filtered;
                        },
                        type: uiGridConstants.filter.SELECT,
                        selectOptions: $scope.categories
                    },
                    cellTemplate: "<div ng-repeat='item in row.entity[col.field]'>{{ item.name }}</div>"
                },
                {
                    field: 'coupon_type', width: "20%", displayName: "Coupon Type"
                },
                { field: 'coupon_code', width: "20%", displayName: "Coupon Code"
                },
                {
                    field: '_created', displayName: "Created Date", type: 'date', cellFilter: 'date', width: '15%',
                    cellTemplate: "<p style='padding: 5px;'>{{ row.entity._created | date: 'dd MMM yyyy hh:mm a' }}</p>"
                },
                {
                    field: 'expire_date', displayName: "Expiry Date",
                    cellTooltip: true,
                    cellFilter: "date:'yyyy-MM-dd'",
                    cellTemplate: 'ui-grid/date-cell',
                    filterHeaderTemplate: 'ui-grid/ui-grid-date-filter',
                    width: '20%',
                    filters: [
                        {
                            condition: function(term, value, row, column){
                                if (!term) return true;
                                var term = term.replace(/\\/g, '');
                                var valueDate = new Date(value);
                                return valueDate >= new Date(term);
                            },
                            placeholder: 'From Date'
                        },
                        {
                            condition: function(term, value, row, column){
                                if (!term) return true;
                                var term = term.replace(/\\/g, '');
                                var valueDate = new Date(value);
                                return valueDate <= new Date(term);
                            },
                            placeholder: 'To Date'
                        }
                    ],
                    headerCellClass: $scope.highlightFilteredHeader
                },
                {
                    field: 'number_of_clicks', width: "20%", displayName: "Clicks"
                },
                {
                    field: 'status', width: "20%", displayName: "Status"
                },
                {
                    field: 'featured_coupon', width: "20%", displayName: "Featured"
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

        $scope.autoRefresh = function () {
            // refresh function no longer triggers custom filter function
            $scope.gridApi.grid.columns[4].filter.selectOptions = $scope.categories;
            $scope.gridApi.grid.refresh();
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
                        // push categories into array for filtering
                        angular.forEach(item.related_categories, function (category) {
                            $scope.categories.push({
                                value: category._id,
                                label: category.name
                            });
                        });
                        $scope.stores.push({
                            value: item.related_stores[0]._id,
                            label: item.related_stores[0].name
                        });

                        if(item['last_modified_by']) {
                            $scope.persons.push({
                                value: item.last_modified_by._id,
                                label: item.last_modified_by.email
                            });
                        }

                        if(new Date(item.expire_date) < new Date()) {
                            destArray['Expired Coupons'].push(item);
                        }
                        item._created = new Date(item._created);
                        item._expire_date = new Date(item.expire_date);

                        $scope.gridOptions.data.push(item);
                    });
                    setTimeout(function () {
                        $scope.categories = _.uniq($scope.categories, function (item) {
                            return item.value;
                        });
                        $scope.stores = _.uniq($scope.stores, function (item) {
                            return item.value;
                        });
                        $scope.persons = _.uniq($scope.persons, function (item) {
                            return item.value;
                        });
                        $scope.gridApi.grid.columns[4].filter.selectOptions = $scope.categories;
                        $scope.gridApi.grid.columns[3].filter.selectOptions = $scope.stores;
                        $scope.gridApi.grid.columns[2].filter.selectOptions = $scope.persons;
                        $scope.gridApi.grid.refresh();
                    }, 1000);

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