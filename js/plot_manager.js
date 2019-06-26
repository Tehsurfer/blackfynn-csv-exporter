// plot_manager.js, manages the plot and its data
const Plotly = require('plotly.js/dist/plotly-basic.min.js')

function PlotManager(parentDiv) {
  var chartDiv = parentDiv.querySelector('#chart_div')
  var self = this
  self.plot = undefined
  

  this.createChart = function (createChartData, samplesPerSecond, id) {
    document.getElementById("slider").onchange = sliderAdjusted
    if (self.plot !== undefined) {
      Plotly.purge(chartDiv)
    }
    // self.initialiseResizeListener(parentDiv)

    var times = []
    for (var i in createChartData) {
      times.push(i / samplesPerSecond)
    }

    var chartData = processData(createChartData, times, id)

    var chartOptions = {
      title: 'Selected Channels Plot ',
      xaxis: {
        type: 'seconds',
        title: 'Seconds'
      },
      yaxis: {
        autorange: true,
        type: 'linear',
        title: 'mV'
      }
    }
    self.plot = Plotly.react(chartDiv, chartData, chartOptions)
  }

  this.resetChart = function () {
    if (self.plot !== undefined) {
      Plotly.purge(chartDiv)
      self.plot = undefined
    }
  }

  this.clearChart = function () {
    if (self.plot !== undefined) {
      Plotly.purge(chartDiv)
    }
  }

  this.addDataSeriesToChart = function (newSeries, samplesPerSecond, id) {

    if (self.plot === undefined){
      self.createChart(newSeries, samplesPerSecond, id)
      return
    }

    var times = []
    for (var i in newSeries) {
      times.push(i / samplesPerSecond)
      window.times = times
    }
    var newData = processData(newSeries, times, id)
    Plotly.addTraces(chartDiv, newData)
  }

  var processData = function (unprocessedData, times, id) {
    var dataTrace = {
      type: 'scatter',
      name: id,
      mode: 'lines',
      visible: true,
      x: times,
      y: unprocessedData,
      line: {
        color: '#' + (Math.random() * 0xFFFFFF << 0).toString(16)
      }
    }
    return [dataTrace]
  }

  this.resizePlot = function( width, height ){
    Plotly.relayout(chartDiv, {
      width: width,
      height: height
    })
  }

  this.initialiseResizeListener = function (resizeObject) {
    resizeObject.addEventListener('resize', _ => {
      Plotly.relayout(chartDiv, {
        width: resizeObject.innerWidth - 130,
        height: resizeObject.innerHeight - 150
      })
    })
  }

  var sliderAdjusted = function(){
    console.log('in slider adjusted')
    var slider = document.getElementById("slider")
    var chart = document.getElementById('chart_div')
    var adjustedX = []
    for (i in chart.data)
      adjustedX = []
      if (chart.data[i].visible === true) {
        for (j in chart.data[i].x){
          adjustedX.push(chart.data[i].x[j] + Number(slider.value)/1000)
        }
        Plotly.update(chart, {x: [adjustedX]}, i)
      }
    slider.value = 0
  }
}

module.exports = PlotManager
