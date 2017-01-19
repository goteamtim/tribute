

var app = angular.module('tributeApp', ["ngRoute"])
.factory('gitHubInfo', function () {
        
        var username = '';

        return {
            getUsername: function(){
                return username;
            },
            setUsername: function(name){
                username = name;
            }
        }
        
});;

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


app.controller('GitHubController', ['$scope', '$http','$routeParams','gitHubInfo', function ($scope, $http, $routeParams, gitHubInfo) {
    //$scope.gitHubUsername = '';
    $scope.tributeUserInfo = {};
    $scope.getUserInfo = getUserInfo;
    var imgUrl = '';
    //$scope.userRepos = {};
    
    
    function getUserInfo(user) {
        console.log("gettingUserInfo")
        
        gitHubInfo.setUsername(user);
        $http({
            method: 'GET',
            url: 'http://api.github.com/users/' + user
        }).then(function successCallback(response) {
            
            $scope.tributeUserInfo = response;
            console.log(response);
        $scope.imgUrl = response.data.avatar_url;
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
          $("#myModal").modal('hide');
          //Hiding the modal this way works but I might want to setup a callback for when the api calls are all finished so the user has something to look at.
        }else{
            //Notify to user to enter soemthing
        }
      };
}]);

app.controller('repoController',['$scope','$http','gitHubInfo', function($scope,$http, gitHubInfo){
    //$scope.reposUrl = userRepos.getProperty();//use this like reposUrl.url to get the url to make the next call out.
    var username = gitHubInfo.getUsername();
    $http({
            method: 'GET',
            url: 'http://api.github.com/users/' + username.username + '/repos'
        }).then(function successCallback(response) {
            console.log(response)
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
}]);
