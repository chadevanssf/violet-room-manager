'use strict';

// use the environment var from Heroku if set
const IS_DEBUG = process.env.NODE_ENV != "production";

const violet = require('../lib/violet_mod/lib/violet.js').script();
const dbUtil = require("../util/db-util");

// must match the input types
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
    if (!response.ensureGoalFilled('targetFloor')) {
      return false; // dependent goals not met
    }

    var tFloor = response.get(FLOOR_NAME);

    response.say(`Looking on floor ${tFloor}`);

    // make sure to return the promise so that the async call resolves
    dbUtil.getRoomsToClean(tFloor)
      .then((rows) => {
        var reponse = dbUtil.getRoomListResponse(rows);
        response.say(`The list of rooms to clean are ${reponse}`);
      });

    return true;
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
    if (!response.ensureGoalFilled('targetRoom')
        || !response.ensureGoalFilled('targetFloor')) {
      return false; // dependent goals not met
    }

    var tRoom = response.get(ROOM_NAME);
    var tFloor = response.get(FLOOR_NAME);

    var resp1 = `Got it. I am updating room ${tRoom} on floor ${tFloor} now`;
    var resp1 = `I will update room ${tRoom} on floor ${tFloor} right away`;

    response.say([resp1,resp2]);

    dbUtil.updateCleanRoom(tRoom, tFloor)
      .then((rows) => {
        response.say(`Succesfully updated room ${tRoom} on floor ${tFloor} to cleaned.`);

        response.clear(ROOM_NAME);
      });
    return true;
}});

violet.defineGoal({
  goal: 'targetRoom',
  prompt: 'What room number?',
  respondTo: [{
    expecting: [`room [[${ROOM_NAME}]]`, `[[${ROOM_NAME}]]`],
    resolve: (response) => {
      var tRoom = response.get(ROOM_NAME);
      if (IS_DEBUG) {
        response.say(`Got it, room ${tRoom}}`);
      }
      response.set(ROOM_NAME, tRoom);
      return true;
  }}]
});

violet.defineGoal({
  goal: 'targetFloor',
  prompt: 'What floor?',
  respondTo: [{
    expecting: [`floor [[${FLOOR_NAME}]]`, `[[${FLOOR_NAME}]]`],
    resolve: (response) => {
      var tFloor = response.get(FLOOR_NAME);
      if (IS_DEBUG) {
        response.say(`Got it, floor ${tFloor}}`);
      }
      response.set(FLOOR_NAME, tFloor);
      return true;
  }}]
});

module.exports = violet;
