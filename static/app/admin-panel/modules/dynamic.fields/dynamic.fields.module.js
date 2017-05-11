angular.module("dynamicFieldsModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy", "naif.base64"])
.controller("dynamicFieldsCtrl", function ($scope, $state, $stateParams) {
    console.log("dynamic field controller!");
});