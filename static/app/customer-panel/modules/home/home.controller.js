angular.module("homeModule",["headerModule","Directives"]).controller("homeCtrl",["$scope","$sce","$http","$filter","$ocLazyLoad","$state","$stateParams","$rootScope","SEO","$compile","Query","DestionationUrl",function(e,n,t,o,a,i,r,u,s,c,d,p){e.params=void 0,e.deals=[],e.categories=[];var f={};f.related_categories=1,f.related_stores=1,e.fillCoupons=function(n){e.coupons=[],t({url:n,method:"GET",headers:{"Content-Encoding":"gzip"}}).then(function(n){if(n.data){var t=n.data._items;angular.forEach(t,function(n){new Date(n.expire_date)>new Date&&-1==e.coupons.indexOf(n)&&e.coupons.push(n)})}},function(e){})},e.featuredResults=function(){var n="/api/1.0/coupons?where="+JSON.stringify({featured_coupon:!0})+"&max_results=10&sort=-_created&embedded="+JSON.stringify(f)+"&rand="+Math.random();e.fillCoupons(n)},e.featuredResults(),e.fetchCoupons=function(n){var t="/api/1.0/coupons?max_results=10&sort=-"+n+"&embedded="+JSON.stringify(f)+"&rand="+Math.random();e.fillCoupons(t)},s.getSEO().then(function(e){angular.forEach(e,function(e){if("home"==e.selection_type.code)s.seo("",e,"home")})}),e.banners=[];var l=JSON.stringify({top_banner_string:"home"}),m={top_banner_string:1,image:1,title:1,image_text:1,destination_url:1};url="/api/1.0/banner?where="+l+"&projection="+JSON.stringify(m)+"&rand_number"+(new Date).getTime(),t({url:url,method:"GET",headers:{"Content-Encoding":"gzip"}}).then(function(n){n.data&&(e.banners=n.data._items,$("#myCarousel").carousel({interval:4e3,pause:"hover",loop:!0}))},function(e){}),e.openCouponCode=function(n,t){var o="/api/1.0/coupons/"+t._id+"?number_of_clicks=1";d.get(o),p.destination_url(t.destination_url).then(function(n){e.destionationUrl=n.data.data.output_url,o=i.href("main.home",{cc:t._id,destionationUrl:e.destionationUrl}),$('<a href="'+o+'" target="_blank">&nbsp;</a>')[0].click(),window.location.href=e.destionationUrl},function(e){})};var h={};h.featured_store=!0,(m={}).name=1,m.url=1,m.image=1,m.menu=1,m.related_coupons=1,t({url:"/api/1.0/stores/?where="+JSON.stringify(h)+"&max_results=24&projection="+JSON.stringify(m)+"&rand_number"+(new Date).getTime(),mathod:"GET",headers:{"Content-Encoding":"gzip"}}).then(function(n){n.data&&(e.stores=n.data._items)},function(e){});var g={};g.featured_category=!0,(m={}).name=1,m.url=1,m.image=1,m.related_coupons=1,t({url:"/api/1.0/categories/?where="+JSON.stringify(g)+"&max_results=24&projection="+JSON.stringify(m)+"&rand_number"+(new Date).getTime(),mathod:"GET",headers:{"Content-Encoding":"gzip"}}).then(function(n){n.data&&(e.categories=n.data._items)},function(e){}),t({url:"/api/1.0/deals?max_results=24&rand_number"+(new Date).getTime(),mathod:"GET",headers:{"Content-Encoding":"gzip"}}).then(function(n){n.data&&(e.deals=n.data._items)},function(e){}),r.cc&&($("coupon-info-popup").remove(),e.$watch("coupons",function(n,t){n&&angular.forEach(n,function(n){if(n._id==r.cc){e.couponInfo=n;var t=c("<coupon-info-popup type='home' coupon='couponInfo'></coupon-info-popup>")(e);$("body").append(t),setTimeout(function(){$("#couponPopup").modal("show")},1e3)}})},!0)),e.trustAsHtml=function(e){if(e)return n.trustAsHtml(e)},e.showDescription=function(e){$(".show-description").hide(),$("#show-desc-"+e).fadeIn(200)},e.closeDescription=function(){$(".show-description").fadeOut()}}]).factory("Query",["$http","$q",function(e,n){return{get:function(t){var o=n.defer();return e({url:t+"&r="+Math.random(),method:"GET",headers:{"Content-Encoding":"gzip"}}).then(function(e){o.resolve(e)},function(e){o.reject(e)}),o.promise}}}]);