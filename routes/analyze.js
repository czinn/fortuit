var BIN_SIZE = 10;

module.exports = function(predictions) {
  var obj = {};

  var bins = [];
  for(var i = 0; i < Math.ceil(99 / BIN_SIZE); i++) {
    bins.push({correct: 0, total: 0});
  }
  predictions.forEach(function(prediction) {
    var bin = Math.floor(prediction.confidence / BIN_SIZE);
    bins[bin].total += 1;
    if(prediction.affair.result)
      bins[bin].correct += 1;
  });

  var results = [];
  for(var i = 0; i < bins.length; i++) {
    var count = 0;
    var total = 0;
    for(var j = -2; j <= 2; j++) {
      if(i + j >= 0 && i + j < bins.length) {
        var weight = j * j === 4 ? 1 : (j === 0 ? 6 : 2);
        count += weight;
        if(bins[i + j].total > 0)
          total += weight * bins[i + j].correct / bins[i + j].total;
      }
    }
    results.push({
      x: i * BIN_SIZE + Math.round(BIN_SIZE / 2),
      y: Math.round(total / count * 100)
    });
  }

  obj.barGraph = {
    bars: results,
    binSize: BIN_SIZE
  };

  return obj;
};