var Model = require('nosql-schema-validator');

var schema = {
    _id         : Number,
    collection  : {
        id  : Number,
        name: String
    },
    created_at  : Date,
    question    : String,
    answer      : String,
    media       : String,
    scheduled_at: Date,
    interval    : Number,
    iteration   : Number,
    efactor     : Number
};

var card = function(data){
    Model.call(this, schema, data);
}

card.prototype = Object.create(Model.prototype);

module.exports = card;
