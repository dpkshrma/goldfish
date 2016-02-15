(function(){
    'use strict';
    var app = angular.module('goldfish',[
        'ngRoute',
        'ngMdIcons',
        'ui.bootstrap',
        'angularGrid',
        'uiSwitch',
        'angularMoment',
        'goldfish.controllers',
        'goldfish.directives'
    ]);

    // https://github.com/urish/angular-moment/issues/194#issuecomment-154767249
    var moment_mod = require('moment');
    app.constant('moment', moment_mod);

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
