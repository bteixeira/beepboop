db.guesses.mapReduce(function(){  emit(this.imageId, this.correct); }, function (key, values) { return     values.filter((x)=>x).length / values.length ; }, {out:{inline:1}})