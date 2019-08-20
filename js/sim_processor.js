const BroadcastChannelD = require('broadcast-channel')

function SimProcessor(parentDiv, plot) {
  window.ourBC = BroadcastChannelD.default
  var _this = this
  _this.plot = plot
  _this.bc = new (BroadcastChannelD.default)('sim_channel')
  _this.bc.onmessage = (ev) => {processResults(ev)}
  
  this.nameChannel = function (name) {
    _this.bc.close()
    _this.bc = new BroadcastChannelD.default(name)
    _this.bc.onmessage =  this.processResults
  }

  var processResults = function(results){
    var data = results.data
    var v = data.v
    var heartRate = data.heartRate
    var x = []
    for (let i = 0; i < v.length; i++){
      x.push(i)
    }
    var processedResults = {
      'v': v,
      'heartRate': heartRate
    }
    parentDiv.querySelector('#heart_rate').innerText = 'Heart rate: ' + heartRate
    parentDiv.querySelector('#heart_rate').style.visibility = 'visible'
    plot.addDataSeriesToChart(y, x, 'Sim Results')
  }
}

module.exports = SimProcessor