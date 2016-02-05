(function(){
    app = angular.module('goldfish.directives', [])

    // Main Window Titlebar
    app.directive('gfTitlebar', function(){
        return {
            restrict   : 'E',
            templateUrl: 'partials/titlebar.html',
            controller : 'titlebarCtrl'
        };
    });

    // Main Window Sidebar
    app.directive('gfSidebar', function(){
        return {
            restrict   : 'E',
            templateUrl: 'partials/sidebar.html',
            controller : 'sidebarCtrl'
        };
    });

    // Main Window Screens
    app.directive('gfHomeScreen', function(){
        return {
            retrict    : 'E',
            templateUrl: 'partials/screens/home.html',
            controller : 'homeScreenCtrl'
        };
    });
    app.directive('gfSettingsScreen', function(){
        return {
            retrict    : 'E',
            templateUrl: 'partials/screens/settings.html',
            controller : 'settingsScreenCtrl'
        };
    });
    app.directive('gfDashboardScreen', function(){
        return {
            retrict    : 'E',
            templateUrl: 'partials/screens/dashboard.html',
            controller : 'dashboardScreenCtrl'
        };
    });

    // Dashboard Subscreens
    app.directive('gfDashboardCollectionList', function(){
        return {
            templateUrl: 'partials/screens/dashboard/collection_list.html',
            controller: 'dashboardCollectionListCtrl'
        }
    })
    app.directive('gfDashboardCardList', function(){
        return {
            templateUrl: 'partials/screens/dashboard/card_list.html',
            controller: 'dashboardCardListCtrl'
        }
    })
    app.directive('gfDashboardCollectionForm', function(){
        return {
            templateUrl: 'partials/screens/dashboard/collection_form.html',
            controller: 'dashboardCollectionFormCtrl'
        }
    })
    app.directive('gfDashboardCardForm', function(){
        return {
            templateUrl: 'partials/screens/dashboard/card_form.html',
            controller: 'dashboardCardFormCtrl'
        }
    })

    // Button to change current screen
    app.directive('changescreen', function($compile){
        return function(scope, element, attrs){
            element.bind('click', function(){
                var scr_container = angular.element(document.getElementById('gf-screen-container'));
                var screen_name   = attrs.changescreen;
                var tag           = "<gf-"+screen_name+"-screen></gf-"+screen_name+"-screen>";

                scr_container.html("");
                scr_container.append($compile(tag)(scope));
            });
        };
    });

})();
