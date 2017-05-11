angular.module("forgotPasswordModule", ["constantModule"])
	.controller('forgotPasswordCtrl', function($scope, $http, mainURL, URL){
		$scope.forgot = {};
		$scope.message = {};


		$scope.sendLink = function (obj) {
			$scope.message = {};
			$http({
				url: mainURL + URL.sendForgetPasswordLink,
				method: "POST",
				data: obj
			}).then(function (data) {
				console.log(data);
				$scope.message = {
					error: fasle,
					success: true,
					text: data.data,
					type: "Success!"
				};
			}, function (error) {
				console.log(error);

				$scope.message = {
					error: true,
					text: error.data.error,
					type: "Error!"
				};
			});
		}
	})