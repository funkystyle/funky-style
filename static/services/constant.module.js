angular.module("constantModule", [])
    .constant("mainURL", "http://localhost:8888/")
    .constant('URL', {
        getProjects: "/api/1.0/blog"
    });