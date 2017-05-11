/**
* categoryServiceModule Module
*
* Description
*/
angular.module('blogFactoryModule', ['constantModule'])
.factory("blogFactory", function ($http, $q, URL) {
	return {
		get: function (url) {
			var def = $q.defer();
			$http({
				url: URL.blog,
				method: "GET"
			}).then(function (data) {
				def.resolve(data);
			}, function (error) {
				def.reject(error);
			});

			return def.promise;
		},

		// get particular category
		getBlog: function (url) {
            var obj = {};
            obj['url'] = url;
            var query = URL.blog+"&where="+JSON.stringify(obj);

            var def = $q.defer();

			$http({
				url: query,
				method: "GET"
			}).then(function (data) {
				def.resolve(data);
			}, function (error) {
				def.reject(error);
			});

			return def.promise;
		},

		// post a category
		post: function (data) {
			var def = $q.defer();

			$http({
				url: URL.blog,
				method: "POST",
				data: data
			}).then(function (data) {
				def.resolve(data);
			}, function (error) {
				def.reject(error);
			});

			return def.promise;
		},

		// update category
		update: function (obj, token) {
			var def = $q.defer();
            $http({
                url: URL.blog+'/'+obj._id,
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

		// delete category
		delete: function (id) {
			var def = $q.defer();

            $http({
                url: URL.blog+'/'+id,
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