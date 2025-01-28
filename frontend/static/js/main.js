"use strict";
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;
let elements;
document.addEventListener("DOMContentLoaded", () => {
    elements = {
        player_list: document.getElementById("player-list"),
        add_player_button: document.getElementById("player-add"),
        continue_button: document.getElementById("continue-button")
    };
});
let current_round = 0;
function add_player() {
    var _a;
    let player_count = (_a = elements.player_list) === null || _a === void 0 ? void 0 : _a.children.length;
    let player = document.createElement("button");
    player.classList.add("player-button");
    player.onclick = () => player_pressed(player_count);
    let input = document.createElement("input");
    input.type = "text";
    input.classList.add("hidden-input");
    let done_typing = () => {
        player.textContent = input.value;
        input.remove();
    };
    input.addEventListener("blur", done_typing);
    input.addEventListener("keydown", (e) => {
        if (e.key == 'Enter')
            done_typing();
    });
    player.appendChild(input);
    if (player_count >= MIN_PLAYERS) {
        elements.continue_button.style.opacity = "1";
    }
    if (player_count >= MAX_PLAYERS) {
        player.classList.add("last-player");
        elements.player_list.replaceChild(player, elements.add_player_button);
    }
    else {
        elements.player_list.insertBefore(player, elements.add_player_button);
    }
    input.focus();
}
function player_pressed(player) {
    console.log(`player ${player} clicked`);
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function continue_pressed() {
    if (current_round == 0) {
        elements.continue_button.textContent = "Weiter";
        elements.add_player_button.classList.add("hide-button");
        let players = Array.from(elements.player_list.children);
        players.splice(players.length - 1, 1); // remove add-player button from array
        console.log(players.length);
        let first_player = randomInt(0, players.length);
        console.log(first_player);
        players[first_player].classList.add("marked");
    }
}
