'use strict';

const violet = require('violet/lib/violet.js').script();
const dbUtil = require("../util/db-util");
const roomUtilities = require("../util/hospital-room-utilities");

// must match the intent slot names
const ROOM_NAME = 'targetRoom';
const FLOOR_NAME = 'targetFloor';

violet.addInputTypes({
  'targetRoom': 'AMAZON.NUMBER',
  'targetFloor': 'AMAZON.NUMBER'
});

//common across multiple goals
violet.addPhraseEquivalents([
]);

violet.addTopLevelGoal('list');
violet.addTopLevelGoal('cleaned');

violet.respondTo({
  expecting: ['Rooms to clean', 'List of rooms to clean', 'What are my rooms to clean'],
  resolve: (response) => {
   // make sure to return the promise so that the async call resolves
   return dbUtil.getRoomsToClean()
    .then((rows) => {
      var reponse = roomUtilities.getListResponse(rows);
      response.say('The list of rooms to clean are ' + reponse);
    });
}});

violet.respondTo({
  expecting: ['Update room', 'Finish room'],
  resolve: (response) => {
    console.log('Starting update response...');
    response.addGoal('clean');
}});

violet.defineGoal({
  goal: 'clean',
  resolve: function (response) {
    console.log('Starting clean goal...');
    if (!response.ensureGoalFilled('targetRoom')
        || !response.ensureGoalFilled('targetFloor') ) {
      return false; // dependent goals not met
    }

    var resp1 = 'I am updating room ' + response.get(ROOM_NAME) + ' on floor ' + response.get(FLOOR_NAME) + ' now.';
    var resp2 = 'I will update room ' + response.get(ROOM_NAME) + ' on floor ' + response.get(FLOOR_NAME) + ' right away.';

    response.endConversation();
    response.say([resp1,resp2]);

    /*response.store('diabetesLog', {
      'user': response.get('userId'),
      'timeOfCheckin': response.get('timeOfCheckin'),
      'bloodSugarLvl': response.get('bloodSugarLvl'),
      'feetWounds': response.get('feetWounds'),
      'missedDosages': response.get('missedDosages')
    });*/
}});

violet.defineGoal({
  goal: 'targetRoom',
  prompt: 'What room number?',
  respondTo: [{
    expecting: ['room [[' + ROOM_NAME + ']]', '[[' + ROOM_NAME + ']]'],
    resolve: (response) => {
      response.say('Got it, room ' + response.get(ROOM_NAME));
      response.set(ROOM_NAME, response.get(ROOM_NAME));
  }}]
});

violet.defineGoal({
  goal: 'targetFloor',
  prompt: 'What floor?',
  respondTo: [{
    expecting: ['floor [[' + FLOOR_NAME + ']]', '[[' + FLOOR_NAME + ']]'],
    resolve: (response) => {
      response.say('Got it, floor ' + response.get(FLOOR_NAME));
      response.set(FLOOR_NAME, response.get(FLOOR_NAME));
  }}]
});

module.exports = violet;
