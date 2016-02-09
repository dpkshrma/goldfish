var Model = require('nosql-schema-validator');

var schema = {
    _id       : Number,
    name      : String,
    keywords  : [{
        type: String
    }],
    bg_img    : String,
    source    : String,
    flash     : Boolean,
    created_at: Date
};

var collection = function(data){
    Model.call(this, schema, data);
}

collection.prototype = Object.create(Model.prototype);

module.exports = collection;
