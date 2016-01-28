(function(){

    var gui = require('nw.gui');
    var app = angular.module('goldfish.controllers', []);

    app.controller('homeCtrl', ['$scope', '$rootScope', function($scope, $rootScope){

        // Check if tray icon exists, if not, create and store in $rootScope
        if (typeof $scope.main_window === 'undefined') {
            // Get main_window and add to $rootScope
            var main_window        = gui.Window.get();
            $rootScope.main_window = main_window;
            $scope.main_window.show();
        }

        // Check if tray icon exists
        if (typeof $scope.tray === 'undefined') {
            // Create and store in $rootScope
            var tray        = new gui.Tray({ title: 'GoldFish', icon: 'assets/images/goldfish.png' });
            $rootScope.tray = tray;

            // Create a menu for tray icon
            var menu      = new gui.Menu();
            var item_home = new gui.MenuItem({
                type : 'normal',
                label: 'GoldFish Home',
                click: function(){ $scope.main_window.show(); }
            });
            var item_close = new gui.MenuItem({
                type : 'normal',
                label: 'Close',
                click: function(){ $scope.main_window.close(); }
            });
            menu.append(item_home);
            menu.append(item_close);

            $scope.tray.menu = menu;
        }


        // Trigger qpoppup
        $rootScope.qpopup = null;
        $rootScope.trigger_qpopup = function(){
            $rootScope.qpopup = gui.Window.open(
                'index.html#/qpopup',
                {
                    title     : 'GoldFish Options',
                    toolbar   : false,
                    max_width : 300,
                    max_height: 500,
                    focus     : true
                }
            );
        };

        $scope.show_devtools = function(){
            $scope.main_window.showDevTools();
        };
        $scope.hide_win = function(){
            $scope.main_window.hide();
        };
    }]);

    app.controller('qpopupCtrl', ['$scope', function($scope){
        // pass
        $scope.dbdata = "something";
    }]);

    app.controller('settingsCtrl', ['$scope', function($scope){
        // pass
    }]);

    app.controller('sidebarCtrl', ['$scope', function($scope){
        $scope.items = [
            {
                icon_type: 'home',
                uri      : 'home',
                is_active: true   
            },
            {
                icon_type: 'settings',
                uri      : 'settings',
                is_active: false
            },
            {
                icon_type: 'dashboard',
                uri      : 'dashboard',
                is_active: false
            },
            {
                icon_type: 'my_library_add',
                uri      : 'add_set',
                is_active: false
            },
        ]
        $scope.sidebar_width = '64px';
        $scope.sidebar_full = false;

        $scope.update_active_item = function(active_item){
            for (var i = $scope.items.length - 1; i >= 0; i--) {
                $scope.items[i]['is_active'] = false;
                if( $scope.items[i]['icon_type'] === active_item['icon_type'])
                    $scope.items[i]['is_active'] = true;
            };
        }

        $scope.toggle_sidebar = function(){
            if(!$scope.sidebar_full) $scope.sidebar_width = '250px';
            else $scope.sidebar_width = '64px';
            $scope.sidebar_full = !$scope.sidebar_full;
        };
    }]);

    app.controller('titlebarCtrl', ['$scope', function($scope){
        $scope.is_max = false;

        $scope.icons = {
            'min': 'panorama_fisheye',
            'max': 'panorama_fisheye',
            'close': 'panorama_fisheye'
        };

        $scope.icon_fill = '#263238';

        $scope.toggle_is_max = function(){
            $scope.is_max = !$scope.is_max;
        }

        $scope.morph_icon = function(op){
            var icon_type;
            if (op === 'min') icon_type = 'expand_more';
            else if (op === 'max') icon_type = 'crop_square';
            else icon_type = 'close';
            $scope.icons[op] = icon_type;
        }

        $scope.unmorph_icon = function(op){
            $scope.icons[op] = 'panorama_fisheye';
        }

        $scope.win_minimize = function(){
            $scope.main_window.minimize();
        }

        $scope.win_maximize = function(){
            if(!$scope.is_max) $scope.main_window.maximize();
            else $scope.main_window.unmaximize();
            $scope.is_max = !$scope.is_max;
        }

        $scope.win_close = function(){
            $scope.main_window.close();
        }
    }]);

})();