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
    var db = {};

    db_init(function(db_obj){
        db = db_obj;
    });

    // app services
    var app = angular.module('goldfish.services', []);

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
            update_doc: function(query, update, options, dbname){
                var def = $q.defer();
                // validation checks on args
                db[dbname].update(query, update, options, function(err, numReplaced){
                    if (err) return def.reject(err);
                    else def.resolve(numReplaced);
                });
                return def.promise;
            },
            remove_doc: function(query, options, dbname){
                var def = $q.defer();
                // validation checks on args
                db[dbname].remove(query, options, function(err, numRemoved){
                    if (err) return def.reject(err);
                    else def.resolve(numRemoved);
                });
                return def.promise;
            },
            get_all_docs: function(dbname){
                var def = $q.defer();
                if (db.hasOwnProperty(dbname)) {
                    db[dbname].find({}, function(err, docs){
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
                db[dbname].find({}).sort({_id:-1}).limit(1).exec(function(err, docs){
                    if (err) def.reject(err);
                    else def.resolve(docs);
                });
                return def.promise;
            },
            get_db: function(dbname){
                if (db.hasOwnProperty(dbname)){
                    return db[dbname];
                }
                return null;
            },
            create_db: function(dbname){
                var new_db_path = data_path.local + dbname + '.db';
                db[dbname] = new Datastore({
                    filename: new_db_path,
                    autoload: true
                });
            },
            delete_db: function(dbname){
                var cur_db_path = data_path.local + dbname + '.db';
                // remove from global db
                delete db[dbname];
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

        var schedule_job = function(card, collection, sim){
            var d = new Date();
            var def = $q.defer()
            var Job = require('./app/models/job');

            if (!sim) sim = 0;
            // convert sim to 1 to 5 scale
            sim = sim/20;

            // (every job has id of the form {col_id.card_id})
            var job_id = collection._id + '.' + card._id;

            // check if a job for the card exists
            db['jobs'].findOne({_id: job_id}, function(err, job){
                var target_date = new Date();
                if (job){
                    var new_job_interval, new_efactor;
                    if (job.iteration == 1){
                        new_job_interval = 6;
                        new_efactor      = job.efactor;
                    }
                    else{
                        // algo
                        new_efactor = job.efactor + (0.1-(5-sim)*(0.08+(5-sim)*0.02));

                        if (new_efactor < 1.3) new_efactor = 1.3;
                        else if(new_efactor > 2.5) new_efactor = 2.5;

                        new_job_interval = Math.round(job.interval*new_efactor);
                    }

                    target_date.setDate(d.getDate() + new_job_interval);
                    db['jobs'].update(
                        {
                            _id: job_id
                        },
                        {
                            $set: {
                                scheduled_at: target_date,
                                iteration   : job.iteration + 1,
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
                }
                else{
                    // else create new job
                    target_date.setDate(d.getDate()+1);
                    var job = new Job({
                        _id          : job_id,
                        collection_id: collection._id,
                        card_id      : card._id,
                        scheduled_at : target_date,
                        interval     : 1,
                        iteration    : 1,
                        efactor      : 1.3,
                        created_at   : d
                    });
                    db['jobs'].insert(job, function(err){
                        if (err) def.reject(err);
                        else def.resolve(target_date);
                    });
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
    }])

    function db_init(callback){
        var db       = {};
        var db_loc   = data_path.local;
        var db_name, db_path;

        // get all collection names from collection db
        var collection_db = new Datastore({
            filename: db_loc+'collections.db',
            autoload: true
        });

        // flash cards schedules db
        var jobs_db = new Datastore({
            filename: db_loc+'jobs.db',
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
                    db[db_name] = new Datastore({
                        filename: new_db_path,
                        autoload: true
                    });
                }
                db['collections'] = collection_db;
                db['jobs'] = jobs_db;
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
