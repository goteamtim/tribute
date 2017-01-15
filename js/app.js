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
    if($routeParams.user != null){
        alert("UserFound!");
    }

    $scope.getUserInfo = function getUserInfo(user) {
        $http({
            method: 'GET',
            url: 'http://api.github.com/users/' + user
        }).then(function successCallback(response) {
            
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
}]);