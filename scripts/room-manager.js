'use strict';

const violet = require('violet/lib/violet.js').script();
const dbUtil = require("../util/db-util");
const roomUtilities = require("../util/hospital-room-utilities");

// must match the intent slot names
const ROOM_NAME = 'targetRoom';
const FLOOR_NAME = 'targetFloor';

violet.addInputTypes({
  ROOM_NAME: 'NUMBER',
  FLOOR_NAME: 'NUMBER'
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
      console.log('list at db success');

      var reponse = roomUtilities.getListResponse(rows);
      response.say('The list of rooms to clean are ' + reponse);
    });
}});

violet.respondTo({
  expecting: ['Update room', 'Finish room'],
  resolve: (response) => {
   response.addGoal('clean');
}});

violet.defineGoal({
  goal: 'clean',
  resolve: function *(response) {
    if (!response.ensureGoalFilled(ROOM_NAME)
        || !response.ensureGoalFilled(FLOOR_NAME) ) {
          return false; // dependent goals not met
        }

    response.say(['I am updating that room now.','I will update the room right away.']);

    /*response.store('diabetesLog', {
      'user': response.get('userId'),
      'timeOfCheckin': response.get('timeOfCheckin'),
      'bloodSugarLvl': response.get('bloodSugarLvl'),
      'feetWounds': response.get('feetWounds'),
      'missedDosages': response.get('missedDosages')
    });*/

}});

violet.defineGoal({
  goal: ROOM_NAME,
  prompt: 'What room number?',
  respondTo: [{
    expecting: ['room [[' + ROOM_NAME + ']]', '[[' + ROOM_NAME + ']]'],
    resolve: (response) => {
      response.set(ROOM_NAME, response.get(ROOM_NAME) );
  }}]
});

violet.defineGoal({
  goal: FLOOR_NAME,
  prompt: 'What floor?',
  respondTo: [{
    expecting: ['floor [[' + FLOOR_NAME + ']]', '[[' + FLOOR_NAME + ']]'],
    resolve: (response) => {
      response.set(FLOOR_NAME, response.get(FLOOR_NAME) );
  }}]
});

module.exports = violet;
