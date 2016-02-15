var Model = require('nosql-schema-validator');

var schema = {
    _id          : String,
    jobs         : [{
        iteration   : Number,
        interval    : Number,
        sim_score   : Number,
        efactor     : Number,
        answered_on : Date,
        scheduled_at: Date
    }]
};

var job_history = function(data){
    Model.call(this, schema, data);
}

job_history.prototype = Object.create(Model.prototype);

module.exports = job_history;
