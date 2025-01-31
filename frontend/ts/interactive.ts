function player_pressed(player: number) {
  if (current_state == GameState.PICKING_COINS)
    mark_player(player);
  if (current_state == GameState.PLAYING_ROUND) {
    if (game == null)
      errorGameNull();

    if (game.trickWon(player)) {
      console.log(`Player ${player} won a trick`);
      let coins = get_player_elements()[player].querySelectorAll(".coin.picked:not(.hidden):not(.won)");
      if(coins.length == 0) {
        console.log(`ghost coin`);
        let ghost_coin = create_coin(0, 0, picked_coin_pressed);
        set_css_variable(ghost_coin, "--picked-by", player);
        ghost_coin.classList.remove("picked");
        let coin_stash = get_player_coin_stash_element(player);
        coin_stash.appendChild(ghost_coin);

        ghost_coin.classList.add("ghost");

        setTimeout(() => {
          ghost_coin.classList.add("won");
        }, 100);
        return;
      }
      let coin = coins[coins.length - 1];
      coin.classList.add("won");
    }
  }
}

function coin_pressed(this: GlobalEventHandlers, ev: MouseEvent) {
  let marked_player = get_marked_player();
  if (marked_player < 0) {
    console.warn("No player selected");
    return;
  }

  if(game == null)
    errorGameNull();

  if (game.pickedCoin(marked_player))
    move_coin_to_player(ev.target as HTMLElement, marked_player);
  return;
}
function picked_coin_pressed(this: GlobalEventHandlers, ev: MouseEvent) {
    let coin = ev.target as HTMLElement;
    let player = parseInt(get_css_variable(coin, "--picked-by"));

    let player_element = get_player_elements()[player];
    let won_coins = player_element.querySelectorAll(".coin.won");
    let ghost_coins = player_element.querySelectorAll(".coin.ghost.won");
    let bottom_coin = won_coins[0];
    if(ghost_coins.length > 0)
      bottom_coin = ghost_coins[0];

    if(game == null)
      errorGameNull();
    if(bottom_coin == undefined)
      return;

    if(bottom_coin.classList.contains("won")) {
      if(game.trickLost(player)) {
        console.log(`Player ${player} lost trick`);
        bottom_coin.classList.remove("won");

        if(bottom_coin.classList.contains("ghost")) {
          setTimeout(() => bottom_coin.remove(), get_transition_time() * 1000);
        }
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

      if(game.getTotalTricksWon() < game.getCurrentRound()) {
        console.log("cannot continue yet");
        return;
      }
      switch_state(GameState.PICKING_COINS);
      break;
  }
}
