/* module for users */

angular.module('usersModule', ['constantModule', 'toastr', 'personFactoryModule', 'satellizer'])
.controller("usersCtrl", function ($scope, mainURL, URL, personFactory, $auth) {
    console.log("users controller");

});