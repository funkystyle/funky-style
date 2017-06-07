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
                couponInfo: "=coupon",
                parent: "=",
                type: "@"
            },
            controller: "couponInfoPopupCtrl",
            templateUrl: "static/app/customer-panel/modules/coupon.info.popup/coupon.info.popup.directive.template.html"
        }
    })
    // ==== coupon info popup controller
    .controller("couponInfoPopupCtrl", function ($scope, $http, $state, $ocLazyLoad, $sce) {
        console.log("couponInfoPopupCtrl: ");

        $ocLazyLoad.load("static/bower_components/clipboard/dist/clipboard.min.js").then(function (data) {

            $scope.showMore = {};

            $scope.trustAsHtml = function(string) {
                if(string) {
                    return $sce.trustAsHtml(string);
                }
            };

            var clipboard = new Clipboard('.btn');

            clipboard.on('success', function(e) {
                console.info('Action:', e.action);
                console.info('Text:', e.text);
                console.info('Trigger:', e.trigger);

                e.clearSelection();

                $("#copyClipboard").html("Copied to Clipboard");
            });

            clipboard.on('error', function(e) {
                console.error('Action:', e.action);
                console.error('Trigger:', e.trigger);
            });
        });
    });