function clearNullIds (items) {
    if(items == undefined || items == null) {
        return [];
    }
    var array = _.without(items, null).map(function(item) { return item["_id"]; });
    console.log("Before deleting null items: ", items," -- after deleting null items: ", array);
    return array;
}
var adminApp = angular.module("ADMIN", ['ui.router', 'oc.lazyLoad'])
    .run(function ($rootScope) {
        var id = undefined;
        $rootScope.textEditor = function (event) {
            $(".Editor-container").remove();
            $("#editorModal").modal("show");
            id = event.currentTarget;
            setTimeout(function () {
                $("#textEditor").Editor();
                $("#textEditor").Editor('setText', $(id).val());
            }, 1000);
        };

        $rootScope.submit = function () {
            var input = $(id);
            input.val($("#textEditor").Editor("getText"));
            input.trigger('input'); // Use for Chrome/Firefox/Edge
            input.trigger('change'); // Use for Chrome/Firefox/Edge + IE11
            $("#editorModal").modal('hide');
            $(".Editor-container").remove();
        };
    })
    .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$locationProvider', '$sceProvider',
        function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $locationProvider, $sceProvider) {

            $sceProvider.enabled(false);
            $locationProvider.html5Mode(false).hashPrefix("");
            // configuring the lazyLoad angularjs files
            $ocLazyLoadProvider.config({
                // debug: true,
                modules: [
                    {
                        name: "ui.select",
                        files: [
                            "/static/bower_components/angular-ui-select/dist/select.js",
                            "/static/bower_components/angular-ui-select/dist/select.css"
                        ]
                    },
                    {
                        name: "ngSanitize",
                        files: [
                            "/static/bower_components/angular-sanitize/angular-sanitize.min.js",
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
                        name: "ui.bootstrap",
                        files: [
                            "/static/bower_components/angular-bootstrap/ui-bootstrap.js",
                            "/static/bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
                            "/static/bower_components/angular-bootstrap/ui-bootstrap-csp.css"
                        ]
                    },
                    {
                        name: "angular-table",
                        files: [
                            "/static/bower_components/at-table/dist/angular-table.min.js",
                        ]
                    },
                    {
                        name: "naif.base64",
                        files: [
                            "/static/bower_components/angular-base64-upload/dist/angular-base64-upload.min.js",
                        ]
                    },
                    {
                        name: "satellizer",
                        files: [
                            '/static/bower_components/satellizer/dist/satellizer.js'
                        ]
                    },
                    {
                        name: "toastr",
                        files: [
                            "/static/bower_components/angular-toastr/dist/angular-toastr.tpls.min.js",
                            "/static/bower_components/angular-toastr/dist/angular-toastr.min.css"
                        ]
                    },
                    {
                        name: "constantModule",
                        files: ['/static/services/constant.module.js']
                    },

                    // directives
                    {
                        name: "Directives",
                        files: ['/static/app/admin-panel/modules/directives/global.module.js']
                    },

                    // Services
                    {
                        name: "personFactoryModule",
                        files: ['/static/services/persons.service.js']
                    },
                    {
                        name: "storeFactoryModule",
                        files: ['/static/services/store.service.js']
                    },
                    {
                        name: "categoryFactoryModule",
                        files: ['/static/services/category.service.js']
                    },
                    {
                        name: "blogFactoryModule",
                        files: ['/static/services/blog.service.js']
                    },
                    {
                        name: "cmsFactoryModule",
                        files: ['/static/services/cms.service.js']
                    },
                    {
                        name: "commentsReportsFactoryModule",
                        files: ['/static/services/comments.reports.service.js']
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
            var token = localStorage.getItem('satellizer_token');
            // $urlRouterProvider.otherwise("/");
            $stateProvider
                .state('header', {
                    url: '',
                    templateUrl: '/static/app/admin-panel/modules/header/header.template.html',
                    controller: "headerCtrl",
                    resolve: {
                        redirect: function($location) {
                            if ($location.path() == undefined || $location.path() == null || $location.path() == '') {
                                $location.path('/');
                            }

                            if(token == null || token == undefined || token == '') {
                                $location.path("/login");
                            }
                        },
                        header: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'headerModule',
                                files: ['/static/app/admin-panel/modules/header/header.module.js']
                            })
                        }
                    }
                })
                .state('header.dashboard', {
                    url: '/',
                    templateUrl: '/static/app/admin-panel/modules/dashboard/dashboard.template.html',
                    controller: "dashBoardCtrl",
                    resolve: {
                        dashboard: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'DashBoardModule',
                                files: ['/static/app/admin-panel/modules/dashboard/dashboard.module.js']
                            })
                        }
                    }
                })
                .state('login', {
                    url: '/login',
                    templateUrl: '/static/app/admin-panel/modules/login/login.template.html',
                    controller: "loginCtrl",
                    resolve: {
                        login: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'loginModule',
                                files: ['/static/app/admin-panel/modules/login/login.module.js']
                            })
                        }
                    }
                })
                .state('forgot_password', {
                    url: '/forgot-password',
                    templateUrl: '/static/app/admin-panel/modules/forgot.password/forgot.password.template.html',
                    controller: "forgotPasswordCtrl",
                    resolve: {
                        forgotPassword: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'forgotPasswordModule',
                                files: ['/static/app/admin-panel/modules/forgot.password/forgot.password.module.js']
                            })
                        }
                    }
                })
                // from store/store directory
                .state('header.stores', {
                    url: '/stores',
                    templateUrl: '/static/app/admin-panel/modules/store/store/store.template.html',
                    controller: "storeCtrl",
                    resolve: {
                        store: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'storeModule',
                                files: ['/static/app/admin-panel/modules/store/store/store.module.js']
                            })
                        }
                    }
                })
                // from store/add directory
                .state('header.add-store', {
                    url: '/store/add',
                    templateUrl: '/static/app/admin-panel/modules/store/add/add.store.template.html',
                    controller: "addStoreCtrl",
                    resolve: {
                        addStore: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addStoreModule',
                                files: ['/static/app/admin-panel/modules/store/add/add.store.module.js']
                            })
                        }
                    }
                })
                .state('header.update-store', {
                    url: '/store/update/:storeId',
                    templateUrl: '/static/app/admin-panel/modules/store/update/update.store.template.html',
                    controller: "updateStoreCtrl",
                    resolve: {
                        updateStore: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateStoreModule',
                                files: ['/static/app/admin-panel/modules/store/update/update.store.module.js']
                            })
                        }
                    }
                })

                // from category directory
                .state('header.category', {
                    url: '/categories',
                    templateUrl: '/static/app/admin-panel/modules/category/category/category.template.html',
                    controller: "categoryCtrl",
                    resolve: {
                        category: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'categoryModule',
                                files: ['/static/app/admin-panel/modules/category/category/category.module.js']
                            })
                        }
                    }
                })
                // from store/add directory
                .state('header.add-category', {
                    url: '/category/add',
                    templateUrl: '/static/app/admin-panel/modules/category/add/add.category.template.html',
                    controller: "addCategoryCtrl",
                    resolve: {
                        addCategory: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addCategoryModule',
                                files: ['/static/app/admin-panel/modules/category/add/add.category.module.js']
                            })
                        }
                    }
                })
                .state('header.update-category', {
                    url: '/category/update/:categoryId',
                    templateUrl: '/static/app/admin-panel/modules/category/update/update.category.template.html',
                    controller: "updateCategoryCtrl",
                    resolve: {
                        updateCategory: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateCategoryModule',
                                files: ['/static/app/admin-panel/modules/category/update/update.category.module.js']
                            })
                        }
                    }
                })
                // from deal/deal directory
                .state('header.deals', {
                    url: '/deals',
                    templateUrl: '/static/app/admin-panel/modules/deals/deal/deal.template.html',
                    controller: "dealCtrl",
                    resolve: {
                        deal: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'dealModule',
                                files: ['/static/app/admin-panel/modules/deals/deal/deal.module.js']
                            })
                        }
                    }
                })
                // from deals/add directory
                .state('header.add-deal', {
                    url: '/deal/add',
                    templateUrl: '/static/app/admin-panel/modules/deals/add/add.deal.template.html',
                    controller: "addDealCtrl",
                    resolve: {
                        addDeal: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addDealModule',
                                files: ['/static/app/admin-panel/modules/deals/add/add.deal.module.js']
                            })
                        }
                    }
                })
                .state('header.update-deal', {
                    url: '/deal/update/:id',
                    templateUrl: '/static/app/admin-panel/modules/deals/update/update.deal.template.html',
                    controller: "updateDealCtrl",
                    resolve: {
                        updateDeal: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateDealModule',
                                files: ['/static/app/admin-panel/modules/deals/update/update.deal.module.js']
                            })
                        }
                    }
                })

                // from coupons/add directory
                .state('header.coupon', {
                    url: '/coupons',
                    templateUrl: '/static/app/admin-panel/modules/coupons/coupon/coupon.template.html',
                    controller: "couponCtrl",
                    cache: false,
                    resolve: {
                        coupon: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'couponModule',
                                files: ['/static/app/admin-panel/modules/coupons/coupon/coupon.module.js']
                            })
                        }
                    }
                })
                .state('header.add-coupon', {
                    url: '/coupon/add',
                    templateUrl: '/static/app/admin-panel/modules/coupons/add/add.coupon.template.html',
                    controller: "addCouponCtrl",
                    resolve: {
                        addCoupon: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addCouponModule',
                                files: ['/static/app/admin-panel/modules/coupons/add/add.coupon.module.js']
                            })
                        }
                    }
                })
                .state('header.update-coupon', {
                    url: '/coupon/update/:couponId',
                    templateUrl: '/static/app/admin-panel/modules/coupons/update/update.coupon.template.html',
                    controller: "updateCouponCtrl",
                    resolve: {
                        updateCoupon: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateCouponModule',
                                files: ['/static/app/admin-panel/modules/coupons/update/update.coupon.module.js']
                            })
                        }
                    }
                })


                // ==== settings ======
                .state('header.settings', {
                    url: '/settings',
                    templateUrl: '/static/app/admin-panel/modules/settings/settings/settings.template.html',
                    controller: "settingsCtrl",
                    resolve: {
                        settings: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'settingsModule',
                                files: ['/static/app/admin-panel/modules/settings/settings/settings.module.js']
                            });
                        }
                    }
                })
                .state('header.settings.profile', {
                    url: '/profile',
                    templateUrl: '/static/app/admin-panel/modules/settings/profile/profile.template.html',
                    controller: "profileCtrl",
                    resolve: {
                        settings: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'profileModule',
                                files: ['/static/app/admin-panel/modules/settings/profile/profile.module.js']
                            })
                        }
                    }
                })
                .state('header.settings.change-password', {
                    url: '/change-password',
                    templateUrl: '/static/app/admin-panel/modules/settings/change.password/change.password.template.html',
                    controller: "changePasswordCtrl",
                    resolve: {
                        settings: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'profileModule',
                                files: ['/static/app/admin-panel/modules/settings/change.password/change.password.module.js']
                            })
                        }
                    }
                })

                /* ===== users section */
                .state('header.users', {
                    url: '/users',
                    templateUrl: '/static/app/admin-panel/modules/users/users/users.template.html',
                    controller: "usersCtrl",
                    resolve: {
                        redirect: function($location) {
                            if ($location.path() == '/users') {
                                $location.path('/users/all');
                            }
                        },
                        users: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'usersModule',
                                files: ['/static/app/admin-panel/modules/users/users/users.module.js']
                            })
                        }
                    }
                })
                .state('header.users.all', {
                    url: '/all',
                    templateUrl: '/static/app/admin-panel/modules/users/all/all.template.html',
                    controller: "allUsersCtrl",
                    resolve: {
                        allUsers: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'allUsersModule',
                                files: ['/static/app/admin-panel/modules/users/all/all.users.module.js']
                            })
                        }
                    }
                })
                .state('header.users.add', {
                    url: '/add',
                    templateUrl: '/static/app/admin-panel/modules/users/add/add.users.template.html',
                    controller: "addUsersCtrl",
                    resolve: {
                        addUsers: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addUsersModule',
                                files: ['/static/app/admin-panel/modules/users/add/add.users.module.js']
                            })
                        }
                    }
                })
                // from dynamic.fields directory
                .state('header.dynamic_fields', {
                    url: '/dynamic-fields',
                    templateUrl: '/static/app/admin-panel/modules/dynamic.fields/dynamic.fields.template.html',
                    controller: "dynamicFieldsCtrl",
                    resolve: {
                        dynamicFields: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'dynamicFieldsModule',
                                files: ['/static/app/admin-panel/modules/dynamic.fields/dynamic.fields.module.js']
                            })
                        }
                    }
                })
                // from blog directory
                .state('header.blog', {
                    url: '/blogs',
                    templateUrl: '/static/app/admin-panel/modules/blog/blog/blog.template.html',
                    controller: "blogCtrl",
                    resolve: {
                        blog: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'blogModule',
                                files: ['/static/app/admin-panel/modules/blog/blog/blog.module.js']
                            })
                        }
                    }
                })
                .state('header.add_blog', {
                    url: '/blog/add',
                    templateUrl: '/static/app/admin-panel/modules/blog/add/add.blog.template.html',
                    controller: "addBlogCtrl",
                    resolve: {
                        addBlog: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addBlogModule',
                                files: ['/static/app/admin-panel/modules/blog/add/add.blog.module.js']
                            })
                        }
                    }
                })
                .state('header.update_blog', {
                    url: '/blog/update/:id',
                    templateUrl: '/static/app/admin-panel/modules/blog/update/update.blog.template.html',
                    controller: "updateBlogCtrl",
                    resolve: {
                        updateBlog: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateBlogModule',
                                files: ['/static/app/admin-panel/modules/blog/update/update.blog.module.js']
                            })
                        }
                    }
                })

                // from deal.categories directory
                .state('header.deal-categories', {
                    url: '/deal-categories',
                    templateUrl: '/static/app/admin-panel/modules/deal.categories/deal.categories/deal.categories.template.html',
                    controller: "dealCategoriesCtrl",
                    resolve: {
                        dealCategories: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'dealCategoriesModule',
                                files: ['/static/app/admin-panel/modules/deal.categories/deal.categories/deal.categories.module.js']
                            })
                        }
                    }
                })
                .state('header.add-deal-categories', {
                    url: '/deal-category/add',
                    templateUrl: '/static/app/admin-panel/modules/deal.categories/add.deal.categories/add.deal.categories.template.html',
                    controller: "addDealCategoriesCtrl",
                    resolve: {
                        addDealCategory: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addDealCategoriesModule',
                                files: ['/static/app/admin-panel/modules/deal.categories/add.deal.categories/add.deal.categories.module.js']
                            })
                        }
                    }
                })
                .state('header.update-deal-categories', {
                    url: '/deal-category/update/:id',
                    templateUrl: '/static/app/admin-panel/modules/deal.categories/update.deal.categories/update.deal.categories.template.html',
                    controller: "updateDealCategoriesCtrl",
                    resolve: {
                        updateDealCategory: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateDealCategoriesModule',
                                files: ['/static/app/admin-panel/modules/deal.categories/update.deal.categories/update.deal.categories.module.js']
                            })
                        }
                    }
                })

                // from deal.brands directory
                .state('header.deal-brands', {
                    url: '/deal-brands',
                    templateUrl: '/static/app/admin-panel/modules/deal.brands/deal.brands/deal.brands.template.html',
                    controller: "dealBrandsCtrl",
                    resolve: {
                        dealbrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'dealBrandsModule',
                                files: ['/static/app/admin-panel/modules/deal.brands/deal.brands/deal.brands.module.js']
                            })
                        }
                    }
                })
                .state('header.add-deal-brands', {
                    url: '/deal-brands/add',
                    templateUrl: '/static/app/admin-panel/modules/deal.brands/add.deal.brands/add.deal.brands.template.html',
                    controller: "addDealBrandsCtrl",
                    resolve: {
                        addDealBrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addDealCategoryModule',
                                files: ['/static/app/admin-panel/modules/deal.brands/add.deal.brands/add.deal.brands.module.js']
                            })
                        }
                    }
                })
                .state('header.update-deal-brands', {
                    url: '/deal-brands/update/:id',
                    templateUrl: '/static/app/admin-panel/modules/deal.brands/update.deal.brands/update.deal.brands.template.html',
                    controller: "updateDealBrandsCtrl",
                    resolve: {
                        updateDealBrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateDealBrandsModule',
                                files: ['/static/app/admin-panel/modules/deal.brands/update.deal.brands/update.deal.brands.module.js']
                            })
                        }
                    }
                })

                // CMS
                .state('header.cms', {
                    url: '/cms',
                    templateUrl: '/static/app/admin-panel/modules/cms/cms/cms.template.html',
                    controller: "cmsCtrl",
                    resolve: {
                        dealbrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'cmsModule',
                                files: ['/static/app/admin-panel/modules/cms/cms/cms.module.js']
                            })
                        }
                    }
                })
                .state('header.add-cms', {
                    url: '/cms/add',
                    templateUrl: '/static/app/admin-panel/modules/cms/add/add.cms.template.html',
                    controller: "addCmsCtrl",
                    resolve: {
                        addDealBrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addCmsModule',
                                files: ['/static/app/admin-panel/modules/cms/add/add.cms.module.js']
                            })
                        }
                    }
                })
                .state('header.update-cms', {
                    url: '/cms/update/:id',
                    templateUrl: '/static/app/admin-panel/modules/cms/update/update.cms.template.html',
                    controller: "updateCmsCtrl",
                    resolve: {
                        updateDealBrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateCmsModule',
                                files: ['/static/app/admin-panel/modules/cms/update/update.cms.module.js']
                            })
                        }
                    }
                })
                // Coupon Reports
                .state('header.coupon-reports', {
                    url: '/coupon-reports',
                    templateUrl: '/static/app/admin-panel/modules/coupon.reports/coupon.reports/coupon.reports.template.html',
                    controller: "couponReportsCtrl",
                    resolve: {
                        dealbrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'couponReportsModule',
                                files: ['/static/app/admin-panel/modules/coupon.reports/coupon.reports/coupon.reports.module.js']
                            })
                        }
                    }
                })
                .state('header.add-coupon-reports', {
                    url: '/coupon-reports/add',
                    templateUrl: '/static/app/admin-panel/modules/coupon.reports/add/add.coupon.reports.template.html',
                    controller: "addCouponReportsCtrl",
                    resolve: {
                        addDealBrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addCouponReportsModule',
                                files: ['/static/app/admin-panel/modules/coupon.reports/add/add.coupon.reports.module.js']
                            })
                        }
                    }
                })
                .state('header.update-coupon-reports', {
                    url: '/coupon-reports/update/:id',
                    templateUrl: '/static/app/admin-panel/modules/coupon.reports/update/update.coupon.reports.template.html',
                    controller: "updateCouponReportsCtrl",
                    resolve: {
                        updateDealBrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateCouponReportsModule',
                                files: ['/static/app/admin-panel/modules/modules/coupon.reports/update/update.coupon.reports.module.js']
                            })
                        }
                    }
                })
                // Coupon Comments
                .state('header.coupon-comments', {
                    url: '/coupon-comments',
                    templateUrl: '/static/app/admin-panel/modules/coupon.comments/coupon.comments/coupon.comments.template.html',
                    controller: "couponCommentsCtrl",
                    resolve: {
                        dealbrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'couponCommentsModule',
                                files: ['/static/app/admin-panel/modules/coupon.comments/coupon.comments/coupon.comments.module.js']
                            })
                        }
                    }
                })
                .state('header.add-coupon-comments', {
                    url: '/coupon-comments/add',
                    templateUrl: '/static/app/admin-panel/modules/coupon.comments/add/add.coupon.comments.template.html',
                    controller: "addCouponCommentsCtrl",
                    resolve: {
                        addDealBrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'addCouponCommentsModule',
                                files: ['/static/app/admin-panel/modules/coupon.comments/add/add.coupon.comments.module.js']
                            })
                        }
                    }
                })
                .state('header.update-coupon-comments', {
                    url: '/coupon-comments/update/:id',
                    templateUrl: '/static/app/admin-panel/modules/coupon.comments/update/update.coupon.comments.template.html',
                    controller: "updateCouponCommentsCtrl",
                    resolve: {
                        updateDealBrands: function($ocLazyLoad) {
                            return $ocLazyLoad.load({
                                name: 'updateCouponCommentsModule',
                                files: ['/static/app/admin-panel/modules/modules/coupon.comments/update/update.coupon.comments.module.js']
                            })
                        }
                    }
                })


        }
    ])
    .controller("mainCtrl", ["$scope", function($scope) {

    }])
    .filter('propsFilter', function() {
        return function(items, props) {
            var out = [];
            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function(item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }
            return out;
        };
    });