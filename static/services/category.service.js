/**
* categoryServiceModule Module
*
* Description
*/
angular.module('categoryServiceModule', ['constantModule'])
.factory("categoryFactory", function ($http, $q, URL) {
	return {
		get: function (url) {
			var def = $q.defer();
			$http({
				url: URL.categories,
				method: "GET"
			}).then(function (data) {
				def.resolve(data);
			}, function (error) {
				def.reject(error);
			});

			return def.promise;
		},

		// get particular category
		getcategory: function (url) {
            var obj = {};
            obj['url'] = url;
            var query = URL.categories+"&where="+JSON.stringify(obj);

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
				url: URL.categories,
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
                url: URL.categories+'/'+obj._id,
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
                url: URL.categories+'/'+id,
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