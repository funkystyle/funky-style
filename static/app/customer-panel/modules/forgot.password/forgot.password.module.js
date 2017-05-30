angular.module("forgotPasswordModule", [ "satellizer", "toastr", "cgBusy"])
	.controller('forgotPasswordCtrl', function($scope, $http, $state, $stateParams, $auth, toastr){
		$scope.forgot = {};
		$scope.message = {};


		$scope.sendLink = function (obj) {
			console.log("Send forgot Password: ", obj);
			$scope.message = {};
			$scope.load = $http({
				url: "/api/1.0/auth/send-forgot-password-link",
				method: "POST",
				data: obj
			}).then(function (data) {
				console.log(data);
				toastr.success("Change password link has been sent to your Email!", "Please check your Email!");
				$state.go("main.home");
			}, function (error) {
				console.log(error);
				toastr.error(error.data._error.message, "Error!");
			});
		}
	});