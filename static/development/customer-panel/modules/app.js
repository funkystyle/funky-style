function clearNullIds (items) {
    if(items == undefined || items == null) {
        return [];
    }
    var array = [];
    angular.forEach(items, function (item, index) {
        if(item != null) {
            array.push(item);
        }
    });
    return array;
}
$(document).ready(function () {
    setTimeout(function () {
        $("html, body").animate({ scrollTop: 0 }, 100);
    }, 3000);
});
angular.module('APP', ['ui.router', 'oc.lazyLoad', 'ngSanitize'])
    .run(["$rootScope", function($rootScope) {
        $rootScope.$on('$stateChangeSuccess', function() {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('.goToTop').fadeIn();
            } else {
                $('.goToTop').fadeOut();
            }
        });
        $('.goToTop').click(function () {
            $("html, body").animate({ scrollTop: 0 }, 100);
            return false;
        });
    }])
    .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $locationProvider) {
            $locationProvider.html5Mode(true).hashPrefix('');

            // Deal with missing trailing slash
            $urlRouterProvider.rule(function($injector, $location) {
                var path = $location.path(), search = $location.search();
                console.log("=======================", path, search)
                if (path[path.length-1] !== '/') {
                    if (search === {}) {
                        return path + '/';
                    } else {
                        var params = [];
                        angular.forEach(search, function(v, k){
                            params.push(k + '=' + v);
                        });
                        return path + '/?' + params.join('&');
                    }
                }
            });

            // configuring the lazyLoad angularjs files
            $ocLazyLoadProvider.config({
                // debug: true,
                modules: [
                    {
                        name: 'headerModule',
                        files: ['static/app/customer-panel/modules/header/header.controller.js']
                    },
                    {
                        name: "ui.bootstrap",
                        files: [
                            'static/bower_components/angular-bootstrap/ui-bootstrap-custom-2.5.0.min.js',
                            'static/bower_components/angular-bootstrap/ui-bootstrap-custom-tpls-2.5.0.min.js'
                        ]
                    },
                    {
                        name: "cgBusy",
                        files: [
                            "/static/bower_components/angular-busy/dist/angular-busy.min.js",
                            "/static/bower_components/angular-busy/dist/angular-busy.min.css"
                        ]
                    },
                    {
                        name: "satellizer",
                        files: [
                            'static/bower_components/satellizer/dist/satellizer.min.js'
                        ]
                    },
                    {
                        name: "toastr",
                        files: [
                            "static/bower_components/angular-toastr/dist/angular-toastr.tpls.min.js",
                            "static/bower_components/angular-toastr/dist/angular-toastr.min.css"
                        ]
                    },
                    {
                        name: "storeServiceModule",
                        files: ['static/services/store.service.js']
                    },
                    {
                        name: 'constantModule',
                        files: ['static/app/customer-panel/modules/constant.module.js']
                    },
                    //    Filters
                    {
                        name: "Filters",
                        files: ['static/app/customer-panel/modules/filters/filter.module.js']
                    },
                    //    Directives
                    {
                        name: "Directives",
                        files: ['static/app/customer-panel/modules/directives/directives.module.js']
                    },

                    // Services
                    {
                        name: "personFactoryModule",
                        files: ['/static/services/persons.service.js']
                    },
                    {
                        name: "categoryFactoryModule",
                        files: ['/static/services/category.service.js']
                    },
                    {
                        name: "dealFactoryModule",
                        files: ['/static/services/deal.service.js']
                    },
                    {
                        name: "couponFactoryModule",
                        files: ['/static/services/coupon.service.js']
                    }
                ]
            });

            $urlRouterProvider.otherwise('/404');
            $stateProvider

                .state('main', {
                    url: '',
                    templateUrl: 'static/app/customer-panel/modules/header/header.template.html',
                    controller: "headerCtrl",
                    resolve: {
                        redirect: function($location) {
                            if ($location.path() === undefined || $location.path() === null || $location.path() === '') {
                                $location.path('/');
                            }
                        },
                        main: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'headerModule',
                                files: ['static/app/customer-panel/modules/header/header.controller.js']
                            })
                        }
                    }
                })
                .state('main.home', {
                    url: '/?cc&destionationUrl',
                    templateUrl: 'static/app/customer-panel/modules/home/home.template.html',
                    controller: "homeCtrl",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'homeModule',
                                files: ['static/app/customer-panel/modules/home/home.controller.js']
                            })
                        }
                    }
                })
                // activate email link
                .state('main.activate', {
                    url: '/confirm_account/users/:user_id/confirm/:token',
                    templateUrl: 'static/app/customer-panel/modules/activate.email/activate.email.template.html',
                    controller: "activateEmailCtrl",
                    resolve: {
                        activateEmail: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'activateEmailModule',
                                files: ['static/app/customer-panel/modules/activate.email/activate.email.module.js']
                            })
                        }
                    }
                })
                // store state
                .state('main.store', {
                    url: '/stores/',
                    templateUrl: 'static/app/customer-panel/modules/store/store.template.html',
                    controller: "storeCtrl",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'storeModule',
                                files: ['static/app/customer-panel/modules/store/store.controller.js']
                            })
                        }
                    }
                })
                // Store Info
                .state('main.store-info', {
                    url: '/store/:url/?cc&destionationUrl',
                    templateUrl: 'static/app/customer-panel/modules/store.info/store.info.template.html',
                    controller: "storeinfoController",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'storeinfoModule',
                                files: ['static/app/customer-panel/modules/store.info/store.info.controller.js']
                            })
                        }
                    }
                })
                // category info
                .state('main.category', {
                    url: '/category/',
                    templateUrl: 'static/app/customer-panel/modules/category/category.template.html',
                    controller: "categoryCtrl",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'categoryModule',
                                files: ['static/app/customer-panel/modules/category/category.controller.js']
                            })
                        }
                    }
                })
                // category info
                .state('main.categoryinfo', {
                    url: '/category/:url/?cc&destionationUrl',
                    templateUrl: 'static/app/customer-panel/modules/category.info/category.info.template.html',
                    controller: "categoryinfoCtrl",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'categoryinfoModule',
                                files: ['static/app/customer-panel/modules/category.info/category.info.contoller.js']
                            })
                        }
                    }
                })
                // all deals page
                .state('main.all_deals', {
                    url: '/deals/',
                    templateUrl: 'static/app/customer-panel/modules/fab.deal.home/fab.deal.home.template.html',
                    controller: "allDealsCtrl",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'allDealsModule',
                                files: ['static/app/customer-panel/modules/fab.deal.home/fab.deal.home.module.js']
                            })
                        }
                    }
                })
                // deals brand page
                .state('main.deal_post_details', {
                    url: '/deals/:url/?cc&destionationUrl',
                    templateUrl: 'static/app/customer-panel/modules/deal.details/deal.details.template.html',
                    controller: "dealDetailsCtrl",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'dealDetailsModule',
                                files: ['static/app/customer-panel/modules/deal.details/deal.details.module.js']
                            })
                        }
                    }
                })

                .state('main.deal_brand_page', {
                    url: '/deals/brands/:url/',
                    templateUrl: 'static/app/customer-panel/modules/brand.page/brand.page.template.html',
                    controller: "brandPageCtrl",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'brandPageModule',
                                files: ['static/app/customer-panel/modules/brand.page/brand.page.module.js']
                            })
                        }
                    }
                })
                .state('main.deal_category_page', {
                    url: '/deals/category/:url/',
                    templateUrl: 'static/app/customer-panel/modules/deal.category.page/deal.category.page.template.html',
                    controller: "dealCategoryPageCtrl",
                    resolve: {
                        home: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'dealCategoryPageModule',
                                files: ['static/app/customer-panel/modules/deal.category.page/deal.category.page.module.js']
                            })
                        }
                    }
                })
                // 404
                .state('404', {
                    url: '/404',
                    templateUrl: 'static/app/customer-panel/modules/404/404.template.html'
                })
                // blog state
                .state('blogs', {
                    url: '/blog',
                    templateUrl: 'static/app/customer-panel/modules/blog/blog.header.template.html',
                    controller: "blogHeaderCtrl",
                    resolve: {
                        dashboard: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'blogModule',
                                files: [
                                    'static/app/customer-panel/modules/blog/blog.directive.js'
                                ]
                            })
                        }
                    }
                })
                // All blogs
                .state('blogs.blogs', {
                    url: '/',
                    templateUrl: 'static/app/customer-panel/modules/blog/blog.template.html',
                    controller: "blogListCtrl",
                    resolve: {
                        dashboard: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: "blogListModule",
                                files: [
                                    'static/app/customer-panel/modules/blog/blog.module.js'
                                ]
                            })
                        }
                    }
                })
                // blog.category
                .state('blogs.category', {
                    url: '/category/:url/',
                    templateUrl: 'static/app/customer-panel/modules/blog.category/blog.category.template.html',
                    controller: "blogCategoryCtrl",
                    resolve: {
                        dashboard: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: "blogCategoryModule",
                                files: [
                                    'static/app/customer-panel/modules/blog.category/blog.category.module.js'
                                ]
                            })
                        }
                    }
                })
                // blog.category
                .state('blogs.details', {
                    url: '/:url/',
                    templateUrl: 'static/app/customer-panel/modules/blog.details/blog.details.template.html',
                    controller: "blogDetailsCtrl",
                    resolve: {
                        dashboard: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: "blogDetailsModule",
                                files: [
                                    'static/app/customer-panel/modules/blog.details/blog.details.module.js'
                                ]
                            })
                        }
                    }
                })

                .state("main.cms", {
                    url: "/:url/",
                    templateUrl: "static/app/customer-panel/modules/cms/cms.template.html",
                    controller: "cmsCtrl",
                    resolve: {
                        dashboard: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'cmsModule',
                                files: ['static/app/customer-panel/modules/cms/cms.module.js']
                            })
                        }
                    }
                })
        }
    ])
    // it is for authentication
    .factory('auth', function ($http, $q) {
        return {
            getToken: function () {
                return localStorage.getItem('satellizer_token');
            },
            setToken: function (token) {
                return localStorage.setItem('satellizer_token', token);
            },
            logout: function () {
                localStorage.removeItem('satellizer_token');
            },
            checkLogin: function () {
                return (localStorage.getItem('satellizer_token')) ? true : false;
            },
            me: function () {
                var def = $q.defer();
                $http({
                    url: "/api/1.0/auth/me",
                    method: "GET"
                }).then(function (data) {
                    def.resolve(data.data);
                }, function (error) {
                    def.reject(error.data);
                });

                return def.promise;
            }
        }
    })
    .factory("SEO", function ($http, $q) {
        var obj = {};
        obj.meta_titles = function (object) {
            console.log("Meta Titles object: ", object);
            $("title").html(object.title);
            $("meta[property='og\\:title'], meta[name='twitter\\:title']").attr('content', object.title);
            $( "meta[name='description'], meta[property='og\\:description'], meta[name='twitter\\:description']")
                .attr('content', object.description);
            $( "link[rel='canonical'], meta[property='og\\:url']").attr('href', window.location.href);
            $("meta[property='og\\:site_name']").attr('content', window.location.host);

            return object;
        };
        obj.seo = function (newVal, item, from) {
            console.log("newVal: ", newVal, " Item: ", item, "From: ", from);
            var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            var date = new Date();
            var month = undefined;
            var year = undefined;

            date.setDate(date.getDate() + 3);
            month = monthNames[date.getMonth()];
            year = date.getFullYear();

            item.meta_title = (item.meta_title) ? item.meta_title: "";
            item.meta_description = (item.meta_description) ? item.meta_description: "";

            var replacement = {
                title: undefined,
                description: undefined
            };
            newVal = (newVal) ? newVal : '';
            replacement.title = item.meta_title.replace("%%title%%", newVal).replace('%%currentdate%%', date.getDate()).replace("%%currentmonth%%", month).replace("%%currentyear%%", year);
            replacement.description = item.meta_description.replace("%%title%%", newVal).replace('%%currentdate%%', date.getDate()).replace("%%currentmonth%%", month).replace("%%currentyear%%", year);

            console.log("SEO replacement Data: ", replacement);
            obj.meta_titles(replacement);
            return replacement;
        };
        obj.getSEO =  function () {
            // get the seo information for home page
            var def = $q.defer();
            var url = '/api/1.0/master_seo'+'?rand' + new Date().getTime();
            $http({
                url: url,
                method: "GET"
            }).then(function (data) {
                console.log("SEO Data: ", data.data._items);
                var items = data.data._items;
                def.resolve(items);
            }, function (error) {
                console.log(error);
                def.reject(error);
            });

            return def.promise;
        };
        return obj;
    })
    .factory("DestionationUrl", function ($http, $q) {
        return {
            destination_url: function (url) {
                var d = $q.defer();

                $http({
                    url: "/api/1.0/get-output-deep-link-url",
                    method: "POST",
                    data: {
                        url: url
                    }
                }).then(function (success) {
                    d.resolve(success);
                }, function (error) {
                    d.reject(error);
                });

                return d.promise;
            }
        }
    })
    .directive('starRating', function () {
        return {
            restrict: 'A',
            template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
            '</li>' +
            '</ul>',
            scope: {
                ratingValue: '=',
                max: '=',
                onRatingSelected: '&'
            },
            link: function (scope, elem, attrs) {
                var updateStars = function () {
                    scope.stars = [];
                    for (var i = 0; i < scope.max; i++) {
                        scope.stars.push({
                            filled: i < scope.ratingValue
                        });
                    }
                };

                scope.toggle = function (index) {
                    return true;
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({
                        rating: index + 1
                    });
                };

                scope.$watch('ratingValue', function (newVal, oldVal) {
                    if (newVal) {
                        updateStars();
                    }
                });
            }
        }
    })
    .controller("footerCtrl", function ($scope, $http) {
        $scope.cms = [];

        var projection = {
            "name": 1,
            "url": 1
        };

        url = '/api/1.0/cms_pages'+'?projection='+JSON.stringify(projection)+'&rand_number' + new Date().getTime();
        $http({
            url: url,
            method: "GET"
        }).then(function (data) {
            console.log(data);
            if(data['data']) {
                console.log("CMS pages: ", data.data._items);
                $scope.cms = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });
    });