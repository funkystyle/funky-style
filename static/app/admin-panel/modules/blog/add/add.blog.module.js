angular.module("addBlogModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "blogFactoryModule", "naif.base64"])
    .controller("addBlogCtrl", function($scope, $timeout, toastr, storeFactory, $state, $stateParams,
                                        $auth, personFactory, $log, couponFactory, categoryFactory, URL, blogFactory) {
        $scope.blog = {
            breadcrumb: []
        };
        $scope.status = ["Pending", "Draft", "Trash", "Verified", "Publish"];
        $scope.categories = [];
        $scope.blogs = [];
        // get all categories
        categoryFactory.get().then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.categories = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });

        $scope.$watch('blog.title', function(newVal, oldVal) {
            $scope.blog.url = (newVal) ? newVal.replace(/\s/g, "-").toLowerCase() +"-blog" : undefined;
        }, true);

        // get all Blogs
        blogFactory.get().then(function (data) {
            console.log(data);
            if(data['data']) {
                $scope.blogs = data.data._items;
            }
        }, function (error) {
            console.log(error);
        });


        // add blog now
        $scope.addBlog = function (blog) {

            if(blog.image && Object.keys(blog.image).length) {
                blog.image = "data:image/jpeg;base64,"+blog.image.base64;
            } else {
                toastr.error("Please select Blog Image", "Error!");
                return false;
            }

            blog.last_modified_by = $scope.user._id;
            console.log(blog);

            blogFactory.post(blog).then(function (data) {
                console.log(data);
                toastr.success(blog.title, "Created!");
                $state.go("header.blog");
            }, function (error) {
                console.log(error);
                if(error.data._error) {
                    toastr.error(error.data._error.message, error.data._error.code);
                }
            });
        }

    });