/* store module */
angular.module("deeplinkModule", ['angular-table', 'constantModule', 'toastr', 'cgBusy',
    'satellizer', 'ui.select', 'ui.grid', 'ui.grid.pagination', 'ui.grid.selection', 'ui.grid.exporter'])
    .controller("deeplinkCtrl", function ($scope, $filter, toastr, mainURL, URL, $state, $stateParams,
                                                $auth, $q, $http, uiGridConstants) {


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
    });