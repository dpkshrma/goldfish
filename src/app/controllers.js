(function(){

    var gui   = require('nw.gui');
    var path  = require('path');
    var async = require('async');

    // Models
    var Card       = require('./app/models/card');
    var Collection = require('./app/models/collection');

    var app = angular.module('goldfish.controllers', ['goldfish.services', 'jsTag', 'ui.bootstrap', 'ngImgCrop']);

    /***************************/
    /* Main Window Controllers */
    /***************************/

    // Main Window Ctrl
    app.controller('mainWindowCtrl', ['$scope', '$rootScope', function($scope, $rootScope){
        // Check if tray icon exists, if not, create and store in $rootScope
        if (typeof $scope.main_window === 'undefined') {
            // Get main_window and add to $rootScope
            var main_window        = gui.Window.get();
            $rootScope.main_window = main_window;
            $scope.main_window.maximize();
            $scope.main_window.show();
            // $scope.main_window.showDevTools();
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
    }]);

    // Sidebar Ctrl
    app.controller('sidebarCtrl', ['$scope', function($scope){
        $scope.items = [
            {
                icon_type  : 'home',
                screen_name: 'home',
                is_active  : true
            },
            {
                icon_type  : 'dashboard',
                screen_name: 'dashboard',
                is_active  : false
            },
            {
                icon_type  : 'settings',
                screen_name: 'settings',
                is_active  : false
            }
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

    // Titlebar Ctrl
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


    /**********************************/
    /* Main Window Screen Controllers */
    /**********************************/

    // Home Screen Ctrl
    app.controller('homeScreenCtrl', ['$scope', '$rootScope', 'gfDB', function($scope, $rootScope, gfDB){
        // Trigger qpoppup
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

    // Dashboard Screen Ctrl
    app.controller('dashboardScreenCtrl', ['$scope', function($scope){
        function init(){
            // Subscreen visibility status
            $scope.show_subscreen = {
                collection_list: true,
                collection_form: false,
                card_list      : false,
                card_form      : false
            };

            // app data path
            $scope.app_datapath = gui.App.dataPath;

            // card list
            $scope.card_list = {};
            init_form();
        }

        function init_form(){
            $scope.form_err = "";
            $scope.inpt_img = "";
            $scope.img_loaded = false;
        }

        init();

        // Subscreen Transition
        $scope.change_subscreen = function(prev, cur){
            // clear all common scope variables
            init_form();
            // perform transition
            $scope.show_subscreen[prev] = false;
            $scope.show_subscreen[cur]  = true;
        };

        // Image handler
        $scope.handleImageSelect = function(evt) {
            var file = evt.currentTarget.files[0];
            if (file) {
                if (file.type.split('/')[0] === 'image') {
                    $scope.img_loaded = true;
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        $scope.$apply(function($scope){
                            $scope.inpt_img = evt.target.result;
                        });
                    };
                    reader.readAsDataURL(file);
                }
                else{
                    $scope.form_warn = "Only images supported at the moment";
                }
            }
            else{
                $scope.$apply(function(){
                    $scope.img_loaded = false;
                });
            }
        };
    }]);

    // Dashboard Screen : Collection List
    app.controller('dashboardCollectionListCtrl', ['$scope', 'gfDB', '$timeout', 'fsService', function($scope, gfDB, $timeout, fsService){
        var init = function(){
            $scope.flash_toggle_promises = {};
            $scope.collection_list = [];

            gfDB.get_all_docs('collections').then(
                function(docs){
                    $scope.collection_list = docs;
                }
            );
        }
        init();

        $scope.prepare_card_list = function(collection){
            // card_list initialized in dashboardScreenCtrl
            $scope.card_list.collection = collection;
            // get cards
            gfDB.get_all_docs('col'+collection._id.toString()).then(
                function(docs){
                    $scope.card_list.cards = docs;
                }
            )
            return true;
        }

        $scope.toggle_flash = function(collection){
            var col_id = collection._id;

            if ($scope.flash_toggle_promises[col_id]) {
                // check whether promise has been resolved
                if ($scope.flash_toggle_promises[col_id].alive){
                    $timeout.cancel($scope.flash_toggle_promises[col_id].promise);
                    delete $scope.flash_toggle_promises[col_id];
                    return;
                }
            }

            var promise_obj = {}
            promise_obj.alive = true;

            promise_obj.promise = $timeout(function(){
                var query   = {_id: col_id},
                    update  = {$set: {flash: collection.flash}},
                    options = {},
                    dbname  = 'collections';
                // flash toggle timout hit
                gfDB.update_doc(query, update, options, dbname);
            }, 1000);

            promise_obj.promise.then(
                function(){
                    // promise completed, db updated
                    promise_obj.alive = false;
                },
                function(){
                    // promise cancelled, db untouched
                }
            );

            // flash toggle timeout initialized
            $scope.flash_toggle_promises[col_id] = promise_obj;
        }

        $scope.confirm_delete = function(input, col_id){
            var collection;
            if (input == true) {
                // remove collection item from collection_list
                for (var i = 0; i < $scope.collection_list.length; i++) {
                    collection = $scope.collection_list[i];
                    if (collection._id == col_id) {
                        // remove collection from collection_list scope
                        $scope.collection_list.splice(i, 1);

                        // delete collection record from collection.db
                        var query = {_id: collection._id},
                            options = {},
                            dbname = 'collections';
                        gfDB.remove_doc(query, options, dbname);

                        var tbd_files = []; // to be deleted

                        // get collection media
                        tbd_files.push(collection.bg_img);

                        // get collection cards media
                        gfDB.get_all_docs('col'+collection._id.toString()).then(
                            function(docs){
                                for (var i = 0; i < docs.length; i++) {
                                    var doc = docs[i];
                                    tbd_files.push(doc.media);
                                }
                                // delete all files
                                var dir_path = fsService.data_path.local + 'images/';
                                fsService.delete_files(tbd_files, dir_path);
                            }
                        )

                        // delete col{id}.db (i.e. collection cards)
                        dbname = 'col'+collection._id.toString()
                        gfDB.delete_db(dbname);
                        break;
                    }
                }
            }
        }
    }]);

    // Dashboard Screen : Collection form
    app.controller('dashboardCollectionFormCtrl', ['$scope', 'JSTagsCollection', 'gfDB', 'ImageService', function($scope, JSTagsCollection, gfDB, ImageService){
        function init(){
            // Collection Form
            $scope.active_collection = {
                name    : '',
                keywords: '',
                bg_img  : ''
            }

            // Collection Form : JSTags
            $scope.active_collection.keywords = new JSTagsCollection([])
            $scope.jsTagOptions = {
                "texts": {
                    "inputPlaceHolder": "Add Keywords"
                },
                "tags": $scope.active_collection.keywords
            }

            // Collection Form : Uploading and Cropping Image
            $scope.active_collection.bg_img = '';
            var inpt_img = document.querySelector('#inpt_collection_img');
            angular.element(inpt_img).on('change',$scope.handleImageSelect);
        }

        init();

        // Collection Form : Validate data and insert into db
        $scope.add_collection = function(){
            var dbname     = 'collections';
            var img_ext    = '.png';
            var new_doc_id = 1;
            var uuid, img_name;

            if($scope.active_collection.name.length === 0){
                $scope.form_err = "Please use some name for the collection"
                return false;
            }

            async.waterfall([
                function(callback){
                    // bug workaround: cant get $scope.active_collection.bg_img
                    // in gfDB functions, maybe conflicting with service scope
                    var img_data = $scope.active_collection.bg_img;

                    // get last inserted doc's id from nedb
                    gfDB.get_latest_doc(dbname).then(
                        function(latest_doc){
                            if (latest_doc.length) {
                                new_doc_id = latest_doc[0]._id + 1;
                            }
                            callback(null, new_doc_id, img_data);
                        },
                        function(err){
                            callback(err, {});
                        }
                    );
                },
                function(doc_id, img_data, callback){
                    img_name = '';

                    // unique image name
                    if (img_data.length) {
                        uuid = new Date().getTime().toString();
                        img_name = uuid + img_ext;
                    }

                    // create new collection doc
                    var doc = new Collection({
                        _id       : doc_id,
                        name      : $scope.active_collection.name,
                        keywords  : $scope.active_collection.keywords.getTagValues(),
                        bg_img    : img_name,
                        source    : 'local',
                        flash     : true,
                        created_at: new Date()
                    });

                    // add collection to collections.db
                    gfDB.insert_doc(doc, dbname).then(
                        function(new_doc){
                            // create new collection db for storing cards
                            var dbname = 'col' + new_doc._id.toString();
                            gfDB.create_db(dbname);
                            callback(null, img_name, img_data, new_doc);
                        },
                        function(err){
                            callback(err, {});
                        }
                    );
                },
                function(img_name, img_data, new_doc, callback){
                    var result = {};
                    if (img_name.length) {
                        // save backgound image
                        ImageService.save(img_name, img_data);
                    }
                    result.new_doc = new_doc;
                    callback(null, result);
                }
            ],
            function(err, result){
                if (err) {
                    console.error(err);
                }

                // store collection info, for transition to card list subscreen
                $scope.card_list.collection = result.new_doc;

                // clear collection form
                $scope.active_collection.name = '';
                $scope.active_collection.bg_img = '';

                // Remove tags (removing keywords doesnt clear ui)
                for (i in $scope.active_collection.keywords.tags){
                    var tag = $scope.active_collection.keywords.tags[i];
                    $scope.active_collection.keywords.removeTag(tag.id);
                }
            });

            return true;
        }
    }]);

    // Dashboard Screen : Card List
    app.controller('dashboardCardListCtrl', ['$scope', function($scope){
        $scope.check_list = function(){
            return ($scope.card_list.hasOwnProperty('cards') && $scope.card_list.cards.length != 0);
        }
    }]);

    // Dashboard Screen : Card Form
    app.controller('dashboardCardFormCtrl', ['$scope', 'gfDB', 'ImageService', function($scope, gfDB, ImageService){
        // Card Form
        $scope.active_card = {
            question: '',
            answer  : '',
            media   : ''
        };

        // Card Form : Uploading and Cropping Image
        var inpt_img = document.querySelector('#inpt_card_img');
        angular.element(inpt_img).on('change',$scope.handleImageSelect);

        // Card Form : Validate data and insert into db
        $scope.add_card = function(){
            var img_ext    = '.png';
            var new_doc_id = 1;
            var uuid, img_name, dbname;
            var err        = "";

            if($scope.active_card.question.length === 0)
                err = "A Question is required"
            else if ($scope.active_card.answer.length === 0)
                err = "Please enter some answer for your question"

            if(err.length !=0){
                $scope.form_err = err;
                return false;
            }
            else{
                // add card to nedb
                dbname = 'col'+$scope.card_list.collection._id;

                async.waterfall([
                    function(callback){
                        // bug workaround: cant get $scope.active_collection.bg_img
                        // in gfDB functions, maybe conflicting with service scope
                        var img_data = $scope.active_card.media;

                        // get last inserted doc's id from nedb
                        gfDB.get_latest_doc(dbname).then(
                            function(latest_doc){
                                if (latest_doc.length) {
                                    new_doc_id = latest_doc[0]._id + 1;
                                }
                                callback(null, new_doc_id, img_data);
                            }
                        );
                    },
                    function(doc_id, img_data, callback){
                        img_name = '';

                        // unique image name
                        if (img_data.length) {
                            uuid = new Date().getTime().toString();
                            img_name = uuid + img_ext;
                        }

                        // create new collection doc
                        var doc = new Card({
                            _id       : doc_id,
                            collection: {
                                id  : $scope.card_list.collection._id,
                                name: $scope.card_list.collection.name
                            },
                            question  : $scope.active_card.question,
                            answer    : $scope.active_card.answer,
                            media     : img_name,
                            created_at: new Date()
                        });

                        // add collection to nedb
                        gfDB.insert_doc(doc, dbname).then(
                            function(new_doc){
                                // add new doc to card list
                                $scope.card_list.cards.push(new_doc);
                                callback(null, img_name, img_data);
                            },
                            function(err){
                                callback(err, false);
                            }
                        );
                    },
                    function(img_name, img_data, callback){
                        if (img_name.length) {
                            // save backgound image
                            ImageService.save(img_name, img_data);
                        }
                        callback(null, true);
                    }
                ],
                function(err, success){
                    if (err) {
                        console.error(err);
                    }
                    // clear collection form
                    clear_form();
                });
            }

            return true;
        };

        var clear_form = function(){
            $scope.active_card.question = '';
            $scope.active_card.answer   = '';
            $scope.active_card.media    = '';
        }

    }]);

    // Settings Screen Ctrl
    app.controller('settingsScreenCtrl', ['$scope', function($scope){
        // pass
    }]);


    /*****************************/
    /* Extra Windows Controllers */
    /*****************************/

    // Qpopup Ctrl
    app.controller('qpopupCtrl', ['$scope', function($scope){
        // pass
    }]);

})();
