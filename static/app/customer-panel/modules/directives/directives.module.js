angular.module('APP', ['ui.router', 'oc.lazyLoad', 'ngSanitize'])
    .directive("dealTileDirective", function () {
        return {
            restrict: "E",
            scope: {
                items: "=items"
            },
            templateUrl: "static/app/customer-panel/modules/deal.details/deal.details.directive.template.html"
        }
    })
    .directive("comments", function () {
        return {
            restrict: "A",
            scope: {

            },
            templateUrl: "static/app/customer-panel/modules/comments/comments.directive.template.html"
        }
    })
    .directive("couponInfoPopup", function () {
        return {
            restrict: "E",
            scope: {

            },
            controller: "couponInfoPopupCtrl",
            templateUrl: "static/app/customer-panel/modules/coupon.info.popup/coupon.info.popup.directive.template.html"
        }
    })
    // ==== coupon info popup controller
    .controller("couponInfoPopupCtrl", function ($scope, $http, $state) {
        console.log("couponInfoPopupCtrl: ");
    });