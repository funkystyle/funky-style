angular.module("storeModule",["storeServiceModule"]).controller("storeCtrl",["$scope","storeFactory","SEO","$rootScope",function(a,e,r,n){a.sorting={sorting:"ALL"},a.stores=[],a.setSortkey=function(e,r){r.array.length&&(a.sorting.sorting=e)},a.storeAlphabet={ALL:{enable:!1,array:[]},"#":{enable:!1,array:[]},A:{enable:!1,array:[]},B:{enable:!1,array:[]},C:{enable:!1,array:[]},D:{enable:!1,array:[]},E:{enable:!1,array:[]},F:{enable:!1,array:[]},G:{enable:!1,array:[]},H:{enable:!1,array:[]},I:{enable:!1,array:[]},J:{enable:!1,array:[]},K:{enable:!1,array:[]},L:{enable:!1,array:[]},M:{enable:!1,array:[]},N:{enable:!1,array:[]},O:{enable:!1,array:[]},P:{enable:!1,array:[]},Q:{enable:!1,array:[]},R:{enable:!1,array:[]},S:{enable:!1,array:[]},T:{enable:!1,array:[]},U:{enable:!1,array:[]},V:{enable:!1,array:[]},W:{enable:!1,array:[]},X:{enable:!1,array:[]},Y:{enable:!1,array:[]},Z:{enable:!1,array:[]}};e.get("/api/1.0/stores",void 0).then(function(e){e._items&&(a.stores=e._items,a.storeAlphabet.ALL.array=a.stores,angular.forEach(a.stores,function(e){if(parseInt(e.name.charAt(0)))-1===a.storeAlphabet["#"].array.indexOf(e)&&(a.storeAlphabet["#"].enable=!0,a.storeAlphabet["#"].array.push(e));else{var r=e.name.charAt(0).toUpperCase();-1===a.storeAlphabet[r].array.indexOf(e)&&(a.storeAlphabet[r].enable=!0,a.storeAlphabet[r].array.push(e))}}))},function(a){}),r.getSEO().then(function(a){angular.forEach(a,function(a){if("store"===a.selection_type.code)r.seo("",a,"store")})})}]);