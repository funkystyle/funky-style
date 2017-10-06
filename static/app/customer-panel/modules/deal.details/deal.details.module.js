angular.module("dealDetailsModule",["Directives"]).controller("dealDetailsCtrl",["$scope","$ocLazyLoad","$http","$compile","$state","$stateParams","$sce","Query","DestionationUrl",function(e,t,n,o,a,r,i,d,s){e.deal={},e.showMore={},e.imageShow={},e.trustAsHtml=function(e){if(e)return i.trustAsHtml(e)},e.goScroll=function(e){var t=$("#"+e);$("html, body").animate({scrollTop:t.offset().top-150})};var u=(new Date).getDate(),l=JSON.stringify({featured:!0});n({url:"/api/1.0/deal_brands?where="+l+"&max_results=8&rand="+u,method:"GET"}).then(function(t){e.deal_brands=t.data._items},function(e){}),e.top_banner={};var c=JSON.stringify({top_banner_string:"deal_individual",expired_date:{$gte:(new Date).toGMTString()}}),p="/api/1.0/banner?where="+c;if(d.get(p).then(function(t){e.top_banner=t.data._items[0]}),e.side_banner={},c=JSON.stringify({side_banner_string:"deal_individual"}),p="/api/1.0/banner?where="+c,d.get(p).then(function(t){e.side_banner=t.data._items[0]}),r.url){c=JSON.stringify({url:r.url});var f=JSON.stringify({related_deals:1,deal_brands:1,deal_category:1,stores:1,"stores.store":1,store_temp:1});p="/api/1.0/deals?where="+c+"&number_of_clicks=1&embedded="+f+"&rand_number"+Math.random(),n({url:p,method:"GET"}).then(function(t){if(t.data&&t.data._items.length){if(e.deal=t.data._items[0],e.deal.toDayDate=new Date,e.deal.voting=Math.floor(201*Math.random())+300,e.deal.expired_date=new Date(e.deal.expired_date),"store"===e.deal.deal_type){var o={};o.related_stores={$in:[e.deal.store_temp._id]},o.status="Publish";p="/api/1.0/coupons?where="+JSON.stringify(o)+"&max_results=5&sort=[('_updated', -1)]",n({url:p,method:"GET"}).then(function(t){e.store_related_coupons=t.data._items})}}else a.go("404")},function(e){}),e.top_stores=[];var _={name:1,url:1,image:1};n({url:"/api/1.0/stores?projection="+JSON.stringify(_)+"&rand_number"+(new Date).getTime(),method:"GET"}).then(function(t){t.data&&(e.top_stores=t.data._items)},function(e){})}e.openCouponCode=function(e,t){s.destination_url(t.destination_url).then(function(e){var n=e.data.data.output_url,o=n||t.destination_url;p=a.href("main.deal_post_details",{url:r.url,cc:t._id,destionationUrl:o}),$('<a href="'+p+'" target="_blank">&nbsp;</a>')[0].click(),window.location.href=o},function(e){})},e.goDeeplink=function(t){var n={destination_url:t};e.openCouponCode({},n)},r.cc&&($("coupon-info-popup").remove(),f=JSON.stringify({related_stores:1,related_categories:1}),p="/api/1.0/coupons/"+r.cc+"?number_of_clicks=1&embedded="+f+"&rand="+Math.random(),n.get(p).then(function(t){e.couponInfo=t.data;var n=o("<coupon-info-popup parent='store' type='store' coupon='couponInfo'></coupon-info-popup>")(e);$("body").append(n),setTimeout(function(){$("#couponPopup").modal("show")},1e3)},function(e){a.go("main.deal_post_details",{url:r.url,cc:void 0,destionationUrl:void 0})}))}]).filter("quickLimit",function(){return function(e){var t={};return angular.forEach(e,function(e,n){Object.keys(t).length<15&&(t[n]=e)}),t}}).factory("Query",["$http","$q",function(e,t){return{get:function(n){var o=t.defer();return e({url:n+"&r="+Math.random(),method:"GET"}).then(function(e){o.resolve(e)},function(e){o.reject(e)}),o.promise}}}]);