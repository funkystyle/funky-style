angular.module("dealCategoryPageModule",["Directives"]).controller("dealCategoryPageCtrl",["$scope","$state","$stateParams","$ocLazyLoad","$http","$sce","$filter","$rootScope",function(e,t,a,r,n,l,o,i){e.search_brands={},e.search={},e.filter={priceRange:{},brands:{}},e.priceRange=[{text:"< 2000",range:"0-2000"},{text:"3000 - 5000",range:"3000-5000"},{text:"7000 - 10000",range:"7000-10000"},{text:"> 10000",range:"10000-40000"}],e.applyFilter=function(){e.filterDeals=o("applyFilter")(e.deals,e.filter)},r.load(["static/bower_components/owl.carousel/owl.carousel.css","static/bower_components/owl.carousel/owl.carousel.js"]).then(function(){function r(){var e=this.parentNode,t=e.getElementsByTagName("input"),a=parseFloat(t[0].value),r=parseFloat(t[1].value);if(a>r){var n=r;r=a,a=n}e.getElementsByClassName("rangeValues")[0].innerHTML=a+" - "+r}window.onload=function(){for(var e=document.getElementsByClassName("range-slider"),t=0;t<e.length;t++)for(var a=e[t].getElementsByTagName("input"),n=0;n<a.length;n++)"range"===a[n].type&&(a[n].oninput=r,a[n].oninput())},e.trustAsHtml=function(e){if(e)return l.trustAsHtml(e)},e.deal={},e.deals=[],e.deal_categories=[],e.categories=[];var s=(new Date).getDate();if(a.url){var c={url:a.url},d={related_categories:1};n({url:"/api/1.0/deal_categories?where="+JSON.stringify(c)+"&rand="+s+"&embedded="+JSON.stringify(d),method:"GET"}).then(function(a){0==a.data._items.length&&t.go("404"),e.deal=a.data._items[0],e.deal.toDayDate=new Date,e.deal.voting=Math.floor(201*Math.random())+300,i.pageTitle=e.deal.seo_title,i.pageDescription=e.deal.seo_description,i.pageTitle=e.deal.seo_title,i.pageDescription=e.deal.seo_description,setTimeout(function(){$("#owl-demo").owlCarousel({autoPlay:2e3,transitionStyle:"fade",loop:!0,items:5,itemsDesktop:[1199,3],itemsDesktopSmall:[979,3]})});var r={};r.related_deals=1,r.deal_categories=1,r.deal_category=1,r["stores.store"]=1;var l={deal_category:e.deal._id},c="/api/1.0/deals?where="+JSON.stringify(l)+"&embedded="+JSON.stringify(r)+"&rand_number="+s;n({url:c,method:"GET"}).then(function(t){t.data&&(e.deals=t.data._items,e.filterDeals=t.data._items,angular.forEach(e.deals,function(t){angular.forEach(t.deal_category,function(t){0==o("filter")(e.categories,{_id:t._id}).length&&e.categories.push(t)})}))},function(e){})},function(e){})}})}]).filter("applyFilter",["$filter",function(e){return function(t,a){var r=[];if(!Object.keys(a.priceRange).length&&!Object.keys(a.categories).length)return t;var n=0;return angular.forEach(a,function(e,t){angular.forEach(e,function(e,t){1==e&&n++})}),0==n?t:(angular.forEach(t,function(t){angular.forEach(a.priceRange,function(a,n){var l=n.split("-")[0],o=n.split("-")[1];1==a&&t.actual_price>l&&t.actual_price<o&&0==e("filter")(r,{_id:t._id}).length&&r.push(t)}),angular.forEach(a.categories,function(a,n){angular.forEach(t.deal_category,function(l){1==a&&n==l._id&&0==e("filter")(r,{_id:t._id}).length&&r.push(t)})})}),r)}}]);