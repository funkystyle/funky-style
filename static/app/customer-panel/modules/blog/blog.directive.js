var blog=angular.module("blogModule",[]).directive("blogTile",function(){return{restrict:"E",scope:{items:"=",nClass:"@"},templateUrl:"static/app/customer-panel/modules/blog/blog.tile.template.html",controller:["$scope","$state","$sce",function(t,e,n){t.trustAsHtml=function(t,e){if(t)return t=t.substr(0,e)+" ...",n.trustAsHtml(t)}}]}}).controller("blogHeaderCtrl",["$scope","$http","$state","$filter","Query","$sce",function(t,e,n,r,i,s){t.blogs=[],t.categories=[],t.trustAsHtml=function(t,e){if(t)return t=t.length>e?t.substr(0,e)+" ...":t.substr(0,e),s.trustAsHtml(t)},t.top_banner={};var l=JSON.stringify({top_banner_string:"blog"}),o="/api/1.0/banner?where="+l;i.get(o).then(function(e){t.top_banner=e.data._items[0]}),t.side_banner={};o="/api/1.0/banner?where="+(l=JSON.stringify({side_banner_string:"blog"}));i.get(o).then(function(e){t.side_banner=e.data._items[0]}),o="/api/1.0/blog/?embedded="+JSON.stringify({last_modified_by:1,related_categories:1})+"&max_results=7",i.get(o).then(function(e){t.blogs=e.data._items,angular.forEach(t.blogs,function(e){e._updated=new Date(e._updated),angular.forEach(e.related_categories,function(n){0==r("filter")(t.categories,{_id:n._id}).length&&(n.blog={url:e.url,title:e.title},t.categories.push(n))})}),setTimeout(function(){$("#myCarousel").carousel({interval:!1,looop:!1}),$(".fdi-Carousel .item").each(function(t,e){0==t&&$(this).addClass("active");var n=$(this).next();n.length||(n=$(this).siblings(":first")),n.children(":first-child").clone().appendTo($(this)),n.next().length>0?n.next().children(":first-child").clone().appendTo($(this)):$(this).siblings(":first").children(":first-child").clone().appendTo($(this))})},1e3)})}]).factory("Query",["$http","$q",function(t,e){return{get:function(n){var r=e.defer();return t({url:n+"&r="+Math.random(),method:"GET"}).then(function(t){r.resolve(t)},function(t){r.reject(t)}),r.promise}}}]);