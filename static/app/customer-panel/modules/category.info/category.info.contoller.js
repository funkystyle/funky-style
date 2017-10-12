angular.module("categoryinfoModule",["Directives","satellizer","APP"]).controller("categoryinfoCtrl",["$scope","$state","$filter","$ocLazyLoad","$sce","Query","$q","$stateParams","$http","$rootScope","$compile","$auth","DestionationUrl","SEO",function(e,t,o,r,a,n,i,s,c,l,u,p,d,g){if(e.favorites={},e.filter={store:{},wallet:{}},e.showMore={all:{},deals:{},coupons:{}},e.params=void 0,e.search={store:void 0,wallet:void 0},e.category=void 0,e.coupons=[],e.filterCoupons=[],e.expiredCoupons=[],e.categories={},e.stores=[],e.manageFavorite=function(t,o){var r=!e.favorites[o];if(!p.isAuthenticated())return!0;var a={url:"/api/1.0/persons/"+e.user._id,method:"PATCH",data:{}},n=e.user[t].indexOf(o);r?-1===n&&e.user[t].push(o):e.user[t].splice(n,1),a.data[t]=e.user[t],StoreQuery.postFav(a).then(function(t){e.favorites[o]=r},function(e){})},e.trustAsHtml=function(e){return a.trustAsHtml(e)},e.applyFilter=function(){e.filterCoupons=o("couponFilter")(e.coupons,e.filter),e.dealsLength=o("filter")(e.filterCoupons,{coupon_type:"offer"}),e.couponsLength=o("filter")(e.filterCoupons,{coupon_type:"coupon"})},e.openCouponCode=function(e,o){d.destination_url(o.destination_url).then(function(r){var a=r.data.data.output_url,n=a||o.destination_url;t.go("main.categoryinfo",{url:e.url,cc:o._id,destionationUrl:n}),window.open("about:blank","newtab").location=n})},s.url){var f={};f.url=s.url;var _={};_.related_categories=1,_.top_stores=1,url="/api/1.0/categories/"+s.url+"?embedded="+JSON.stringify(_)+"&r="+Math.random(),c({url:url,method:"GET"}).then(function(t){if(t.data){e.category=t.data,e.category.toDayDate=new Date,e.category.voting=Math.floor(201*Math.random())+300,e.category.top_stores=clearNullIds(e.category.top_stores),e.category.related_categories=clearNullIds(e.category.related_categories),e.category.top_categories=clearNullIds(e.category.top_categories),e.category.related_deals=clearNullIds(e.category.related_deals),e.category.related_coupons=clearNullIds(e.category.related_coupons);var r={meta_title:e.category.seo_title,meta_description:e.category.seo_description};g.seo({},r,"");var a={related_categories:{$in:[e.category._id]},status:"Publish"};_=JSON.stringify({related_stores:1,related_categories:1}),url="/api/1.0/coupons?where="+JSON.stringify(a)+"&max_results=1000&&sort=-_updated&embedded="+_,c.get(url).then(function(t){var r=t.data._items;angular.forEach(r,function(t){t._updated=new Date(t._updated),new Date(t.expire_date)>new Date&&-1===e.coupons.indexOf(t)&&(e.coupons.push(t),e.filterCoupons.push(t),e.dealsLength=o("filter")(e.filterCoupons,{coupon_type:"offer"}),e.couponsLength=o("filter")(e.filterCoupons,{coupon_type:"coupon"})),angular.forEach(t.related_categories,function(t){if(null===t)return!0;e.categories[t.category_type]?o("filter")(e.categories[t.category_type],{_id:t._id}).length||e.categories[t.category_type].push(t):(e.categories[t.category_type]=[],e.categories[t.category_type].push(t))}),angular.forEach(t.related_stores,function(t){o("filter")(e.stores,{_id:t._id}).length||e.stores.push(t)})})},function(e){})}e.category.top_banner||(e.top_banner={},f=JSON.stringify({top_banner_string:"category",expired_date:{$gte:(new Date).toGMTString()}}),url="/api/1.0/banner?where="+f,n.get(url).then(function(t){e.top_banner=t.data._items[0],$("#top_banner_area").show()})),e.category.side_banner||(e.side_banner={},f=JSON.stringify({side_banner_string:"category",expired_date:{$gte:(new Date).toGMTString()}}),url="/api/1.0/banner?where="+f,n.get(url).then(function(t){e.side_banner=t.data._items[0]}))},function(e){t.go("404")});var y=JSON.stringify({name:1,url:1,image:1});f=JSON.stringify({featured_category:!0}),url="/api/1.0/categories/?where="+f+"&projection="+y,c.get(url).then(function(t){t.data&&(e.featured_categories=t.data._items)})}else t.go("main.category");s.cc&&($("coupon-info-popup").remove(),_=JSON.stringify({related_stores:1,related_categories:1}),url="/api/1.0/coupons/"+s.cc+"?number_of_clicks=1&&embedded="+_+"&rand="+Math.random(),c.get(url).then(function(t){e.couponInfo=t.data;var o=u("<coupon-info-popup parent='category' type='category' coupon='couponInfo'></coupon-info-popup>")(e);$("body").append(o),setTimeout(function(){$("#couponPopup").modal("show")},1e3)},function(e){t.go("main.categoryinfo",{cc:void 0,destionationUrl:void 0})}))}]).filter("couponFilter",function(){return function(e,t){var o=[];if(!Object.keys(t.store).length&&!Object.keys(t.wallet).length)return e;var r=0;return angular.forEach(t,function(e,t){angular.forEach(e,function(e,t){!0===e&&r++})}),0===r?e:(angular.forEach(e,function(e){angular.forEach(t,function(t,r){angular.forEach(t,function(t,r){angular.forEach(e.related_stores,function(a){a&&!0===t&&r===a._id&&-1===o.indexOf(e)&&o.push(e)}),angular.forEach(e.related_categories,function(a){a&&!0===t&&r===a._id&&-1===o.indexOf(e)&&o.push(e)})})})}),o)}}).factory("Query",["$http","$q",function(e,t){return{get:function(o){var r=t.defer();return e({url:o+"&r="+Math.random(),method:"GET"}).then(function(e){r.resolve(e)},function(e){r.reject(e)}),r.promise}}}]).directive("ddTextCollapse",["$compile","$sce",function(e,t){return{restrict:"A",scope:!0,link:function(t,o,r){function a(e){return e?String(e).replace(/<[^>]+>/gm,""):""}t.collapsed=!1,t.toggle=function(){t.collapsed=!t.collapsed},r.$observe("ddTextCollapseText",function(n){n=a(n);var i=t.$eval(r.ddTextCollapseMaxLength);if(n.length>i){var s=String(n).substring(0,i),c=String(n).substring(i,n.length),l=e("<span>"+s+"</span>")(t),u=e('<span ng-if="collapsed">'+c+"</span>")(t),p=e('<span ng-if="!collapsed">... </span>')(t),d=e('<br ng-if="collapsed">')(t),g=e('<span style="cursor: pointer; color: #165ba8;" class="collapse-text-toggle" ng-click="toggle()">{{collapsed ? "Show Less" : "Show More"}}</span>')(t);o.empty(),o.append(l),o.append(u),o.append(p),o.append(d),o.append(g)}else o.empty(),o.append(n)})}}}]);