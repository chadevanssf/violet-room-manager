'use strict';

const violet = require('../lib/violet_mod/lib/violet.js').script();
const dbUtil = require("../util/db-util");

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
    response.addGoal('targetFloor');

    var tFloor = response.get(FLOOR_NAME);

    response.say('Looking on floor ' + tFloor);

    // make sure to return the promise so that the async call resolves
    return dbUtil.getRoomsToClean(tFloor)
      .then((rows) => {
        var reponse = dbUtil.getRoomListResponse(rows);
        response.say('The list of rooms to clean are ' + reponse);
      });
  }});

violet.respondTo({
  expecting: ['Update room', 'Finish room'],
  resolve: (response) => {
    response.addGoal('clean');
}});

violet.respondTo({
  expecting: ['Set my floor', 'Update floor'],
  resolve: (response) => {
    response.addGoal('targetFloor');
}});

violet.defineGoal({
  goal: 'clean',
  resolve: function (response) {
    if (response.ensureGoalFilled('targetRoom')
        && response.ensureGoalFilled('targetFloor') ) {
      return false; // dependent goals not met
    }

    var tRoom = response.get(ROOM_NAME);
    var tFloor = response.get(FLOOR_NAME);

    var resp1 = 'I am updating room ' + tRoom + ' on floor ' + tFloor + ' now.';
    var resp2 = 'I will update room ' + tRoom + ' on floor ' + tFloor + ' right away.';

    response.say([resp1,resp2]);

    return dbUtil.updateCleanRoom(tRoom, tFloor)
      .then((rows) => {
        response.say('Succesfully updated room ' + tRoom + ' on floor ' + tFloor + ' to cleaned.');

        response.clear(ROOM_NAME);
      });
}});

violet.defineGoal({
  goal: 'targetRoom',
  prompt: 'What room number?',
  respondTo: [{
    expecting: ['room [[' + ROOM_NAME + ']]', '[[' + ROOM_NAME + ']]'],
    resolve: (response) => {
      //response.say('Got it, room ' + response.get(ROOM_NAME));
      response.set(ROOM_NAME, response.get(ROOM_NAME));
  }}]
});

violet.defineGoal({
  goal: 'targetFloor',
  prompt: 'What floor?',
  respondTo: [{
    expecting: ['floor [[' + FLOOR_NAME + ']]', '[[' + FLOOR_NAME + ']]'],
    resolve: (response) => {
      //response.say('Got it, floor ' + response.get(FLOOR_NAME));
      response.set(FLOOR_NAME, response.get(FLOOR_NAME));
  }}]
});

module.exports = violet;
