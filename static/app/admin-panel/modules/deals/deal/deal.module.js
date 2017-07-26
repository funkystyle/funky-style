/* store module */
angular.module("dealModule", ['constantModule', 'toastr', 'cgBusy',
    'satellizer', 'ui.select', 'dealFactoryModule', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter'])
    .controller("dealCtrl", function ($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                                $auth, dealFactory, $q, $http, uiGridConstants, $templateCache) {
        $scope.deals = [];
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
                    field: 'name', displayName: "Name", width: "25%",
                    cellTemplate: '<div class="coupon-name" style="padding: 5px;">' +
                    '<p><a ui-sref="header.update-deal({id: row.entity._id})">{{ row.entity.name }}</a></p>' +
                    '</div>'
                },
                {
                    field: "last_modified_by", displayName: "Submitted By", enableSorting: false,
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
                    field: 'deal_category', displayName: "Deal Category",
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
                    field: 'deal_type', displayName: "Deal Type", enableSorting: true
                },
                {
                    field: "_created", displayName: "Created Date",
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
                "deal_brands": 1,
                "store": 1,
                "related_deals": 1,
                "deal_category": 1,
                "last_modified_by": 1
            };

            var r = Math.random();

            var url = URL.deals+"?embedded="+JSON.stringify(embedded)+"&r="+JSON.stringify(r);

            $scope.load = $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                $scope.gridOptions.data = data.data._items;
                $scope.deals = data.data._items;
                angular.forEach($scope.deals, function(item) {
                    console.log(item);
                    // push categories into array for filtering
                    angular.forEach(item.deal_category, function (category) {
                        $scope.categories.push({
                            value: category._id,
                            label: category.name
                        });
                    });
                    if(item.store) {
                        $scope.stores.push({
                            value: item.store._id,
                            label: item.store.name
                        });
                    }
                    $scope.persons.push({
                        value: item.last_modified_by._id,
                        label: item.last_modified_by.email
                    });
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
                    $scope.gridApi.grid.columns[3].filter.selectOptions = $scope.categories;
                    $scope.gridApi.grid.columns[2].filter.selectOptions = $scope.persons;
                    $scope.gridApi.grid.refresh();
                }, 1000);

            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        }

        // check for individual check boxes
        $scope.checkBox = function(val) {
            var count = 0;
            angular.forEach($scope.check.check, function(val, key) {
                if (val) {
                    count++
                }
            });
            $scope.check.all = (count == Object.keys($scope.check.check).length) ? true : false;
            $scope.show = (count == 0) ? false : true;
            $scope.check.count = count;
        };

        // delete selected check boxes
        $scope.deleteSelected = function(array) {
            var items = [];
            angular.forEach(array, function (item) {
                items.push(dealFactory.delete(item._id).then(function(data) {
                    console.log(data);
                    toastr.success("Deleted "+item.name, 200);
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
    .filter("typeDealFilter", function ($filter) {
        return function (items, filter) {
            console.log(items, filter);
            var list = [];
            if(!Object.keys(filter).length) {
                return items;
            }
            angular.forEach(filter, function (val, key) {
                if(key == 'store') {
                    angular.forEach(items, function (item) {
                        if(item['store']) {
                            if(item.store._id == val) {
                                list.push(item)
                            }
                        }
                    });
                } else if(key == 'deal_category') {
                    angular.forEach(items, function (item) {
                        if(Array.isArray(item[key])) {
                            angular.forEach(item[key], function (type) {
                                if(type._id == val) {
                                    list.push(item);
                                }

                            });
                        }
                    });
                } else if (key == 'last_modified_by') {
                    angular.forEach(items, function (item) {
                        if(item.last_modified_by['_id'] == val) {
                            list.push(item);
                        }
                    });
                } else if (key == 'deal_type') {
                    angular.forEach(items, function (item) {
                        if(item.deal_type == val) {
                            list.push(item);
                        }
                    });
                }
            });

            var uniqueList = _.uniq(list, function(item, key, a) {
                return item._id;
            });

            console.log("Final unique Items: ", uniqueList)
            return uniqueList;
        }
    });