/**
 * dealServiceModule Module
 *
 * Description
 */
angular.module('dealFactoryModule', ['constantModule'])
    .factory("dealFactory", function ($http, $q, URL) {
        return {
            get: function () {
                var def = $q.defer();

                $http({
                    url: URL.deals,
                    method: "GET"
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },

            // get particular deal
            getdeal: function (id) {
                var def = $q.defer();

                $http({
                    url: URL.deals,
                    method: "GET"
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },

            // post a deal
            post: function (data) {
                var def = $q.defer();

                $http({
                    url: URL.deals,
                    method: "POST",
                    data: data
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },

            // update deal
            update: function (obj, token) {
                var def = $q.defer();

                $http({
                    url: URL.deals+'/'+obj._id,
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

            // delete deal
            delete: function (id) {
                var def = $q.defer();

                $http({
                    url: URL.deals+'/'+id,
                    method: "DELETE"
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },

            // Deal brands starts here
            get_deal_brands: function () {
                var def = $q.defer();

                $http({
                    url: URL.deal_brands,
                    method: "GET"
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },
            post_deal_brands: function (data) {
                var def = $q.defer();

                $http({
                    url: URL.deal_brands,
                    method: "POST",
                    data: data
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },
            delete_deal_brands: function (id) {
                var def = $q.defer();

                $http({
                    url: URL.deal_brands+'/'+id,
                    method: "DELETE"
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },
            update_deal_brands: function (obj, token) {
                var def = $q.defer();

                $http({
                    url: URL.deal_brands+'/'+obj._id,
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

            // Deal Categories starts here
            get_deal_categories: function () {
                var def = $q.defer();

                $http({
                    url: URL.deal_categories,
                    method: "GET"
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },
            post_deal_categories: function (data) {
                var def = $q.defer();

                $http({
                    url: URL.deal_categories,
                    method: "POST",
                    data: data
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },
            delete_deal_categories: function (id) {
                var def = $q.defer();

                $http({
                    url: URL.deal_categories+'/'+id,
                    method: "DELETE"
                }).then(function (data) {
                    def.resolve(data);
                }, function (error) {
                    def.reject(error);
                });

                return def.promise;
            },
            update_deal_categories: function (obj, token) {
                var def = $q.defer();

                $http({
                    url: URL.deal_categories+'/'+obj._id,
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
            }

        }
    });