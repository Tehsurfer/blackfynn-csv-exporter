Tehsurfer/blackfynn-csv-exporter
[![Netlify Status](https://api.netlify.com/api/v1/badges/75636c30-c9c2-41d4-8499-ee2826664aac/deploy-status)](https://app.netlify.com/sites/bf-export/deploys)
======
A Web viewer for viewing and exporting data from Blackfynn to CSV format for OpenCOR

View the current online version at:
https://blackfynnpythonlink.ml/blackfynn-csv-exporter/

Devloper Installation
------
1. `git clone https://github.com/Tehsurfer/blackfynn-csv-exporter.git`
2. Install [Node.js](https://nodejs.org/en/) if you do not have it (check using `npm -v`)
3. Navigate to the /blackfynn-csv-export directory and: 
```
npm install
npm run build
```
4. Open index.html in Firefox 

    OR
    
    Use `python -m http.server`
    
    Go to http://0.0.0.0:8000/index.html with Chrome
    
Using the app and External API's
-------
```javascript
// Initialises app.
var blackfynnManger = new BlackfynnManager()
blackfynnManger.initialiseBlackfynnPanel()


//Initialises app on document load.
var blackfynnManger = new BlackfynnManager()
document.addEventListener("DOMContentLoaded", function(event) { 
  blackfynnManger.initialiseBlackfynnPanel()
});

// Send data to app before or after login
var blackfynnManger = new BlackfynnManager()
blackfynnManager.insert('N:package:51ae7443-0e8e-40ac-84bc-a1fcceb9d867','EEG FZ-REF')
blackfynnManger.initialiseBlackfynnPanel()
blacfynnManager.login()
blackfynnManager.insert('Sample Time Series (EEG)','EEG C3-REF')

// serialise to JSON and load from JSON
var blackfynnManager = new blackfynn_panel.BlackfynnManager()
serialisedPanel = blackfynnManager.exportState()
console.log(serialisedPanel)
// "{"parentDiv":{},"selectedChannels":[],"csvURL":""}"
blackfynnManager.loadState(serialisedPanel)
```
