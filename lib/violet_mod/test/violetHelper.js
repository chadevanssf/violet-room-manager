
var requestP = require('request-promise');
var violetSvc = require('../lib/violet');

const serverEndpoint = '/alexa';
const testAppName = 'test';
const violetUrl = `http://localhost:8080${serverEndpoint}/${testAppName}`;

var violetSrvr;
var violet, srvrInstance;

/*var templates = */require('../tester-views/templates-json.js');


beforeEach(function() {
  srvrInstance = startServer(testAppName);
  violetSvc.clearAppInfo(testAppName);
  violet = violetSvc.script(testAppName);
  module.exports.violet = violet;
})


afterEach(function() {
  srvrInstance.close();
  srvrInstance = null;
  violet = null;
  module.exports.violet = violet;
});


var startServer = (appName) => {
  violetSrvr = require('../lib/violetSrvr.js')('/alexa');
  var srvrInstance = violetSrvr.createAndListen(process.env.PORT || 8080);
  return srvrInstance;
}

module.exports.initialize = (_violet) => {
  violet.registerIntents();
  violet.setServerApp(violetSrvr.getSvcRouter());
  // violetSrvr.displayScriptInitialized(srvrInstance, violet);
};

var getIntent = module.exports.getIntent = (spokenPhrase) => {
  spokenPhrase = spokenPhrase.toLowerCase();
  return requestP(violetUrl + '?utterances').then(function (body) {
    var utterances = body.split('\n').map(u=>{
      var intentSep = u.indexOf(' ');
      return {
        intent: u.substring(0, intentSep),
        utterance: u.substring(intentSep+1)
      }
    });
    // console.log('>>> utterances', utterances);
    var utteranceObj = utterances.find(u=>{
      return u.utterance.toLowerCase().indexOf(spokenPhrase) != -1
    });
    if (utteranceObj) return utteranceObj.intent;
    console.log(`ERROR: Could not find '${spokenPhrase}' in utterances: `, utterances);
    return null;
  });
};

var sendRequest = module.exports.sendRequest = (intentName, params, sessionAttributes) => {
  // console.log(`Request for ${intentName}`);
  var msgBody = templates['IntentRequest'];
  msgBody.request.intent.name = intentName;
  msgBody.request.intent.slots = {};
  if (params) {
    Object.keys(params).forEach(k=>{
      msgBody.request.intent.slots[k] = {value: params[k], name: k};
    });
    // console.log('params: ', msgBody.request.intent.slots);
  }
  if (sessionAttributes) {
    msgBody.session.attributes = sessionAttributes;
  } else {
    msgBody.session.attributes = {};
  }

  // console.log(msgBody);
  var options = { method: 'POST',
    url: violetUrl,
    headers: { 'content-type': 'application/json' },
    json: true,
    body: msgBody
  };

  return requestP(options).then(function (body) {
    // console.log(body);
    var rcvdStr;
    if (body.response.outputSpeech) {
      rcvdStr = body.response.outputSpeech.ssml;
      rcvdStr = rcvdStr.replace(/<\/?speak>/g,'');
    }
    return {rcvdStr, sessionAttributes: body.sessionAttributes, body};
  });

};

module.exports.sendIntent = (spokenPhrase, params, sessionAttributes) => {
  return getIntent(spokenPhrase)
          .then(intentName=>{
              if (intentName) return sendRequest(intentName, params, sessionAttributes)
            });
}
