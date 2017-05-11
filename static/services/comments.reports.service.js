angular.module('commentsReportsFactoryModule', ['constantModule'])
.factory("commentsReportsFactory", function ($http, $q, URL) {
	return {
		get: function (url) {
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

		// post a category
		post: function (data, url) {
			var def = $q.defer();

			$http({
				url: url,
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
		update: function (obj, token, url) {
			var def = $q.defer();
            $http({
                url: url+'/'+obj._id,
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
		delete: function (id, url) {
			var def = $q.defer();

            $http({
                url: url+'/'+id,
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