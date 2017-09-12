angular.module("updateBlogModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "blogFactoryModule", "naif.base64"])
    .controller("updateBlogCtrl", function($scope, $timeout, toastr, storeFactory, $state, $stateParams, $http,
                                        $auth, personFactory, $log, couponFactory, categoryFactory, URL, blogFactory) {
        $scope.blog = {};
        $scope.status = ["Pending", "Draft", "Trash", "Verified", "Publish"];
        $scope.categories = [];
        $scope.blogs = [];
        $scope.breadcrumbs = [];

        if($auth.isAuthenticated() && $stateParams['id']) {
            // get all categories
            categoryFactory.get().then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.categories = data.data._items;
                    angular.forEach($scope.categories, function (item) {
                        $scope.breadcrumbs.push({
                            name: item.name,
                            url: item.url,
                            _id: item._id
                        });
                    });
                }
            }, function (error) {
                console.log(error);
            });

            // get all Blogs
            var embedded = {
                "related_categories": 1,
                "related_blogs": 1
            };
            $http({
                url: URL.blog+"?embedded="+JSON.stringify(embedded)+"&rand="+Math.random(),
                method: "GET"
            }).then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.blogs = data.data._items;
                    angular.forEach($scope.blogs, function (item) {
                        if(item._id == $stateParams.id) {
                            item.related_categories = clearNullIds(item.related_categories);
                            item.related_blogs = clearNullIds(item.related_blogs);
                            $scope.blog = item;
                        }
                    });
                }
            }, function (error) {
                console.log(error);
            });
        }


        // update store now
        $scope.updateBlog = function (blog) {

            if(typeof blog.image === 'object') {
                blog.image = "data:image/jpeg;base64,"+blog.image.base64;
            }

            blog.last_modified_by = $scope.user._id;

            delete blog._created;
            delete blog._updated;
            delete blog._links;

            console.log(blog);
            blogFactory.update(blog, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(blog.title+" Updated!", "Success");
                $state.go("header.blog");
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, error.data._error.code);
            });
        }

    });