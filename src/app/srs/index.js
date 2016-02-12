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

var schedule_job = function(){

}

module.exports = {
    similar_text: similar_text,
    schedule: schedule_job
}
