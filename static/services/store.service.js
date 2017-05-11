
angular.module("storeFactoryModule", ["constantModule"])
    .factory('storeFactory', ['$http', '$q', 'URL', function ($http, $q, URL) {
        return {
            get: function (token) {
                var def = $q.defer();
                $http({
                    url: URL.stores,
                    method: "GET",
                    headers: {
                        authorization: token
                    }
                }).then(function (data) {
                    def.resolve(data.data);
                }, function (error) {
                    def.reject(error.data);
                });
                return def.promise;
            },
            getStore: function (query) {
                var obj = {};
                obj['url'] = query.query;
                var def = $q.defer();
                $http({
                    url: URL.stores+"&where="+JSON.stringify(obj),
                    method: "GET"
                }).then(function (data) {
                    console.log(data);
                    def.resolve(data)
                }, function (error) {
                    def.reject(error.data);
                });
                return def.promise;
            },
            insert: function (obj, token) {
                var def = $q.defer();
                $http({
                    url: URL.stores,
                    method: "POST",
                    data: obj,
                    headers: {
                        authorization: token
                    }
                }).then(function (data) {
                    def.resolve(data.data);
                }, function (error) {
                    def.reject(error.data);
                });
                return def.promise;
            },
            update: function (obj, token) {
                var def = $q.defer();
                $http({
                    url: URL.stores+'/'+obj._id,
                    method: "PATCH",
                    headers: {
                        authorization: token
                    },
                    data: obj
                }).then(function (data) {
                    def.resolve(data.data);
                }, function (error) {
                    def.reject(error.data);
                });
                return def.promise;
            },
            delete: function (id) {
                var d = $q.defer();
                $http({
                    url: URL.stores+'/'+id,
                    method: "DELETE"
                }).then(function (data) {
                    console.log(data);
                    d.resolve(data);
                }, function (error) {
                    console.log(error);
                    d.reject(error);
                });

                return d.promise;
            }
        }
    }])
