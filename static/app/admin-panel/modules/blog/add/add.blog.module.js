angular.module("addBlogModule", ["ui.select", "ngSanitize", "ui.bootstrap", "toastr",
    "storeFactoryModule", "satellizer", "personFactoryModule", "cgBusy",
    "couponFactoryModule", "categoryFactoryModule", "constantModule", "blogFactoryModule"])
    .controller("addBlogCtrl", function($scope, $timeout, toastr, storeFactory,
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
            blog.last_modified_by = $scope.user._id;
            console.log(blog);

            blogFactory.post(blog).then(function (data) {
                console.log(data);
                toastr.success(blog.title+' Created', "Created!");
            }, function (error) {
                console.log(error);
                if(error.data._error) {
                    toastr.error(error.data._error.message, error.data._error.code);
                }
            });
        }

    });