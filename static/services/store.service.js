
angular.module("storeFactoryModule", ["constantModule"])
    .factory('storeFactory', ['$http', '$q', 'URL', function ($http, $q, URL) {
        return {
            get: function (finalUrl) {
                var url = (finalUrl) ? finalUrl: URL.stores;
                var def = $q.defer();
                $http({
                    url: url+'?rand_number' + new Date().getTime(),
                    method: "GET",
                    headers: {
                        "Content-Encoding": "gzip"
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
                    url: URL.stores+"?where="+JSON.stringify(obj)+'&rand_number='+Math.random(),
                    method: "GET",
                    headers: {
                        "Content-Encoding": "gzip"
                    }
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
                    url: URL.stores+'?rand_number='+Math.random(),
                    method: "POST",
                    data: obj,
                    headers: {
                        "authorization": token,
                        "Content-Encoding": "gzip"
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
                    url: URL.stores+'/'+obj._id+'?rand_number='+Math.random(),
                    method: "PATCH",
                    headers: {
                        authorization: token,
                        "Content-Encoding": "gzip"
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
                    url: URL.stores+'/'+id+'?rand_number='+Math.random(),
                    method: "DELETE",
                    "Content-Encoding": "gzip"
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
