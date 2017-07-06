angular.module('APP', ['ui.router', 'oc.lazyLoad', 'ngSanitize', 'satellizer'])
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
            restrict: "E",
            scope: {
                info: "="
            },
            controller: "commentsCtrl",
            templateUrl: "static/app/customer-panel/modules/comments/comments.directive.template.html"
        }
    })
    .directive("commentsDisplay", function () {
        return {
            restrict: "E",
            scope: {
                items: "="
            },
            templateUrl: "static/app/customer-panel/modules/comments/comments.display.template.html"
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
    // reports directive
    .directive("reports", function () {
        return {
            restrict: "E",
            scope: {
                info: "="
            },
            controller: function ($scope, $state, $stateParams, $http, auth, $auth) {
                $scope.issue = {
                    "Not Valid": "not valid",
                    "Expired": "expired",
                    "Other Issue": "other issue"
                };
                $scope.report = {};

                auth.me().then(function (data) {
                    $scope.loggeduser = data.data;
                });

                // submit comment
                $scope.submitReport= function (report) {
                    console.log("Report: ", report);
                    var url = '/api/1.0/coupons_reports';
                    $http({
                        url: url,
                        method: "POST",
                        data: {
                            user: $scope.loggeduser._id,
                            coupon: $scope.info.item._id,
                            status: false,
                            issue: report.issue,
                            description: report.description
                        }
                    }).then(function (data) {
                        console.log("Report data Success: ", data);
                        $("#reportPopup").modal("hide");
                    }, function (erorr) {
                        console.log(erorr);
                    });
                }
            },
            templateUrl: "static/app/customer-panel/modules/reports/reports.template.html"
        }
    })

    // ==== coupon info popup controller
    .controller("couponInfoPopupCtrl", function ($scope, $http, $state,
                                                 $ocLazyLoad, $sce, $stateParams, Query) {
        console.log("couponInfoPopupCtrl: ");

        $ocLazyLoad.load("static/bower_components/clipboard/dist/clipboard.min.js").then(function (data) {

            $scope.showMore = {};

            $scope.trustAsHtml = function(string) {
                if(string) {
                    return $sce.trustAsHtml(string);
                }
            };

            $('#couponPopup').on('hidden.bs.modal', function () {
                $state.go(".", {cc: undefined});
            });

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

            // open coupon popup code
            $scope.openCouponCode = function (store, item) {

                // put a request to update the no of clicks into the particular coupon document
                var url = "/api/1.0/coupons/"+item._id+"?number_of_clicks=1";
                Query.get(url);

                url = $state.href($state.current.name, {cc: item._id});
                window.open(url,'_blank');
            };

            $scope.moreCoupons = [];
            url = "/api/1.0/coupons?sort=-number_of_clicks&max_results=3";
            Query.get(url).then(function (coupons) {
                var items = coupons.data._items;
                console.log(" Coupons Data: ", items);
                $scope.moreCoupons = items;
            });
        });
    })
    // comments controller
    .controller("commentsCtrl", function ($scope, $state, $stateParams, auth, $auth, $http) {

        console.log("Comments controller!");
        $scope.comment = {};

        auth.me().then(function (data) {
            $scope.loggeduser = data.data;
        });

        // submit comment
        $scope.submitComment = function (comment) {
            console.log("Comment Description: ", comment.comment, "Store info: ", $scope.info.item.related_stores);
            var url = '/api/1.0/coupons_comments';
            $http({
                url: url,
                method: "POST",
                data: {
                    user: $scope.loggeduser._id,
                    coupon: $scope.info.item._id,
                    status: false,
                    comment: comment.comment
                }
            }).then(function (data) {
                console.log("Comment data Success: ", data);
                $("#commentPopup").modal("hide");
            }, function (erorr) {
                console.log(erorr);
            });
        }
    })
    .factory("Query", function ($http, $q) {
        return {
            get: function (url) {
                var d = $q.defer();
                $http({
                    url: url+"&r="+Math.random(),
                    method: "GET"
                }).then(function (data) {
                    d.resolve(data);
                }, function (error) {
                    d.reject(error);
                });
                return d.promise;
            }
        }
    })