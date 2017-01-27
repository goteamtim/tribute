

var app = angular.module('tributeApp', ["ngRoute"])
    .factory('gitHubInfo', function () {

        var username = '';
        var userInfo = {};
        var repoObject = {};
        var hasData = false;

        return {
            getUsername: function () {
                return username;
            },
            getUserInfo: function () {
                return userInfo;
            },
            getRepoInfo: function () {
                return repoObject;
            },
            setUsername: function (name) {
                username = name;
            },
            setUserInfo: function (info) {
                userInfo = info;
                hasData = true;
            },
            setRepoObject: function (info) {
                repoObject = info;
                hasData = true;
            },
            status: function(){
                return hasData;
            }
        }

    });

    

app.config(function ($routeProvider) {
    $routeProvider
        .when('/:user', {
            templateUrl: './index.html',
            controller: 'GitHubController'
        })
        .when('/', {
            templateUrl: './index.html',
            controller: 'GitHubController'
        })

        .otherwise({
            redirectTo: '/',
        });

});


app.controller('GitHubController', ['$scope', '$http', '$routeParams', 'gitHubInfo', '$rootScope',function ($scope, $http, $routeParams, gitHubInfo, $rootScope) {
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
            gitHubInfo.setUserInfo(response);
            $rootScope.getRepos(user);
            $scope.imgUrl = response.data.avatar_url;
            $("#myModal").modal('hide');
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log('User Not Found')
            //$("#myModal").modal('show');
            alert("User Not Found!")
            //Reload the page or something here
        });
    };

    $scope.submit = function submit() {
        console.log("submit entered");
        //Need to remove the div here as well
        if ($scope.gitHubUsername) {
            getUserInfo($scope.gitHubUsername);
            
            //Hiding the modal this way works but I might want to setup a callback for when the api calls are all finished so the user has something to look at.
        } else {
            //Notify to user to enter soemthing
        }
    };
}]);

app.controller('repoController', ['$scope', '$http', 'gitHubInfo', '$rootScope',function ($scope, $http, gitHubInfo, $rootScope) {
    //$scope.reposUrl = userRepos.getProperty();//use this like reposUrl.url to get the url to make the next call out.
    var username = gitHubInfo.getUsername();
    $scope.repos = [];
    $rootScope.getRepos = getRepos;
    $scope.languages = new Object();
    $scope.languageArray = [];
    $scope.getLanguagesData = getLanguagesData;
    function getRepos(GhUser){
        console.log("Getting Repos from the Repo controller");
        $http({
                method: 'GET',
                url: 'http://api.github.com/users/' + GhUser + '/repos?sort=updated'
            }).then(function successCallback(response) {
                $scope.repos = response.data;
                console.log(response.data[0]);
                getLanguagesData(response.data);
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                alert("Error:  " + response)
            });
    }

    function getLanguagesData(repos) {
        for (var i = 0, repoLen = repos.length; i < repoLen; i++) {
            $http({
                method: 'GET',
                url: repos[i].languages_url

            }).then(function successCallback(response){
                $scope.languageArray.push(response.data);
                //console.count('Language Added');
                $scope.languages.addObject(response.data);
                console.log($scope.languages);
            }, function errCallback(){

            });
            
        }
        
    }
    

    Object.defineProperty(Object.prototype,'addObject',{
        value: function (newObject){
        for(var language in newObject){
            console.log("typeof: " + typeof(language))
            if(this.hasOwnProperty(language)){
                //The property exisis, add the newObject value to this
                this[language] = +this[language] + +newObject.language;
            }else{
                this[language] = +newObject.language;
            }
        }
        console.log(this);
    },
        enumerable: false
    });
    

}]);
