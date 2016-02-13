var Model = require('nosql-schema-validator');

var schema = {
    _id          : String,
    collection_id: Number,
    card_id      : Number,
    scheduled_at : Date,
    interval     : Number,
    iteration    : Number,
    efactor      : Number,
    created_at   : Date
};

var job = function(data){
    Model.call(this, schema, data);
}

job.prototype = Object.create(Model.prototype);

module.exports = job;
