"use strict";
function player_pressed(player) {
    if (current_state == GameState.PICKING_COINS)
        mark_player(player);
    if (current_state == GameState.PLAYING_ROUND) {
        if (game == null)
            errorGameNull();
        if (game.trickWon(player)) {
            console.log(`Player ${player} won a trick`);
            let coin = get_player_elements()[player].querySelector(".coin.picked:not(.hidden)");
            if (coin == null)
                return;
            remove_coin(coin);
        }
    }
}
function continue_pressed() {
    switch (current_state) {
        case GameState.CREATING_PLAYERS:
            elements.add_player_button.classList.add("hide-button");
            switch_state(GameState.PICKING_COINS);
            break;
        case GameState.PICKING_COINS:
            switch_state(GameState.PLAYING_ROUND);
            if (game == null)
                errorGameNull();
            mark_player(game.getStartingPlayer());
            break;
        case GameState.PLAYING_ROUND:
            if (game == null)
                errorGameNull();
            if (game.getTotalTricksWon() < game.getCurrentRound()) {
                console.log("cannot continue yet");
                return;
            }
            switch_state(GameState.PICKING_COINS);
            break;
    }
}
function coin_pressed(ev) {
    let marked_player = get_marked_player();
    if (marked_player < 0) {
        console.warn("No player selected");
        return;
    }
    if (game == null)
        errorGameNull();
    if (game.pickedCoin(marked_player)) {
        console.log(`Player ${marked_player} picked a coin`);
        move_coin_to_player(ev.target, marked_player);
    }
}
