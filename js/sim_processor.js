const BroadcastChannel = require('broadcast-channel')

function SimProcessor(parentDiv, plot) {
  _this = this
  _this.plot = plot
  _this.bc = new BroadcastChannel.default('sim_channel')
  _this.bc.onmessage = (ev) => processResults(ev)
  
  this.nameChannel = function (name) {
    _this.bc.close()
    _this.bc = new BroadcastChannel.default(name)
    _this.bc.onmessage = (ev) => processResults(ev)
  }

  var processResults = function(results){
    console.log(results)
    var data = results.data
    var y = data.y
    var sampleRate = data.sampleRate
    var heartRate = data.heartRate
    var x = []
    for (let i = 0; i < y.length; y++){
      x.push(sampleRate*i)
    }
    var processedResults = {
      'y': y,
      'x': x,
      'heartRate': heartRate
    }
    parentDiv.querySelector('#heart_rate').innerText += heartRate
    plot.addDataSeriesToChart(y, x, 'Sim Results')
  }
}

module.exports = SimProcessor