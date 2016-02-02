var Model = require('nosql-schema-validator');

var card = function(data){
    var schema = {
        id      : Number,
        set     : String,
        category: String,
        question: String,
        options: [
          {
            id  : Number,
            text: String
          }
        ],
        media: [
          {
            id  : String,
            name: String,
            type: String,
            path: String
          }
        ]
    };
    Model.call(this, schema, data);
};

card.prototype = Object.create(Model.prototype);

module.exports = card;
