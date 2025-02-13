const MIN_PLAYERS = 3;
const MAX_PLAYERS = 6;

const COIN_OFFSETS = {
  MIN_X: -40,
  MAX_X: 40,
  MIN_Y: 2,
  MAX_Y: 30
};

enum GameState {
  CREATING_PLAYERS,
  PICKING_COINS,
  PLAYING_ROUND,
}

let current_state: GameState;
let game: Game | null;

let elements: { [key: string]: HTMLElement };
document.addEventListener("DOMContentLoaded", () => {
  elements = {
    player_list: document.getElementById("player-list")!,
    add_player_button: document.getElementById("player-add")!,
    continue_button: document.getElementById("continue-button")!,
    coin_pile: document.getElementById("coin-pile")!
  }

  switch_state(GameState.CREATING_PLAYERS);
});

function add_player() {
  let player_count = elements.player_list?.children.length;
  let { player, input } = create_player(() => player_pressed(player_count - 1));

  if (player_count >= MIN_PLAYERS) {
    elements.continue_button.style.opacity = "1";
  }
  if (player_count >= MAX_PLAYERS) {
    player.classList.add("last-player");
    elements.player_list.replaceChild(player, elements.add_player_button);
  } else {
    elements.player_list.insertBefore(player, elements.add_player_button);
  }

  input.focus();
}
function get_player_elements(): Element[] {
  let players = Array.from(elements.player_list.children)
    .filter(element => element.id != "player-add");

  return players;
}
function get_player_button_element(player: number): HTMLElement {
  let player_element = get_player_elements()[player];
  if (player_element == undefined)
    errorPlayerMissingChild(player);
  let player_button = player_element.querySelector(".player-button")
  if (player_button == null)
    errorPlayerMissingChild(player);
  return player_button as HTMLElement;
}
function get_player_points_element(player: number): HTMLElement {
  let player_element = get_player_elements()[player];
  if(player_element == undefined)
    errorPlayerMissingChild(player);
  let player_points = player_element.querySelector(".point-display");
  if(player_points == null)
    errorPlayerMissingChild(player);
  return player_points as HTMLElement;
}
function get_player_coin_stash_element(player: number): HTMLElement {
  let player_element = get_player_elements()[player];
  if(player_element == undefined)
    errorPlayerMissingChild(player);
  let player_coin_stash = player_element.querySelector(".coin-stash");
  if(player_coin_stash == null)
    errorPlayerMissingChild(player);
  return player_coin_stash as HTMLElement;
}
function mark_player(player: number) {
  let players = get_player_elements();
  if (player >= players.length || player < 0)
    errorPlayerNotExisting(player);

  let marked_player = get_marked_player();
  if (marked_player >= 0)
    get_player_button_element(marked_player).classList.remove("marked");
  get_player_button_element(player).classList.add("marked");
}
function get_marked_player(): number | -1 {
  let players = get_player_elements();

  for (let i = 0; i < players.length; i++) {
    let player_button = get_player_button_element(i);

    if (player_button.classList.contains("marked"))
      return i;
  }

  return -1
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function switch_state(new_state: GameState) {
  switch (new_state) {
    case GameState.CREATING_PLAYERS:
      set_continue_button_text(DISPLAYED_TEXT.CONTINUE_BUTTON.START_GAME());

      game = null;
      break;
    case GameState.PICKING_COINS:
      if (game == null)
        game = new Game(get_player_elements().length);
      else
        game.nextRound();

      set_continue_button_text(DISPLAYED_TEXT.CONTINUE_BUTTON.START_ROUND(game.getCurrentRound()));

      let points = game.getPoints();

      for(let i = 0; i < points.length; i++) {
        let points_element = get_player_points_element(i);
        points_element.textContent = `${points[i] * 10}`;
      }

      mark_player(game.getStartingPlayer());
      create_coin_pile();
      remove_picked_coins();
      break;
    case GameState.PLAYING_ROUND:
      set_continue_button_text(DISPLAYED_TEXT.CONTINUE_BUTTON.END_ROUND());

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
    coin.classList.add("hidden");
    elements.coin_pile.appendChild(coin);
    setTimeout(() => {
      coin.classList.remove("hidden");
    }, random(100, 500))
  }
}
function remove_coin_pile() {
  document.querySelectorAll("#coin-pile>.coin").forEach(remove_coin);
}
function remove_picked_coins() {
  document.querySelectorAll(".coin-stash>.coin").forEach(remove_coin);
}
function remove_coin(coin: Element) {
  coin.classList.add("hidden")
  setTimeout(() => coin.remove(), get_transition_time() * 1000);
}

function get_transition_time(): number {
  let transitions_property = getComputedStyle(document.documentElement).getPropertyValue("--transitions");
  let transition_time = parseFloat(transitions_property.replace('s', '')); // assuming the unit is (s)econds

  return transition_time;
}

function parse_first_int(text: string): number {
  let digits = text.match(/-?\d+/)
  if (digits == null)
    return 0;
  if (digits.length > 0)
    return parseInt(digits[0]);
  return 0;
}

function set_continue_button_text(text: string) {
  elements.continue_button.textContent = text;
}

function set_css_variable(element: HTMLElement, variable: string, value: any) {
  element.style.setProperty(variable, `${value}`);
}
function get_css_variable(element: HTMLElement, variable: string): string {
  return getComputedStyle(element).getPropertyValue(variable);
}

function calculate_coin_offset_to_player(coin: HTMLElement, picked_coin: HTMLElement): {deltaX: number, deltaY: number} {
  const rect1 = coin.getBoundingClientRect();

  const rect0 = picked_coin.getBoundingClientRect()

  const deltaX = rect1.left - rect0.left;
  const deltaY = rect1.bottom - rect0.bottom;

  return {deltaX, deltaY};
}
function move_coin_to_player(coin: HTMLElement, player: number) {
  let coin_stash = get_player_coin_stash_element(player);

  let new_coin = create_picked_coin(player, picked_coin_pressed);
  coin_stash.appendChild(new_coin);

  let {deltaX, deltaY} = calculate_coin_offset_to_player(coin, new_coin);

  set_css_variable(new_coin, "--prev-x", `${get_css_variable(coin, "--x")}`);
  set_css_variable(new_coin, "--prev-y", `${get_css_variable(coin, "--y")}`);
  set_css_variable(new_coin, "--x", `${deltaX}px`);
  set_css_variable(new_coin, "--y", `${deltaY}px`);
  new_coin.style.zIndex = `${parseInt(coin.style.zIndex) - 1}`;

  coin.remove();
}
function remove_coin_from_player(player: number) {
  let coin_stash = get_player_coin_stash_element(player);

  let picked_coins = coin_stash.querySelectorAll("div.coin:not(.unpicked)");
  if(picked_coins.length == 0)
    return;

  let removed_coin = picked_coins[picked_coins.length - 1] as HTMLElement;

  removed_coin.classList.add("unpicked");

  setTimeout(() => {
    let prev_x = parse_first_int(get_css_variable(removed_coin, "--prev-x"));
    let prev_y = parse_first_int(get_css_variable(removed_coin, "--prev-y"));
    let coin = create_coin(prev_x, prev_y, coin_pressed);
    elements.coin_pile.appendChild(coin);

    removed_coin.remove();
  }, get_transition_time() * 1000);
}
