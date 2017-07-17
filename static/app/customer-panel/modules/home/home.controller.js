angular.module("homeModule",["headerModule","Directives"]).controller("homeCtrl",["$scope","$sce","$http","$filter","$ocLazyLoad","$state","$stateParams","$rootScope","SEO","$compile","Query",function(e,t,n,o,a,r,i,u,c,s,d){e.params=void 0,e.deals=[],e.coupons=[],e.categories=[];var p={};p.related_categories=1,p.related_stores=1;var f="/api/1.0/coupons?sort=-_created&embedded="+JSON.stringify(p)+"&rand_number"+(new Date).getTime();n({url:f,method:"GET"}).then(function(t){if(t.data){var n=t.data._items;angular.forEach(n,function(t){new Date(t.expire_date)>new Date&&-1==e.coupons.indexOf(t)&&e.coupons.push(t)})}},function(e){}),c.getSEO().then(function(e){angular.forEach(e,function(e){if("home"==e.selection_type.code){var t=c.seo("",e,"home");u.pageTitle=t.title,u.pageDescription=t.description}})}),e.banners=[];var m={top_banner_string:1,image:1,title:1,image_text:1,destination_url:1};n({url:f="/api/1.0/banner?where="+JSON.stringify({top_banner_string:"home"})+"&projection="+JSON.stringify(m)+"&rand_number"+(new Date).getTime(),method:"GET"}).then(function(t){t.data&&(e.banners=t.data._items)},function(e){}),e.openCouponCode=function(e,t){var n="/api/1.0/coupons/"+t._id+"?number_of_clicks=1";d.get(n),n=r.href("main.home",{cc:t._id}),window.open(n,"_blank")};var l={};l.featured_store=!0,(m={}).name=1,m.url=1,m.image=1,m.menu=1,n({url:"/api/1.0/stores/?where="+JSON.stringify(l)+"&max_results=24&projection="+JSON.stringify(m)+"&rand_number"+(new Date).getTime(),mathod:"GET"}).then(function(t){t.data&&(e.stores=t.data._items)},function(e){});var h={};h.featured_category=!0,(m={}).name=1,m.url=1,m.image=1,n({url:"/api/1.0/categories/?where="+JSON.stringify(h)+"&max_results=24&projection="+JSON.stringify(m)+"&rand_number"+(new Date).getTime(),mathod:"GET"}).then(function(t){t.data&&(e.categories=t.data._items)},function(e){}),n({url:"/api/1.0/deals?max_results=24&rand_number"+(new Date).getTime(),mathod:"GET"}).then(function(t){t.data&&(e.deals=t.data._items)},function(e){}),i.cc&&($("coupon-info-popup").remove(),e.$watch("coupons",function(t,n){t&&angular.forEach(t,function(t){if(t._id==i.cc){e.couponInfo=t;var n=s("<coupon-info-popup type='home' coupon='couponInfo'></coupon-info-popup>")(e);$("body").append(n),setTimeout(function(){$("#couponPopup").modal("show")},1e3)}})},!0)),e.trustAsHtml=function(e){if(e)return t.trustAsHtml(e)},e.showDescription=function(e){$(".show-description").hide(),$("#show-desc-"+e).fadeIn(200)},e.closeDescription=function(){$(".show-description").fadeOut()}}]).factory("Query",["$http","$q",function(e,t){return{get:function(n){var o=t.defer();return e({url:n+"&r="+Math.random(),method:"GET"}).then(function(e){o.resolve(e)},function(e){o.reject(e)}),o.promise}}}]);