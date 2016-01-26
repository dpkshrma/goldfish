(function(){
    'use strict';
    var app = angular.module('goldfish', ['ngRoute', 'ngMdIcons', 'ui.bootstrap', 'goldfish.controllers', 'goldfish.directives']);
    app.config(['$routeProvider',function($routeProvider) {
        $routeProvider.when('/', {
            'templateUrl': 'partials/settings.html',
            'controller': 'settingsCtrl'
        });
    }]);
})();