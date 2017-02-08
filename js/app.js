

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
            status: function () {
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


app.controller('GitHubController', ['$scope', '$http', '$routeParams', 'gitHubInfo', '$rootScope', function ($scope, $http, $routeParams, gitHubInfo, $rootScope) {
    //$scope.gitHubUsername = '';
    $scope.tributeUserInfo = {};
    $scope.getUserInfo = getUserInfo;
    var imgUrl = '';
    //$scope.userRepos = {};


    function getUserInfo(user) {

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
            alert("User Not Found!")
        });
    };

    $scope.submit = function submit() {
        if ($scope.gitHubUsername) {
            getUserInfo($scope.gitHubUsername);
        } else {
            //Notify to user to enter soemthing
        }
    };
}]);

app.controller('repoController', ['$scope', '$http', 'gitHubInfo', '$rootScope', function ($scope, $http, gitHubInfo, $rootScope) {
    //$scope.reposUrl = userRepos.getProperty();//use this like reposUrl.url to get the url to make the next call out.
    var username = gitHubInfo.getUsername();
    $scope.repos = [];
    $rootScope.getRepos = getRepos;
    $scope.languages = new Object();
    $scope.languageArray = [];
    $scope.getLanguagesData = getLanguagesData;
    function getRepos(GhUser) {
        $http({
            method: 'GET',
            url: 'http://api.github.com/users/' + GhUser + '/repos?sort=updated'
        }).then(function successCallback(response) {
            $scope.repos = response.data;
        getLanguagesData(response.data).then(function(resolve,reject){
            
            var arrays = [['Task', 'Hours per Day'],
                ['Work', 11],
                ['Eat', 2],
                ['Commute', 2],
                ['Watch TV', 2],
['Sleep', 7]];
            let languageArray = [['Task', 'Hours per Day']];
            for(var language in $scope.languages){
                let newLang = [];
                newLang[0] = language;
                newLang[1] = $scope.languages[language];
                languageArray.push(newLang);
            }
            plotGraph("Tim",languageArray);
        });
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            alert("Error:  " + response)
        });
    }

    

    function getLanguagesData(repos) {
        return new Promise(function(resolve, reject) {
  // do a thing, possibly async, then…
  let count = 0;
  let asyncCallArray = [];
    for (var i = 0, repoLen = repos.length; i < repoLen; i++) {
            $http({
                method: 'GET',
                url: repos[i].languages_url

            }).then(function successCallback(response) {
                $scope.languageArray.push(response.data);
                $scope.languages.addObject(response.data);
                count++;
                if(repoLen == count){
                    resolve("This worked");
                    console.log($scope.languages);
                }
                
            }, function errCallback() {
                
            });

        }

});

    }

    function plotGraph(title,dataArrays/*data is expected to be an array of arrays with two items in each inner array.  The first array is the title of each column*/) {
        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {

            var data = google.visualization.arrayToDataTable(dataArrays); 

            var options = {
                title: title
            };

            var chart = new google.visualization.PieChart(document.getElementById('piechart'));

            chart.draw(data, options);
        }
    }

    function getAsyncCall(url){
        return new Promise(function(resolve,reject){
            $http({
                method: 'GET',
                url: url

            }).then(function successCallback(response) {
                $scope.languageArray.push(response.data);
                $scope.languages.addObject(response.data);
                
                    resolve("This worked");
                    console.log($scope.languages);
                
                
            }, function errCallback() {
                
            });
        })
    }
    //plotGraph();

    Object.defineProperty(Object.prototype, 'addObject', {
        value: function (newObject) {
            if (!angular.equals(newObject, {})) {
                for (var language in newObject) {
                    if (typeof (this[language]) == 'number') {
                        this[language] += newObject[language];
                    } else {
                        this[language] = newObject[language];
                    }
                }

            }
        },
        enumerable: false
    });


}]);
