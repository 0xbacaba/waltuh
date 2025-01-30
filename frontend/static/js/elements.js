"use strict";
const DISPLAYED_TEXT = {
    CONTINUE_BUTTON: {
        START_GAME: "Spiel starten",
        START_ROUND: "Runde starten",
        END_ROUND: "Runde beenden",
    },
};
function create_player_name_input(value_handler) {
    let input = document.createElement("input");
    input.type = "text";
    input.classList.add("hidden-input");
    let done_typing = () => {
        value_handler(input.value);
        input.remove();
    };
    input.addEventListener("blur", done_typing);
    input.addEventListener("keydown", (e) => {
        if (e.key == 'Enter')
            done_typing();
    });
    return input;
}
function create_player(onclick) {
    let player = document.createElement("div");
    player.classList.add("player");
    let coin_stash = document.createElement("div");
    coin_stash.classList.add("coin-stash");
    player.appendChild(coin_stash);
    let player_button = document.createElement("button");
    player_button.classList.add("player-button");
    player_button.onclick = onclick;
    let input = create_player_name_input((value) => player_button.textContent = value);
    player_button.appendChild(input);
    player.appendChild(player_button);
    return { player: player, input: input };
}
function create_coin(offsetX, offsetY, onclick) {
    let coin = document.createElement("div");
    coin.classList.add("coin", "hidden");
    coin.onclick = onclick;
    coin.style.zIndex = `-${elements.coin_pile.children.length}`;
    set_css_variable(coin, '--x', `${offsetX}vw`);
    set_css_variable(coin, '--y', `${offsetY}vh`);
    return coin;
}
