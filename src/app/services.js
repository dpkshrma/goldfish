(function(){

    // NeDB
    var Datastore = require('nedb');
    var path      = require('path');
    var fs        = require('fs');
    var mkdirp    = require('mkdirp');
    var gui       = require('nw.gui');

    var app       = angular.module('goldfish.services', []);

    var img_dir   = path.join(gui.App.dataPath, 'data/images/');
    var db        = {};

    db_init(function(db_obj){
        db = db_obj;
    });

    app.service('gfDB', ['$q', function($q){
        // deferred update
        return {
            insert_doc: function(doc, dbname){
                var def = $q.defer();
                db[dbname].insert(doc, function(err, newDoc){
                    if (err) return def.reject(err);
                    else def.resolve(newDoc);
                });
                return def.promise;
            },
            get_all_docs: function(dbname){
                var def = $q.defer();
                db[dbname].find({}, function(err, docs){
                    if (err) def.reject(err);
                    else def.resolve(docs);
                });
                return def.promise;
            },
            get_latest_doc: function(dbname){
                var def = $q.defer();
                db[dbname].find({}).sort({_id:-1}).limit(1).exec(function(err, docs){
                    if (err) def.reject(err);
                    else def.resolve(docs);
                });
                return def.promise;
            }
        };
    }]);

    app.service('ImageService', ['$q', function($q){
        return {
            save: function(filename, data){
                var img = decodeBase64Image(data);
                mkdirp(img_dir, function(err){
                    var img_path = img_dir + filename;
                    if (err) console.log(err);
                    else {
                        fs.writeFile(img_path, img.data, 'base64', function(err){
                            if (err) console.log(err);
                        });
                    }
                })
            }
        };
    }])

    function db_init(callback){
        var db       = {};
        var db_loc   = path.join(gui.App.dataPath, 'data/');
        var db_name, db_path;

        // get all collection names from collection db
        var collection_db = new Datastore({
            filename: db_loc+'collections.db',
            autoload: true
        });

        collection_db.find({}, function(err, docs){
            if (err) {
                console.error(err);
            }
            else{
                for (var i = 0; i < docs.length; i++) {
                    db_name = "col"+docs[i]._id.toString();
                    db_path = db_loc + db_name + '.db';
                    db[db_name] = new Datastore({
                        filename: db_path,
                        autoload: true
                    });
                }
                db['collections'] = collection_db;
                callback(db);
            }
        });
    }

    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        return response;
    }

})();
