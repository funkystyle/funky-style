/* store module */
angular.module("deeplinkModule", ['toastr', 'cgBusy', 'satellizer', 'ui.select', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter'])
    .controller("deeplinkCtrl", function ($scope, $filter, toastr, mainURL, $state, $stateParams,
                                                $auth, $q, $http, deepLinkFactory) {


        console.log("Deeplink Controller!");
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
                    field: 'is_default', displayName: "Is Default"
                },
                {
                    field: "affiliate_network", displayName: "Affiliate Network"
                },
                {
                    field: 'start_url.url', displayName: "Start URL"
                },
                {
                    field: 'start_url.encode', displayName: "Start URL Encode"
                },
                {
                    field: 'end_url.url', displayName: "End URL"
                },
                {
                    field: 'end_url.encode', displayName: "End URL Encode"
                },
                {
                    field: 'tags.tags', displayName: "Tags"
                },
                {
                    field: "tags.replace", displayName: "Tags Replace"
                },
                {
                    field: "encode_main_url", displayName: "Encode Main URL"
                }
            ]
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

        // delete selected check boxes
        $scope.deleteSelected = function(array) {
            var items = [];
            angular.forEach(array, function (item) {
                items.push(deepLinkFactory.delete(item._id).then(function(data) {
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

        $http({
            url: "/api/1.0/deep_link/",
            method: "GET"
        }).then(function (data) {
            console.log("List of deep links list: ", data.data._items);
            $scope.gridOptions.data = data.data._items;
        }, function (error) {
            consol.log("Error: ", error);
        });
    })
    .factory("deepLinkFactory", function ($http, $q) {
        return {
            delete: function (id) {
                var def = $q.defer();

                $http({
                    url: "/api/1.0/deep_link/"+id+'?rand_number' + new Date().getTime(),
                    method: "DELETE"
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            }
        }
    });