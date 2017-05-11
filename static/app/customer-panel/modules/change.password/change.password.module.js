angular.module("changePasswordModule", ["constantModule"])
	.controller('changePasswordCtrl', function($scope, $http, mainURL, URL){
		$scope.change = {};
		$scope.message = {};

		$scope.changePassword = function (obj) {
			$scope.message = {};

			var object = {
				user_id: "",
				token: "",
				new_password: obj.new_password
			}
			$http({
				url: mainURL + URL.changePassword,
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
	});