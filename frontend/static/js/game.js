"use strict";
function createArray(size, value) {
    return Array(size).fill(value, 0, size);
}
class Game {
    constructor(player_amount) {
        this.current_round = 1;
        if (player_amount < MIN_PLAYERS)
            errorNotEnoughPlayers(player_amount);
        this.player_amount = player_amount;
        this.points = createArray(player_amount, 0);
        this.picked_coins = createArray(player_amount, 0);
        this.tricks_won = createArray(player_amount, 0);
        this.starting_player = random(0, player_amount);
    }
    pickedCoin(player) {
        if (this.picked_coins[player] >= this.current_round)
            return false;
        this.picked_coins[player]++;
        return true;
    }
    unpickedCoin(player) {
        if (this.picked_coins[player] <= 0)
            return false;
        this.picked_coins[player]--;
        return true;
    }
    getPickedCoins(player) {
        return this.picked_coins[player];
    }
    trickWon(player) {
        if (this.tricks_won[player] >= this.current_round)
            return false;
        if (this.getTotalTricksWon() >= this.current_round)
            return false;
        this.tricks_won[player]++;
        return true;
    }
    getTricksWon(player) {
        return this.tricks_won[player];
    }
    getTotalTricksWon() {
        return this.tricks_won.reduce((total, cur) => total + cur);
    }
    nextRound() {
        for (let i = 0; i < this.player_amount; i++) {
            this.calculatePointsForPlayer(i);
            this.tricks_won[i] = 0;
            this.picked_coins[i] = 0;
        }
        this.starting_player = (this.starting_player + 1) % this.player_amount;
        return ++this.current_round;
    }
    calculatePointsForPlayer(player) {
        let picked_coins = this.picked_coins[player];
        let points_delta = this.tricks_won[player];
        if (this.tricks_won[player] == picked_coins)
            points_delta += 2;
        else
            points_delta -= Math.abs(this.tricks_won[player] - picked_coins);
        this.points[player] += points_delta;
    }
    getCurrentRound() {
        return this.current_round;
    }
    getStartingPlayer() {
        return this.starting_player;
    }
    getPoints() {
        return this.points;
    }
}
