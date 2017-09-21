angular.module("storeModule", ['angular-table', 'constantModule', 'toastr', 'personFactoryModule',
    'storeFactoryModule', 'cgBusy', 'satellizer', 'ui.select', 'couponFactoryModule', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter'])
    .controller("storeCtrl", function($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                      personFactory, $auth, storeFactory, $q,uiGridConstants, $http, couponFactory) {
        console.log("store controller!");

        $scope.stores = [];
        $scope.filterStores = [];
        $scope.search = {
            search: undefined
        };
        $scope.show = false;
        $scope.check = {
            all: false,
            check: {}
        };

        $scope.config = {
            itemsPerPage: 5,
            maxPages: 20,
            fillLastPage: "no"
        };

        $scope.updateFilteredList = function() {
            $scope.filterStores = $filter("filter")($scope.stores, $scope.search.search);
        };
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
            rowHeight: 120,
            columnDefs: [
                {
                    field: 'name', displayName: "Name", width: "25%",
                    cellTemplate: '<div class="coupon-name" style="padding: 5px;">' +
                    '<p>' +
                    '   <a ng-if="grid.appScope.checkRole()" ui-sref="header.update-deal({id: row.entity._id})">{{ row.entity.name }}</a>' +
                    '   <a style="color: #000000;" ng-if="!grid.appScope.checkRole()">{{ row.entity.name }}</a>' +
                    '</p>' +
                    '</div>'
                },
                {
                    field: 'image', displayName: "Image", width: "25%",
                    cellTemplate: '<div class="image-store" style="padding: 5px; ">' +
                    '<img ng-src="{{ row.entity.image }}" alt="{{ row.entity.name }} Image">' +
                    '</div>'
                },
                {
                    field: 'top_description', displayName: "Top Description", width: "25%",
                    cellTemplate: '<div class="" style="padding: 5px;" ng-bind-html="row.entity.top_description"></div>'
                },
                {
                    field: 'number_of_clicks', displayName: "Clicks"
                }
            ]
        };

        $scope.getSelectedRows = function () {
            $scope.mySelectedRows = $scope.gridApi.selection.getSelectedRows();

            console.log("Get Selected Rows: ", $scope.mySelectedRows);
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

        if ($auth.isAuthenticated()) {
            var embedded = {};
            embedded['related_coupons'] = 1;
            var projections = {
                "related_coupons": {
                    "title": 1
                },
                "name": 1,
                "url": 1,
                "image": 1,
                "top_description": 1,
                "featured_store": 1,
                "number_of_clicks": 1
            },
                random_number = new Date().getTime(),
                url = URL.stores+"?embedded="+JSON.stringify(embedded)+"&projection="+
                JSON.stringify(projections)+"&rand_number="+JSON.stringify(random_number);

            $scope.load = storeFactory.get(url).then(function (data) {
                console.log("Stores: ", data._items);
                if(data) {
                    $scope.stores = data._items;
                    angular.forEach($scope.stores, function(item, index) {
                        // check related coupons null ids
                        item.related_coupons = clearNullIds(item.related_coupons);
                        $scope.gridOptions.data.push(item);
                    });
                }
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, "Error!");
            });
        }

        // delete selected check boxes
        $scope.deleteSelected = function() {
            var deletedArray = [];
            console.log("delete Selected Rows", $scope.mySelectedRows);
            angular.forEach($scope.mySelectedRows, function(item) {
                deletedArray.push(
                    storeFactory.delete(item._id).then(function (storeDelete) {
                        console.log("stores deleted!", storeDelete);
                        return storeDelete;
                    })
                );
            });

            // show success message after deleting all the stores
            $q.all(deletedArray).then(function (data) {
                toastr.success("Selected Stores Deleted", "Success!");
                $state.reload();
            })
            
        };
    });