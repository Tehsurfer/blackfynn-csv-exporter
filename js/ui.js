// login creates logs a user in on the backend with given API keys
const dat = require('dat.gui');
const Choices = require('choices.js')
require('choices.js/public/assets/styles/choices.css')
require('.././css/main.css')
require('.././css/util.css')

function UI (parentDiv) {
  // parentDiv.querySelector('#dataset_div').style.display = 'none'
  // parentDiv.querySelector('#channel_div').style.display = 'none'
  // parentDiv.querySelector('#OpenCORLinkButton').style.display = 'none'
  // parentDiv.querySelector('#instructions_div').style.display = 'none'
  var _this = this
  _this.dataType = 'scatter'
  var gui = undefined
  var folder = undefined

  var settings = {}
  var checkboxes = []
  _this.checkboxElements = []
  _this.choice = undefined

  this.buildDatGui = function(exportObj){
    if (gui !== undefined){
      return
    }
    gui = new dat.GUI({autoPlace: false})
    gui.domElement.id = 'gui'
    gui.close()
    parentDiv.querySelector('.dat-gui-container').appendChild(gui.domElement)
    gui.add(exportObj, 'Show All')
    gui.add(exportObj, 'Hide All')
    gui.add(exportObj, 'Export as CSV')
    gui.add(exportObj, 'Open in OpenCOR') 
  }

 
  
  var clearSelect = function (select) { 
    if (select.options !== undefined){
      for (let a in select.options) { select.options.remove(0) }
    }
  }

  this.hideSelector = function(){
    parentDiv.querySelector('#channel_div').style.display = 'none'
  }
  this.showSelector = function(){
    parentDiv.querySelector('#channel_div').style.display = ''
  }

  this.hideDatGui = function(){
    parentDiv.querySelector('.dat-gui-container').style.display = 'none'
  }
  this.showDatGui = function(){
    parentDiv.querySelector('.dat-gui-container').style.display = ''
  }

   //Currently not working
   this.checkAllBoxes = function(){
    for (let i in _this.checkboxElements){
      _this.checkboxElements[i].__checkbox.checked = true
    }
  }

  // CreateChannelDropdown populates a dropdown box for the user to select a channel
  this.createSelectDropdown = function (channelsIn) {
    // _this.hideDatGui()
    _this.showSelector()
    var select, option
    select = parentDiv.querySelector('#select_channel')
    select.innerHTML = ''
    var channels = [...channelsIn]

    if (channels[0].toLowerCase().includes('time')){
      channels[0] = '-- Select A Channel --'
    }

    if (channels[0].toLowerCase().includes('name')){
      channels[0] = '-- Select A Sample --'
    }

    for (let i in channels) {
      option = document.createElement('option')
      option.value = option.text = channels[i]
      select.add(option)
    }
    if (_this.choice === undefined){
      _this.choice = new Choices(select)
      window.choice = _this.choice
    }
  }

  this.createSimDatGui = function(){
    if ( gui === undefined){
      _this.buildDatGui()
    }
    _this.hideSelector()
    _this.showDatGui()
    gui.add(simGui, 'Slider', 0, 50)
    gui.add(simGui, 'Parameter A')
    gui.add(simGui, 'Parameter B')
    gui.add(simGui, 'Parameter C')
    gui.add(simGui, 'Run Simulation')
  }

  var simGui = {
    Slider: 50,
    'Parameter A': false,
    'Parameter B': false,
    'Parameter C': false,
    'Run Simulation': () => simRun()
  }

  var simRun = function(){
    console.log('running simulation with parameters', simGui.Slider, simGui['Parameter A'], simGui['Parameter B'])
  }

  this.createDatGuiDropdown = function (channels, onchangeFunc) {
    _this.hideSelector()
    _this.showDatGui()
    _this.channels = [...channels]
    folder = gui.addFolder('Channels')
    if (channels[0].toLowerCase().includes('time')){
      channels.shift()
    }
    if (_this.checkboxElements.length > 0){
      for(let i in _this.checkboxElements){
        folder.remove(_this.checkboxElements[i])
      }
    }
    _this.checkboxElements = []
    checkboxes = []
    for (let i in _this.channels) {
      let name = _this.channels[i]
      let checkbox = {}
      checkbox[name] = false
      checkboxes.push(checkbox)
      var el = folder.add(checkboxes[i], name)
      _this.checkboxElements.push(el)
      el.__checkbox.onclick = () => onchangeFunc(name, Number(i)+1, checkboxes[i][name])
    }
    folder.open()
   
  }  
}

module.exports = UI
