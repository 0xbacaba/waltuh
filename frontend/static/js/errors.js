"use strict";
function errorGameNull() {
    throw "Game object is null";
}
function errorPlayerMissingChild(player) {
    throw `Player ${player} doesn't have a child element`;
}
function errorPlayerNotExisting(player) {
    throw `Player ${player} doesn't exist`;
}
function errorNotEnoughPlayers(amount) {
    throw `Not enough players to play: ${amount}`;
}
