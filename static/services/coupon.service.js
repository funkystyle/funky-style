/**
* couponServiceModule Module
*
* Description
*/
angular.module('couponFactoryModule', ['constantModule'])
.factory("couponFactory", function ($http, $q, URL) {
	return {
		get: function (obj) {
		    var url = undefined;
			if(typeof obj == 'object') {
                var temp = {};
                temp[obj.type] = {
                    "$in": [obj.id]
                };
			    url = URL.coupons+"&where="+JSON.stringify(temp);
            } else {
			    url = URL.coupons
            }
            var def = $q.defer();

			$http({
				url: url,
				method: "GET"
			}).then(function (data) {
				def.resolve(data);
			}, function (error) {
				def.reject(error);
			});

			return def.promise;
		},

        getCoupon: function (query) {
            var def = $q.defer();
            $http({
                url: URL.coupons+"&where="+query,
                method: "GET"
            }).then(function (data) {
                console.log(data);
                def.resolve(data)
            }, function (error) {
                def.reject(error.data);
            });
            return def.promise;
        },

		// post a coupon
		post: function (data) {
			var def = $q.defer();
			$http({
				url: URL.coupons,
				method: "POST",
				data: data
			}).then(function (data) {
				def.resolve(data);
			}, function (error) {
				def.reject(error);
			});

			return def.promise;
		},

		// update coupon
		update: function (obj, token) {
			var def = $q.defer();
			URL.coupons = URL.coupons.split('?')[0];
			$http({
				url: URL.coupons+'/'+obj._id,
				method: "PATCH",
                headers: {
                    authorization: token
                },
                data: obj
			}).then(function (data) {
				def.resolve(data);
			}, function (error) {
				def.reject(error);
			});

			return def.promise;
		},

		// delete coupon
		delete: function (id) {
			var def = $q.defer();

			$http({
				url: URL.coupons+'/'+id,
                method: "DELETE"
			}).then(function (data) {
				def.resolve(data);
			}, function (error) {
				def.reject(error);
			});

			return def.promise;
		}
	}
});