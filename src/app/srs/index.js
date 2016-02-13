var similarity_measures = ['levenshtein'];
var similar_text = function(str1, str2, algo){
    // default text similarity algo
    if (typeof algo === 'undefined') {
        algo = 'levenshtein';
    }
    // levenshtein edit distance
    if (algo === 'levenshtein') {
        var lev = require('./similar_text/levenshtein');
        return lev(str1, str2);
    }
}

var schedule_job = function(jobDB, card, collection, sim){
    var Job = require('../models/job');

    var d = new Date();

    // (every job has id of the form {col_id.card_id})
    var job_id = collection._id + '.' + card._id

    // check if a job for the card exists
    jobDB.findOne({_id: job_id}, function(err, job){
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

                new_job_interval = round(job.interval*new_efactor);
            }

            target_date.setDate(d.getDate() + new_job_interval);
            jobDB.update(
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
                function(err, numReplaced, newDoc){
                    if (err) return console.error(err);
                    return newDoc;
                }
            );
        }
        else{
            // else create new job
            target_date.setDate(d.getDate()+1);
            console.log(target_date);
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
            console.log(job);
            jobDB.insert(job, function(err, newDoc){
                return newDoc;
            });
        }
    });
}

module.exports = {
    similar_text: similar_text,
    schedule_job: schedule_job
}
