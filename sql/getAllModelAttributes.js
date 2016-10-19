// Mongo
db.models.mapReduce(function(){for(var p in this.attributes){emit(p,1);}},  function(key,values){return Array.sum(values);},    {out:{inline:1}})