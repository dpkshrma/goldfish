(function(){
    app = angular.module('goldfish.directives', [])

    // Main Windoe Titlebar
    app.directive('gfTitlebar', function(){
        return {
            restrict: 'E',
            templateUrl: 'partials/titlebar.html',
            controller: 'titlebarCtrl'
        };
    });

    // Main Window Sidebar
    app.directive('gfSidebar', function(){
        return {
            restrict: 'E',
            templateUrl: 'partials/sidebar.html',
            controller: 'sidebarCtrl'
        };
    });

    // Main Window Screens
    app.directive('gfHomeScreen', function(){
        return {
            retrict: 'E',
            templateUrl: 'partials/screens/home.html',
            controller: 'homeScreenCtrl'
        };
    });
    app.directive('gfSettingsScreen', function(){
        return {
            retrict: 'E',
            templateUrl: 'partials/screens/settings.html',
            controller: 'settingsScreenCtrl'
        };
    });
    app.directive('gfDashboardScreen', function(){
        return {
            retrict: 'E',
            templateUrl: 'partials/screens/dashboard.html'
        };
    });
    app.directive('gfAddsetsScreen', function(){
        return {
            retrict: 'E',
            templateUrl: 'partials/screens/addsets.html'
        };
    });

    // Button to change current screen
    app.directive('changescreen', function($compile){
        return function(scope, element, attrs){
            element.bind('click', function(){
                var scr_container = angular.element(document.getElementById('gf-screen-container'));
                scr_container.html("");
                var screen_name = attrs.changescreen;
                var tag = "<gf-"+screen_name+"-screen></gf-"+screen_name+"-screen>";
                scr_container.append($compile(tag)(scope));
            });
        };
    });

})();