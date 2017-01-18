

var app = angular.module('tributeApp', ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
    .when('/:user', {
        templateUrl: './index.html',
        controller:'GitHubController'
    })
    .when('/',{
        templateUrl: './index.html',
        controller: 'GitHubController'
    })

        .otherwise({
        redirectTo: '/',
    });
    
});


app.controller('GitHubController', ['$scope', '$http','$routeParams', function ($scope, $http, $routeParams) {
    $scope.gitHubUsername = '';

    $scope.getUserInfo = getUserInfo;
    
    function getUserInfo(user) {
        console.log("gettingUserInfo")
        $http({
            method: 'GET',
            url: 'http://api.github.com/users/' + user
        }).then(function successCallback(response) {
            console.log(response);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };

    $scope.submit = function submit() {
          console.log("submit entered");
          //Need to remove the div here as well
        if ($scope.gitHubUsername) {
          getUserInfo($scope.gitHubUsername);
        }else{
            //Notify to user to enter soemthing
        }
      };
}]);


		
