(function(){
    app = angular.module('goldfish.directives', [])
    app.directive('titlebar', function(){
        return {
            restrict: 'E',
            templateUrl: 'partials/titlebar.html',
            controller: 'titlebarCtrl'
        };
    });
    app.directive('sidebar', function(){
        return {
            restrict: 'E',
            templateUrl: 'partials/sidebar.html',
            controller: 'sidebarCtrl'
        };
    });
})();