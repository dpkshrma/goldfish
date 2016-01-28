(function(){
    'use strict';
    var app = angular.module('goldfish', ['ngRoute', 'ngMdIcons', 'ui.bootstrap', 'goldfish.controllers', 'goldfish.directives']);
    app.config(['$routeProvider',function($routeProvider) {
        $routeProvider.
            when('/', {
                'templateUrl': 'partials/home.html',
                'controller': 'homeCtrl'
            }).
            when('/home', {
                redirectTo: '/'
            }).
            when('/settings', {
                'templateUrl': 'partials/settings.html',
                'controller': 'settingsCtrl'
            }).
            when('/qpopup',{
                'templateUrl': 'partials/qpopup.html',
                'controller': 'qpopupCtrl'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);
})();