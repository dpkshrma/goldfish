(function(){
    var gui = require('nw.gui');
    var win = gui.Window.get();

    var app = angular.module('goldfish.controllers', [])

    app.controller('settingsCtrl', ['$scope', function($scope){
        $scope.show_devtools = function(){
            win.showDevTools();
        };
    }]);

    app.controller('sidebarCtrl', ['$scope', function($scope){
        $scope.sidebar_width = '64px';
        $scope.sidebar_full = false;
        $scope.toggle_sidebar = function(){
            if(!$scope.sidebar_full) $scope.sidebar_width = '250px';
            else $scope.sidebar_width = '64px';
            $scope.sidebar_full = !$scope.sidebar_full;
        };
    }]);

    app.controller('titlebarCtrl', ['$scope', function($scope){
        $scope.isMax = false;

        $scope.icons = {
            'min': 'panorama_fisheye',
            'max': 'panorama_fisheye',
            'close': 'panorama_fisheye'
        };

        $scope.icon_fill = '#263238';

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
            win.minimize();
        }
        $scope.win_maximize = function(){
            if(!$scope.isMax) win.maximize();
            else win.unmaximize();
            $scope.isMax = !$scope.isMax;
        }
        $scope.win_close = function(){
            win.close();
        }
    }]);

})();