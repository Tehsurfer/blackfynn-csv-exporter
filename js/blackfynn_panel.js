/**
* BlackfynnPanel is used for making calls to blackfynn to collect timeseries data and plot it using plotly
*/

require('select2/dist/css/select2.min.css')
require('.././css/main.css')
require('.././css/util.css')
const UI = require('./ui.js')
const PlotManager = require('./plot_manager.js')
const CsvManager = require('./csv_manager.js')
const StateManager = require('./state_manager.js')
const BroadcastChannel = require('broadcast-channel')
var $ = require('jquery')



// Need to load select2 and blackfynnManger once the DOM is ready
// $(document).ready(function () {

// })


// BlackfynnManager(): Manages the HTTP requests to the backend, Tehsurfer/Physiome-Blackfynn-API 
//                     and drives the plot and ui modules.
function BlackfynnManager(targetDiv) {
  var ui = undefined
  var parentDiv = undefined
  var plot = undefined
  var csv = undefined
  var state = undefined
  var _this = this
  var loggedIn = false
  var multiplot = false
  var bc = new BroadcastChannel.default('plot_channel')
  _this.plot = plot

  if (targetDiv === null || targetDiv === undefined){
    parentDiv = document.getElementById('blackfynn-panel')
  } else {
    parentDiv = targetDiv
  }
  

  // initialiseBlackfynnPanel: sets up ui and plot, needs DOM to be loaded
  this.initialiseBlackfynnPanel = function () {
    ui = new UI(parentDiv)
    plot = new PlotManager(parentDiv)
    csv = new CsvManager()
    _this.csv = csv
    state = new StateManager(parentDiv)
  }

  this.openBroadcastChannel = function(name){
    bc.close()
    bc = new BroadcastChannel.default(name)
  }

  this.sendChannelMessage = function(message){
    bc.postMessage(message)
  }

  var csvChannelCall = function(){
    var selectedIndex = ui.choice.getValue().choiceId
    var selectedChannel = csv.getHeaderByIndex(selectedIndex)
    plot.addDataSeriesToChart(csv.getColoumnByIndex(selectedIndex),csv.getColoumnByIndex(0), selectedChannel)
    state.selectedChannels.push(selectedIndex-1)
    bc.postMessage({'state': _this.exportStateAsString()})
  }

  var checkBoxCall = function(channel, index, flag){
    if (!flag) {
      plot.addDataSeriesFromDatGui(csv.getColoumnByIndex(index), csv.getColoumnByIndex(0), channel, index)
      state.selectedChannels.push(index)
    }
    else {
      plot.removeSeries(index)
      ch_ind = state.selectedChannels.indexOf(index)
      state.selectedChannels.splice( ch_ind, ch_ind + 1)
    }
    bc.postMessage({'state': _this.exportStateAsString()})
  }


  this.openCSV = function(url){
    return new Promise(function(resolve, reject){
      csv.loadFile(url).then( _ =>{
        _this.setDataType(csv.getDataType())
        ui.showSelector()
        ui.buildDatGui(exportObject)
        var headers = [...csv.getHeaders()]
        headers.shift()
        if (state.plotAll) {
          _this.plotAll()
        }
        if( headers.length < 100){ 
          ui.createDatGuiDropdown(headers, checkBoxCall)
        } else {
          ui.createSelectDropdown(headers)
          parentDiv.querySelector('#select_channel').onchange = csvChannelCall
        }
        state.csvURL = url
        state.selectedChannels = []
        if (!state.plotAll){
          _this.plotByIndex(1)
          _this.updateSize() 
        }

        resolve()
      })
    })
  }

  var exportObject = {      
    'Export as CSV': () => csv.export(state),
    'Open in OpenCOR': () => csv.exportForOpenCOR(state),
    'Show All': () => _this.plotAll(),
    'Hide All': () => _this.hideAll()
  }






  var openCSVfromState = function(url){
    return new Promise(function(resolve, reject){
      if (url === undefined){
        console.log('Error! Not loading any data into chart!')
        reject()
      }
      csv.loadFile(url).then( _ =>{
        _this.setDataType(csv.getDataType())
        ui.showSelector()
        var headers = [...csv.getHeaders()]
        headers.shift()
        if (state.plotAll) {
          _this.plotAll()
        } else {
          if( headers.length < 100){ 
            ui.buildDatGui(exportObject)
            ui.createDatGuiDropdown(headers, checkBoxCall)
          } else {
            ui.createSelectDropdown(headers)
            parentDiv.querySelector('#select_channel').onchange = csvChannelCall
            ui.buildDatGui(exportObject)
          }
          if (!state.plotAll && state.selectedChannels.length === 0){
            _this.plotByIndex(1)
            _this.updateSize() 
          }
        }
        
        resolve()
      })
    })
  }

  this.plotAll = function(){
    plot.plotAll(csv.getAllData())
    ui.hideSelector()
    if (csv.getHeaders().length < 100){  
      for (let i in ui.checkboxElements){
          ui.checkboxElements[i].__checkbox.checked = true
      } 
    }

    setTimeout( _this.updateSize, 1000)
    state.plotAll = true
  }

  this.hideAll = function(){
    _this.clearChart()
    if (csv.getHeaders().length > 100){
      ui.showSelector()
      _this.plotByIndex(1)
    } else {
      if (csv.getHeaders().length < 100) {
        ui.checkboxElements[0].__checkbox.click()
        for (let i in ui.checkboxElements){
          ui.checkboxElements[i].__checkbox.checked = false
        }
        plot.indexList = []
      }
    }
    setTimeout( _this.updateSize, 1000)     
    state.plotAll = false
  }

  this.setSubplotsFlag = function(flag){
    plot.subplots = flag  
    state.subplots = flag
  }

  this.setDataType = function(dataType){
    plot.plotType = dataType
    state.plotType = dataType
    ui.dataType = dataType
  }

  this.plotByIndex = function(index){
    var channelName = csv.getHeaderByIndex(index)
    plot.addDataSeriesToChart(csv.getColoumnByIndex(index), csv.getColoumnByIndex(0), channelName)
    state.selectedChannels.push(index)
  }

  this.plotByNamePromise = function(channelName){
    return new Promise(function(resolve, reject) {
      plot.addDataSeriesToChart(csv.getColoumnByName(channelName), csv.getColoumnByIndex(0), channelName)
      resolve()
    })
  }

  this.plotByIndexPromise = function(index){
    return new Promise(function(resolve, reject) {
      var channelName = csv.getHeaderByIndex(index)
      plot.addDataSeriesToChart(csv.getColoumnByIndex(index), csv.getColoumnByIndex(0), channelName)
      resolve()
    })
  }

  this.plotByName = function(channelName){
    plot.addDataSeriesToChart(csv.getColoumnByName(channelName), csv.getColoumnByIndex(0), channelName)
    var index = csv.getHeaders().indexOf(channelName)
    state.selectedChannels.push(index-1)
  }

  this.clearChart = function(){
    plot.resetChart()
  }

  this.exportStateAsString = function(){
    return JSON.stringify(state)
  }

  this.exportState = function(){
    return state
  }

  this.exportCSV = function(){
    csv.export(state)
  }

  this.exportToOpenCOR = function(){
    csv.exportToOpenCOR(state)
  }

  this.loadState = function(jsonString){
    return new Promise(function(resolve, reject){
      _this.clearChart()
      state.loadFromJSON(jsonString)
      openCSVfromState(state.csvURL).then( _ => {
        plot.plotType = state.plotType
        plot.subplots = state.subplots
        if (state.selectedChannels !== undefined){
          if (state.selectedChannels.length > 0){
            if (!state.plotAll) {
              plotStateChannels(state.selectedChannels)
            }
          }
        }

        resolve()
      })
    })
  }

  var plotStateChannels = function(channels){
    _this.plotByIndexPromise(channels[0]+1).then(_ => {
      for (let i = 0; i <channels.length; i++){
        if (i === 0){
          plot.indexList.push(channels[i])
          continue
        }
        ui.checkboxElements[channels[i]].__checkbox.click()
        plot.indexList.push(channels[i])
      }
    })
    if (csv.getHeaders().length < 100) {
      for (let i in channels){
        ui.checkboxElements[channels[i]].__checkbox.click()
        plot.indexList.push(channels[i])
      }
    }
  }

  this.listenOn = function(name){
    _this.bc2 = new BroadcastChannel.default(name)
    _this.bc2.onmessage = (ev) => processResults(ev)
  }

  var processResults = function(event){
    data = JSON.parse(event.data.data)
    sampleRate = data.sampleRate
    ydata = data.y
    xaxis = []
    for (let i = 0; i < ydata.length; i++){
      xaxis.push(i*sampleRate)
    }
    plot.addDataSeriesToChart(ydata, xaxis, 'results')
  }

  this.initialiseForSim = function(){
    ui.createSimDatGui()
  }


  var initialiseObject = function(){

  }

  this.updateSize = function(){
    var dataset_div = parentDiv.querySelector('#dataset_div')
    var chart_height = parentDiv.clientHeight - dataset_div.offsetHeight

    plot.resizePlot(parentDiv.clientWidth, chart_height)
  }
  _this.initialiseBlackfynnPanel()
  initialiseObject()

}

exports.BlackfynnManager = BlackfynnManager
