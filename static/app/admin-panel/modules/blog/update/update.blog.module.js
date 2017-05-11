angular.module("updateBlogModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "blogFactoryModule"])
    .controller("updateBlogCtrl", function($scope, $timeout, toastr, storeFactory, $state, $stateParams,
                                        $auth, personFactory, $log, couponFactory, categoryFactory, URL, blogFactory) {
        $scope.blog = {};
        $scope.status = ["Pending", "Draft", "Trash", "Verified", "Publish"];
        $scope.categories = [];
        $scope.blogs = [];

        if($auth.isAuthenticated() && $stateParams['id']) {
            // get all categories
            categoryFactory.get().then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.categories = data.data._items;
                }
            }, function (error) {
                console.log(error);
            });

            // get all Blogs
            blogFactory.get().then(function (data) {
                console.log(data);
                if(data['data']) {
                    $scope.blogs = data.data._items;
                    angular.forEach($scope.blogs, function (item) {
                        if(item._id == $stateParams.id) {
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
            delete blog._created;
            delete blog._updated;
            delete blog._links;

            console.log(blog);
            blogFactory.update(blog, $auth.getToken()).then(function (data) {
                console.log(data);
                toastr.success(blog.title+" Updated!", "Success");
            }, function (error) {
                console.log(error);
                toastr.error(error.data._error.message, error.data._error.code);
            });
        }

    });