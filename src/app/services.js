(function(){

    // NodeJS Modules
    var Datastore = require('nedb');
    var path      = require('path');
    var fs        = require('fs');
    var mkdirp    = require('mkdirp');
    var gui       = require('nw.gui');

    // App data paths
    var data_path    = {};
    var img_path     = {};

    data_path.local  = path.join(gui.App.dataPath, 'data/local/');
    data_path.remote = path.join(gui.App.dataPath, 'data/remote/');
    img_path.local   = data_path.local + 'images/';
    img_path.remote  = data_path.remote + 'images/';

    // Database initialization
    db_init();

    // app services
    var app = angular.module('goldfish.services', []);

    app.service('gfDB', ['$q', function($q){
        // deferred update
        return {
            insert_doc: function(doc, dbname){
                var def = $q.defer();
                global.db[dbname].insert(doc, function(err, newDoc){
                    if (err) return def.reject(err);
                    else def.resolve(newDoc);
                });
                return def.promise;
            },
            update_doc: function(query, update, options, dbname){
                var def = $q.defer();
                // validation checks on args
                global.db[dbname].update(query, update, options, function(err, numReplaced){
                    if (err) return def.reject(err);
                    else def.resolve(numReplaced);
                });
                return def.promise;
            },
            remove_doc: function(query, options, dbname){
                var def = $q.defer();
                // validation checks on args
                global.db[dbname].remove(query, options, function(err, numRemoved){
                    if (err) return def.reject(err);
                    else def.resolve(numRemoved);
                });
                return def.promise;
            },
            find_docs: function(query, dbname){
                var def = $q.defer();
                if (global.db.hasOwnProperty(dbname)) {
                    global.db[dbname].find(query, function(err, docs){
                        if (err) def.reject(err);
                        else def.resolve(docs);
                    })
                }
                else{
                    def.reject(dbname+' not in db');
                }
                return def.promise;
            },
            get_all_docs: function(dbname){
                var def = $q.defer();
                if (global.db.hasOwnProperty(dbname)) {
                    global.db[dbname].find({}, function(err, docs){
                        if (err) def.reject(err);
                        else def.resolve(docs);
                    });
                }
                else{
                    def.reject(dbname+' not in db');
                }
                return def.promise;
            },
            get_latest_doc: function(dbname){
                var def = $q.defer();
                global.db[dbname].find({}).sort({_id:-1}).limit(1).exec(function(err, docs){
                    if (err) def.reject(err);
                    else def.resolve(docs);
                });
                return def.promise;
            },
            get_db: function(dbname){
                if (global.db.hasOwnProperty(dbname)){
                    return global.db[dbname];
                }
                return null;
            },
            create_db: function(dbname){
                var new_db_path = data_path.local + dbname + '.db';
                global.db[dbname] = new Datastore({
                    filename: new_db_path,
                    autoload: true
                });
            },
            delete_db: function(dbname){
                var cur_db_path = data_path.local + dbname + '.db';
                // remove from global db
                delete global.db[dbname];
                // delete the collection file
                fs.unlink(cur_db_path);
            }
        };
    }]);

    // spaced repetition system
    app.service('srs', ['$q', function($q){
        var similarity_measures = ['levenshtein'];
        var similar_text = function(str1, str2, algo){
            var def = $q.defer();
            // default text similarity algo
            if (typeof algo === 'undefined') {
                algo = 'levenshtein';
            }
            // levenshtein edit distance
            if (algo === 'levenshtein') {
                var lev = require('./app/srs/similar_text/levenshtein');
                def.resolve(lev(str1, str2));
            }
            return def.promise;
        }

        var schedule_job = function(card, collection_id, sim){
            var d = new Date();
            var def = $q.defer();

            if (!sim) sim = 0;
            // convert sim to 1 to 5 scale
            sim = sim/20;

            var dbname = 'col'+collection_id;

            global.db[dbname].findOne({_id: card._id}, function(err, card){
                if (err){
                    def.reject(err);
                }
                else{
                    var new_job_interval, new_efactor;
                    var target_date = new Date();

                    if (!card.hasOwnProperty('iteration')) {
                        new_job_interval = 1;
                        new_efactor      = 1.3;
                        card.iteration   = 0;
                    }
                    else if (card.iteration == 1){
                        new_job_interval = 6;
                        new_efactor      = card.efactor;
                    }
                    else{
                        // algo
                        new_efactor = card.efactor + (0.1-(5-sim)*(0.08+(5-sim)*0.02));

                        if (new_efactor < 1.3) new_efactor = 1.3;
                        else if(new_efactor > 2.5) new_efactor = 2.5;

                        new_job_interval = Math.round(card.interval*new_efactor);
                    }

                    target_date.setDate(d.getDate() + new_job_interval);
                    global.db[dbname].update(
                        {
                            _id: card._id
                        },
                        {
                            $set: {
                                scheduled_at: target_date,
                                iteration   : card.iteration + 1,
                                interval    : new_job_interval,
                                efactor     : new_efactor
                            }
                        },
                        {},
                        function(err, numReplaced){
                            if (err) def.reject(err);
                            else def.resolve(target_date);
                        }
                    );

                    // add job in job history db
                    var job_id = collection_id + '.' + card._id;
                    global.db['job_history'].update(
                        { _id: job_id },
                        {
                            $push: {
                                jobs:{
                                    iteration   : card.iteration + 1,
                                    interval    : new_job_interval,
                                    sim_score   : sim,
                                    efactor     : new_efactor,
                                    answered_on : new Date(),
                                    scheduled_at: target_date
                                }
                            }
                        },
                        { upsert: true },
                        function(err){
                            // new job created
                        }
                    );

                    // create an active job
                    var Active_job = require('./app/models/active_job')
                    var active_job = new Active_job({
                        collection_id : collection_id,
                        card_id       : card._id,
                        scheduled_date: target_date.toDateString()
                    });
                    global.db['active_jobs'].update(
                        { _id: job_id },
                        { $set: active_job },
                        { upsert: true },
                        function(err){
                            // new active job
                        }
                    );
                }
            });
            return def.promise;
        }

        return {
            similar_text: similar_text,
            schedule_job: schedule_job
        };
    }]);


    app.service('fsService', [function(){
        return {
            data_path   : data_path,
            delete_files: function(filenames, dir_path){
                for (var i = 0; i < filenames.length; i++) {
                    fs.unlink(dir_path + filenames[i]);
                }
            }
        }
    }]);

    app.service('ImageService', ['$q', function($q){
        return {
            save: function(filename, data){
                var img = decodeBase64Image(data);
                mkdirp(img_path.local, function(err){
                    if (err) console.error(err);
                    else {
                        var file_path = img_path.local + filename;
                        fs.writeFile(file_path, img.data, 'base64', function(err){
                            if (err) console.error(err);
                        });
                    }
                })
            }
        };
    }]);

    function db_init(){
        if (global.db) return;

        global.db       = {};

        var db_loc   = data_path.local;
        var db_name, db_path;

        // get all collection names from collection db
        var collection_db = new Datastore({
            filename: db_loc+'collections.db',
            autoload: true
        });

        // job history db
        var job_history_db = new Datastore({
            filename: db_loc+'job_history.db',
            autoload: true
        });

        // active job db
        var active_jobs_db = new Datastore({
            filename: db_loc+'active_jobs.db',
            autoload: true
        });

        collection_db.find({}, function(err, docs){
            if (err) {
                console.error(err);
            }
            else{
                // create new Datastores for all collection
                // (which will contain repsective cards)
                for (var i = 0; i < docs.length; i++) {
                    db_name = "col" + docs[i]._id.toString();
                    new_db_path = db_loc + db_name + '.db';
                    global.db[db_name] = new Datastore({
                        filename: new_db_path,
                        autoload: true
                    });
                }
            }
        });

        global.db['collections'] = collection_db;
        global.db['job_history'] = job_history_db;
        global.db['active_jobs']  = active_jobs_db;
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
