function clearNullIds(e){if(void 0==e||null==e)return[];var t=[];return angular.forEach(e,function(e,a){null!=e&&t.push(e)}),t}angular.module("APP",["ui.router","oc.lazyLoad","ngSanitize"]).run(["$rootScope",function(e){e.$on("$stateChangeSuccess",function(){document.body.scrollTop=document.documentElement.scrollTop=0})}]).config(["$stateProvider","$urlRouterProvider","$ocLazyLoadProvider","$locationProvider",function(e,t,a,o){o.html5Mode(!0).hashPrefix(""),a.config({modules:[{name:"headerModule",files:["static/app/customer-panel/modules/header/header.controller.js"]},{name:"ui.bootstrap",files:["static/bower_components/angular-bootstrap/ui-bootstrap-custom-2.5.0.min.js","static/bower_components/angular-bootstrap/ui-bootstrap-custom-tpls-2.5.0.min.js"]},{name:"cgBusy",files:["/static/bower_components/angular-busy/dist/angular-busy.min.js","/static/bower_components/angular-busy/dist/angular-busy.min.css"]},{name:"satellizer",files:["static/bower_components/satellizer/dist/satellizer.js"]},{name:"toastr",files:["static/bower_components/angular-toastr/dist/angular-toastr.tpls.min.js","static/bower_components/angular-toastr/dist/angular-toastr.min.css"]},{name:"storeServiceModule",files:["static/services/store.service.js"]},{name:"constantModule",files:["static/app/customer-panel/modules/constant.module.js"]},{name:"Filters",files:["static/app/customer-panel/modules/filters/filter.module.js"]},{name:"Directives",files:["static/app/customer-panel/modules/directives/directives.module.js"]},{name:"personFactoryModule",files:["/static/services/persons.service.js"]},{name:"categoryFactoryModule",files:["/static/services/category.service.js"]},{name:"dealFactoryModule",files:["/static/services/deal.service.js"]},{name:"couponFactoryModule",files:["/static/services/coupon.service.js"]}]}),t.otherwise("/404"),e.state("main",{url:"",templateUrl:"static/app/customer-panel/modules/header/header.template.html",controller:"headerCtrl",resolve:{redirect:["$location",function(e){void 0!=e.path()&&null!=e.path()&&""!=e.path()||e.path("/")}],main:["$ocLazyLoad",function(e){return e.load({name:"headerModule",files:["static/app/customer-panel/modules/header/header.controller.js"]})}]}}).state("main.home",{url:"/?cc",templateUrl:"static/app/customer-panel/modules/home/home.template.html",controller:"homeCtrl",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"homeModule",files:["static/app/customer-panel/modules/home/home.controller.js"]})}]}}).state("main.store",{url:"/stores",templateUrl:"static/app/customer-panel/modules/store/store.template.html",controller:"storeCtrl",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"storeModule",files:["static/app/customer-panel/modules/store/store.controller.js"]})}]}}).state("main.store-info",{url:"/store/:url?cc",templateUrl:"static/app/customer-panel/modules/store.info/store.info.template.html",controller:"storeinfoController",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"storeinfoModule",files:["static/app/customer-panel/modules/store.info/store.info.controller.js"]})}]}}).state("main.category",{url:"/category",templateUrl:"static/app/customer-panel/modules/category/category.template.html",controller:"categoryCtrl",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"categoryModule",files:["static/app/customer-panel/modules/category/category.controller.js"]})}]}}).state("main.categoryinfo",{url:"/category/:url?cc",templateUrl:"static/app/customer-panel/modules/category.info/category.info.template.html",controller:"categoryinfoCtrl",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"categoryinfoModule",files:["static/app/customer-panel/modules/category.info/category.info.contoller.js"]})}]}}).state("main.all_deals",{url:"/deals",templateUrl:"static/app/customer-panel/modules/fab.deal.home/fab.deal.home.template.html",controller:"allDealsCtrl",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"allDealsModule",files:["static/app/customer-panel/modules/fab.deal.home/fab.deal.home.module.js"]})}]}}).state("main.deal_post_details",{url:"/deals/:url",templateUrl:"static/app/customer-panel/modules/deal.details/deal.details.template.html",controller:"dealDetailsCtrl",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"dealDetailsModule",files:["static/app/customer-panel/modules/deal.details/deal.details.module.js"]})}]}}).state("main.deal_brand_page",{url:"/brands/:url",templateUrl:"static/app/customer-panel/modules/brand.page/brand.page.template.html",controller:"brandPageCtrl",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"brandPageModule",files:["static/app/customer-panel/modules/brand.page/brand.page.module.js"]})}]}}).state("main.deal_category_page",{url:"/categories/:url",templateUrl:"static/app/customer-panel/modules/deal.category.page/deal.category.page.template.html",controller:"dealCategoryPageCtrl",resolve:{home:["$ocLazyLoad",function(e){return e.load({name:"dealCategoryPageModule",files:["static/app/customer-panel/modules/deal.category.page/deal.category.page.module.js"]})}]}}).state("404",{url:"/404",templateUrl:"static/app/customer-panel/modules/404/404.template.html"}).state("blogs",{url:"/blog",templateUrl:"static/app/customer-panel/modules/blog/blog.header.template.html",controller:"blogHeaderCtrl",resolve:{dashboard:["$ocLazyLoad",function(e){return e.load({name:"blogModule",files:["static/app/customer-panel/modules/blog/blog.directive.js"]})}]}}).state("blogs.blogs",{url:"/",templateUrl:"static/app/customer-panel/modules/blog/blog.template.html",controller:"blogListCtrl",resolve:{dashboard:["$ocLazyLoad",function(e){return e.load({name:"blogListModule",files:["static/app/customer-panel/modules/blog/blog.module.js"]})}]}}).state("blogs.category",{url:"/category/:url/",templateUrl:"static/app/customer-panel/modules/blog.category/blog.category.template.html",controller:"blogCategoryCtrl",resolve:{dashboard:["$ocLazyLoad",function(e){return e.load({name:"blogCategoryModule",files:["static/app/customer-panel/modules/blog.category/blog.category.module.js"]})}]}}).state("blogs.details",{url:"/:url/",templateUrl:"static/app/customer-panel/modules/blog.details/blog.details.template.html",controller:"blogDetailsCtrl",resolve:{dashboard:["$ocLazyLoad",function(e){return e.load({name:"blogDetailsModule",files:["static/app/customer-panel/modules/blog.details/blog.details.module.js"]})}]}}).state("main.cms",{url:"/:url",templateUrl:"static/app/customer-panel/modules/cms/cms.template.html",controller:"cmsCtrl",resolve:{dashboard:["$ocLazyLoad",function(e){return e.load({name:"cmsModule",files:["static/app/customer-panel/modules/cms/cms.module.js"]})}]}})}]).factory("auth",["$http","$q",function(e,t){return{getToken:function(){return localStorage.getItem("satellizer_token")},setToken:function(e){return localStorage.setItem("satellizer_token",e)},logout:function(){localStorage.removeItem("satellizer_token")},checkLogin:function(){return!!localStorage.getItem("satellizer_token")},me:function(){var a=t.defer();return e({url:"/api/1.0/auth/me",method:"GET"}).then(function(e){a.resolve(e.data)},function(e){a.reject(e.data)}),a.promise}}}]).factory("SEO",["$http","$q",function(e,t){return{seo:function(e,t,a){var o=["January","February","March","April","May","June","July","August","September","October","November","December"],l=new Date,r=void 0,s=void 0;l.setDate(l.getDate()+3),r=o[l.getMonth()],s=l.getFullYear();var n={title:void 0,description:void 0};return n.title=t.meta_title.replace("%%title%%",e).replace("%%currentmonth%%",r).replace("%%currentyear%%",s),n.description=t.meta_description.replace("%%title%%",e).replace("%%currentmonth%%",r).replace("%%currentyear%%",s),console.log("SEO replacement Data: ",n),n},getSEO:function(){var a=t.defer(),o="/api/1.0/master_seo?rand"+(new Date).getTime();return e({url:o,method:"GET"}).then(function(e){console.log("SEO Data: ",e.data._items);var t=e.data._items;a.resolve(t)},function(e){console.log(e),a.reject(e)}),a.promise}}}]).directive("starRating",function(){return{restrict:"A",template:'<ul class="rating"><li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">★</li></ul>',scope:{ratingValue:"=",max:"=",onRatingSelected:"&"},link:function(e,t,a){var o=function(){e.stars=[];for(var t=0;t<e.max;t++)e.stars.push({filled:t<e.ratingValue})};e.toggle=function(t){e.ratingValue=t+1,e.onRatingSelected({rating:t+1})},e.$watch("ratingValue",function(e,t){e&&o()})}}}).controller("footerCtrl",["$scope","$http",function(e,t){e.cms=[];var a={name:1,url:1};url="/api/1.0/cms_pages?projection="+JSON.stringify(a)+"&rand_number"+(new Date).getTime(),t({url:url,method:"GET"}).then(function(t){console.log(t),t.data&&(console.log("CMS pages: ",t.data._items),e.cms=t.data._items)},function(e){console.log(e)})}]);