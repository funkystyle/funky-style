angular.module('APP', ['ui.router', 'oc.lazyLoad', 'ngSanitize'])
    .directive("dealTileDirective", function () {
        return {
            restrict: "E",
            scope: {
                items: "=items"
            },
            templateUrl: "static/app/customer-panel/modules/deal.details/deal.details.directive.template.html"
        }
    });
