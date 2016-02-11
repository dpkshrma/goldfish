var Model = require('nosql-schema-validator');

var job = {
    _id          : Number,
    collection_id: Number,
    card_id      : Number,
    created_at   : Date
};

var job = function(data){
    Model.call(this, schema, data);
}

job.prototype = Object.create(Model.prototype);

module.exports = job;
