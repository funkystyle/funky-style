angular.module("personFactoryModule", ['constantModule'])
.factory("personFactory", function ($http, mainURL, URL, $q) {
    return {
        getAll: function (token) {
            var d = $q.defer();
            $http({
                url: URL.persons,
                headers: {
                    authorization: token
                },
                method: "GET"
            }).then(function (data) {
                console.log(data);
                d.resolve(data);
            }, function (error) {
                console.log(error);
                d.reject(error);
            });

            return d.promise;
        },
        getPerson: function (id, token) {
            var d = $q.defer();
            $http({
                url: URL.persons+'/'+id,
                headers: {
                    authorization: token
                },
                method: "GET"
            }).then(function (data) {
                console.log(data);
                d.resolve(data);
            }, function (error) {
                console.log(error);
                d.reject(error);
            });

            return d.promise;
        },
        me: function () {
            var d = $q.defer();
            $http({
                url: URL.me,
                method: "GET"
            }).then(function (data) {
                d.resolve(data);
            }, function (error) {
                console.log(error);
                d.reject(error);
            });

            return d.promise;
        },
        update: function (obj, token) {
            var d = $q.defer();
            $http({
                url: URL.persons+"/"+obj._id,
                headers: {
                    authorization: token
                },
                data: obj,
                method: "PATCH"
            }).then(function (data) {
                console.log(data);
                d.resolve(data);
            }, function (error) {
                console.log(error);
                d.reject(error);
            });

            return d.promise;
        },
        create: function (data) {
            var d = $q.defer();
            $http({
                url: URL.register,
                data: data,
                method: "POST"
            }).then(function (data) {
                console.log(data);
                d.resolve(data);
            }, function (error) {
                console.log(error);
                d.reject(error);
            });

            return d.promise;
        },
        delete: function (collection, array) {
            var d = $q.defer();
            $http({
                url: URL.deleteDocuments,
                data: [{"resource_name": collection, "ids": array}],
                method: "POST"
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
});