

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
    $scope.languages = new Object;
    $scope.topLanguageCount = 0;
    $scope.topLanguage = "";
    $scope.languageArray = [];
    $scope.getLanguagesData = getLanguagesData;
    $scope.showProgressBar = true;
    $scope.languageChartReady = false;
    function getRepos(GhUser) {
        $http({
            method: 'GET',
            url: 'http://api.github.com/users/' + GhUser + '/repos?sort=updated'
        }).then(function successCallback(response) {
            $scope.repos = response.data;
            $http({
                    method: 'GET',
                    url: response.data[0].languages_url
                }).then(function successCallback(response) {
                    let tempLangArray = [['Language', 'Lines of Code']];
                    for(var language in response.data){
                        let formattedLang = [];
                        formattedLang[0] = language;
                        formattedLang[1] = response.data[language];
                        tempLangArray.push(formattedLang);
                    }
                    plotGraph({title:"",backgroundColor: "#FFF1D0"},tempLangArray,"recentRepoLanGraph");
                });
            getLanguagesData(response.data).then(function (resolve, reject) {
                let languageArray = [['Task', 'Hours per Day']];
                for (var language in $scope.languages) {
                    let newLang = [];
                    newLang[0] = language;
                    newLang[1] = $scope.languages[language];
                    languageArray.push(newLang);
                }
                plotGraph({title:"GitHub Language Usage Data",backgroundColor: "#F0C808"}, languageArray, "allLanguagesChart");
                
            });
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            alert("Error:  " + response)
        });
    }



    function getLanguagesData(repos) {
        return new Promise(function (resolve, reject) {
            let count = 0;
            let asyncCallArray = [];
            let progressBarPercent = 100/repos.length;
            for (var i = 0, repoLen = repos.length; i < repoLen; i++) {
                $http({
                    method: 'GET',
                    url: repos[i].languages_url

                }).then(function successCallback(response) {

                    $scope.languageArray.push(response.data);
                    $scope.languages.addObject(response.data);
                    count++;
                    updateProgressBar(progressBarPercent,"languagesStatus");
                    
                    if (repoLen == count) {
                        resolve("This worked");
                        $scope.showProgressBar = false;
                        $scope.languageChartReady = true;
                        for(var key in $scope.languages){
                        if($scope.topLanguageCount < +$scope.languages[key] ){
                            $scope.topLanguageCount = +$scope.languages[key];
                            $scope.topLanguage = key;
                        }
                        console.log("Top Language: " + $scope.topLanguage);
                    }
                    }

                }, function errCallback(response) {
                    count++;
                    updateProgressBar(progressBarPercent, "languagesStatus");
                    if (repoLen == count) {
                        resolve("Failed but handling");
                        $scope.showProgressBar = false;
                        $scope.languageChartReady = true;
                    }
                    console.log(response.data.message + " for " + response.config.url);
                });

            }

        });

    }

    function updateProgressBar(updateAmount, elementID) {
        var bar = document.getElementById(elementID);
        let current = bar.style.width;
        current = current.substr(0, current.length - 1);
        let newTotal = (+current + +updateAmount)
        bar.style.width = newTotal + "%";
    }

    function plotGraph(options, dataArrays, elementID) {
        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {
            var data = google.visualization.arrayToDataTable(dataArrays);
            var chart = new google.visualization.PieChart(document.getElementById(elementID));
            chart.draw(data, options);
        }
    }

    function getLargestObjProperty(myObject){
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                var element = object[key];
                
            }
        }
    }

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
