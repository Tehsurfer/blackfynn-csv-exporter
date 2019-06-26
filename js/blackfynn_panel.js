/**
* BlackfynnPanel is used for making calls to blackfynn to collect timeseries data and plot it using plotly
*/

require('.././node_modules/select2/dist/css/select2.min.css')
require('.././css/main.css')
require('.././css/util.css')
const UI = require('./ui.js')
const PlotManager = require('./plot_manager.js')
const CsvManager = require('./csv_manager.js')
const StateManager = require('./state_manager.js')
var $ = require('jquery')
require('select2')

// Need to load select2 and blackfynnManger once the DOM is ready
$(document).ready(function () {

})


// BlackfynnManager(): Manages the HTTP requests to the backend, Tehsurfer/Physiome-Blackfynn-API 
//                     and drives the plot and ui modules.
function BlackfynnManager() {
  var ui = undefined
  var parentDiv = undefined
  var plot = undefined
  var csv = undefined
  var state = undefined
  var _this = this
  var loggedIn = false
  _this.baseURL = 'http://127.0.0.1:82/'

  // initialiseBlackfynnPanel: sets up ui and plot, needs DOM to be loaded
  this.initialiseBlackfynnPanel = function () {
    parentDiv = document.getElementById('blackfynn-panel')
    ui = new UI(parentDiv)
    plot = new PlotManager(parentDiv)
    csv = new CsvManager()
    state = new StateManager(parentDiv)

    _this.examplePlotSetup()
    parentDiv.querySelector('#select_channel').onchange = channelCall


  }

  this.examplePlotSetup = function(){
    channelNames = ['one', 'two', 'three']
    ui.createChannelDropdown(channelNames)
    data = [1,2,3,4]
    samplesPerSecond = 1
    plot.createChart(data, samplesPerSecond, data.length, channelNames[0])
  }

  var channelCall = function(){
    selectedChannel = $('#select_channel :selected').text()
    data = {
      'one': [1,2,3,4],
      'two': [2,2,3,4],
      'three': [3,2,3,4]
    }
    samplesPerSecond = 1

    plot.addDataSeriesToChart(data[selectedChannel], samplesPerSecond, selectedChannel)

  }

  var csvChannelCall = function(){
    selectedChannel = $('#select_channel :selected').text()
    plot.addDataSeriesToChart(csv.getColoumnByName(selectedChannel), csv.getSampleRate(), selectedChannel)
    state.selectedChannels.push(selectedChannel)
  }


  this.openCSV = function(url){
    return new Promise(function(resolve, reject){
      csv.loadFile(url, ()=>{
        ui.createChannelDropdown(csv.getHeaders())
        // plot.addDataSeriesToChart(csv.getColoumnByIndex(1), csv.getSampleRate(), csv.getHeaderByIndex(1))
        parentDiv.querySelector('#select_channel').onchange = csvChannelCall
        state.setURL(url)
        resolve()
      })
    })
  }

  this.plotByIndex = function(index){
    var channelName = csv.getHeaderByIndex(index)
    plot.addDataSeriesToChart(csv.getColoumnByIndex(index), csv.getSampleRate(), channelName)
    state.selectedChannels.push(channelName)
  }

  this.plotByName = function(channelName){
    plot.addDataSeriesToChart(csv.getColoumnByName(channelName), csv.getSampleRate(), channelName)
    state.selectedChannels.push(channelName)
  }

  this.clearChart = function(){
    plot.clearChart()
  }

  this.exportState = function(){
    return JSON.stringify(state)
  }

  this.loadState = function(jsonString){
    state.loadFromJSON(jsonString)
    _this.openCSV(state.csvURL).then( _ => {
      state.loadFromJSON(jsonString)
      for (i in state.selectedChannels){
        _this.plotByName(state.selectedChannels[i])
      }
    })
    
  }


  var initialiseObject = function(){
    $('.js-select2').each(function () {
      $(this).select2({
        minimumResultsForSearch: 20
      })
      $('.js-select2').each(function () {
        $(this).on('select2:close', function (e) {
          $('.js-show-service').slideUp()
          $('.js-show-service').slideDown()
        })
      })
    })
  
    _this.initialiseBlackfynnPanel()
    _this.updateSize()
    // _this.openCSV('https://blackfynnpythonlink.ml/data/F9NBX1.csv')
  }

  this.updateSize = function(){
    var blackfynn_panel = document.getElementById('blackfynn-panel')
    var dataset_div = document.getElementById('dataset_div')
    var chart_height = blackfynn_panel.clientHeight - dataset_div.offsetHeight - 70

    plot.resizePlot(blackfynn_panel.clientWidth, chart_height)
  }
  initialiseObject()

}

exports.BlackfynnManager = BlackfynnManager