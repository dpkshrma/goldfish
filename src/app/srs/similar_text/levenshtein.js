var lev = function(s, t){
    if (s == t){
        var res = {
            distance  : 0,
            similarity: 100
        };
        return res;
    }
    if (s.length == 0){
        var res = {
            distance  : t.length,
            similarity: 0
        };
        return res;
    }

    var v0 = [], v1 = [];

    for(var i=0; i < t.length+1; i++){
        v0[i] = i;
    }

    for(var i=0; i < s.length; i++){
        v1[0] = i+1;
        for(var j=0; j< t.length; j++){
            var cost = (s[i]==t[j])?0:1;
            v1[j+1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }
        for(var j=0; j<v0.length; j++)
            v0[j] = v1[j];
    }

    var lev_dist = v1[t.length];
    var bigger = Math.max(s.length, t.length);
    var match = parseFloat((bigger-lev_dist)/bigger)*100;
    // round off 2 dec
    match = Math.round(match*100)/100;

    var res = {
        distance  : lev_dist,
        similarity: match
    };
    return res;
}

module.exports = lev;
