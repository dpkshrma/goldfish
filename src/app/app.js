(function(){
    'use strict';
    var app = angular.module('goldfish', ['ngRoute', 'ngMdIcons', 'ui.bootstrap', 'goldfish.controllers', 'goldfish.directives']);
    app.config(['$routeProvider',function($routeProvider) {
        $routeProvider.
            when('/', {
                'templateUrl': 'partials/main_window.html',
                'controller': 'mainWindowCtrl'
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