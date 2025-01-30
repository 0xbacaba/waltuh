"use strict";
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;
const COIN_OFFSETS = {
    MIN_X: -40,
    MAX_X: 40,
    MIN_Y: 2,
    MAX_Y: 30
};
var GameState;
(function (GameState) {
    GameState[GameState["CREATING_PLAYERS"] = 0] = "CREATING_PLAYERS";
    GameState[GameState["PICKING_COINS"] = 1] = "PICKING_COINS";
    GameState[GameState["PLAYING_ROUND"] = 2] = "PLAYING_ROUND";
})(GameState || (GameState = {}));
let current_state;
let game;
let elements;
document.addEventListener("DOMContentLoaded", () => {
    elements = {
        player_list: document.getElementById("player-list"),
        add_player_button: document.getElementById("player-add"),
        continue_button: document.getElementById("continue-button"),
        coin_pile: document.getElementById("coin-pile")
    };
    switch_state(GameState.CREATING_PLAYERS);
});
function add_player() {
    var _a;
    let player_count = (_a = elements.player_list) === null || _a === void 0 ? void 0 : _a.children.length;
    let { player, input } = create_player(() => player_pressed(player_count - 1));
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
function get_player_elements() {
    let players = Array.from(elements.player_list.children)
        .filter(element => element.id != "player-add");
    return players;
}
function get_player_button_element(player) {
    let player_element = get_player_elements()[player];
    if (player_element == undefined)
        errorPlayerMissingChild(player);
    let player_button = player_element.querySelector(".player-button");
    if (player_button == null)
        errorPlayerMissingChild(player);
    return player_button;
}
function get_player_points_element(player) {
    let player_element = get_player_elements()[player];
    if (player_element == undefined)
        errorPlayerMissingChild(player);
    let player_points = player_element.querySelector(".point-display");
    if (player_points == null)
        errorPlayerMissingChild(player);
    return player_points;
}
function mark_player(player) {
    let players = get_player_elements();
    if (player >= players.length || player < 0)
        errorPlayerNotExisting(player);
    let marked_player = get_marked_player();
    if (marked_player >= 0)
        get_player_button_element(marked_player).classList.remove("marked");
    get_player_button_element(player).classList.add("marked");
}
function get_marked_player() {
    let players = get_player_elements();
    for (let i = 0; i < players.length; i++) {
        let player_button = get_player_button_element(i);
        if (player_button.classList.contains("marked"))
            return i;
    }
    return -1;
}
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function switch_state(new_state) {
    switch (new_state) {
        case GameState.CREATING_PLAYERS:
            set_continue_button_text(DISPLAYED_TEXT.CONTINUE_BUTTON.START_GAME);
            game = null;
            break;
        case GameState.PICKING_COINS:
            set_continue_button_text(DISPLAYED_TEXT.CONTINUE_BUTTON.START_ROUND);
            if (game == null)
                game = new Game(get_player_elements().length);
            else
                game.nextRound();
            let points = game.getPoints();
            for (let i = 0; i < points.length; i++) {
                let points_element = get_player_points_element(i);
                points_element.textContent = `${points[i] * 10}`;
            }
            mark_player(game.getStartingPlayer());
            create_coin_pile();
            remove_picked_coins();
            break;
        case GameState.PLAYING_ROUND:
            set_continue_button_text(DISPLAYED_TEXT.CONTINUE_BUTTON.END_ROUND);
            remove_coin_pile();
            break;
    }
    current_state = new_state;
}
function create_coin_pile() {
    if (game == null)
        errorGameNull();
    let amount_players = get_player_elements().length;
    let amount_coins = game.getCurrentRound() * amount_players;
    for (let i = 0; i < amount_coins; i++) {
        let coin = create_coin(random(COIN_OFFSETS.MIN_X, COIN_OFFSETS.MAX_X), random(COIN_OFFSETS.MIN_Y, COIN_OFFSETS.MAX_Y), coin_pressed);
        elements.coin_pile.appendChild(coin);
        setTimeout(() => {
            coin.classList.remove("hidden");
        }, random(100, 500));
    }
}
function remove_coin_pile() {
    document.querySelectorAll("#coin-pile>.coin").forEach(remove_coin);
}
function remove_picked_coins() {
    document.querySelectorAll(".coin.picked").forEach(remove_coin);
}
function remove_coin(coin) {
    coin.classList.add("hidden");
    setTimeout(() => {
        coin.remove();
    }, get_transition_time() * 1000);
}
function get_transition_time() {
    let transitions_property = getComputedStyle(document.documentElement).getPropertyValue("--transitions");
    let transition_time = parseFloat(transitions_property.replace('s', '')); // assuming the unit is (s)econds
    return transition_time;
}
function parse_first_int(text) {
    let digits = text.match(/\d+/);
    if (digits == null)
        return 0;
    if (digits.length > 0)
        return parseInt(digits[0]);
    return 0;
}
function set_continue_button_text(text) {
    elements.continue_button.textContent = text;
}
function set_css_variable(element, variable, value) {
    element.style.setProperty(variable, `${value}`);
}
function get_css_variable(element, variable) {
    return getComputedStyle(element).getPropertyValue(variable);
}
function move_coin_to_player(coin, player) {
    let player_container = get_player_elements()[player];
    let coin_stash = player_container.querySelector(".coin-stash");
    if (coin_stash == null)
        errorPlayerMissingChild(player);
    const rect1 = coin.getBoundingClientRect();
    let new_coin = create_coin(0, 0, () => { });
    new_coin.classList.remove("hidden");
    coin_stash.appendChild(new_coin);
    const rect0 = new_coin.getBoundingClientRect();
    const deltaX = rect1.left - rect0.left;
    const deltaY = rect1.bottom - rect0.bottom;
    set_css_variable(new_coin, "--x", `${deltaX}px`);
    set_css_variable(new_coin, "--y", `${deltaY}px`);
    set_css_variable(new_coin, "--number", `${coin_stash.children.length}`);
    new_coin.style.zIndex = `${parseInt(coin.style.zIndex) - 1}`;
    let transition_time = get_transition_time();
    new_coin.style.transition = "0s";
    new_coin.classList.add("picked");
    setTimeout(() => new_coin.style.transition = `${transition_time}s`, transition_time * 1000);
    coin.remove();
}
