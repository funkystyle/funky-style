angular.module("dashboardModule",["headerModule","APP","satellizer","toastr","Directives"]).controller("dashboardCtrl",["$scope","auth","$auth","$state","$http","toastr","$sce",function(t,o,e,r,u,n,a){e.isAuthenticated()?setTimeout(function(){var o=JSON.stringify({fav_stores:1,fav_coupons:1}),r="/api/1.0/persons/"+t.user._id+"?embedded="+o+"&r="+Math.random();u({url:r,method:"GET",headers:{authorization:e.getToken()}}).then(function(o){t.user=o.data},function(t){})},1e3):r.go("main.login"),t.trustAsHtml=function(t){if(t)return a.trustAsHtml(t)},t.logout=function(){e.isAuthenticated()&&u({url:"/api/1.0/auth/logout",method:"GET"}).then(function(t){e.logout(),n.success("Successfully Logged out!","Hey!"),r.go("main.login")},function(t){n.error(t.data.error,"Error")})}}]);