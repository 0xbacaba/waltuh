function errorGameNull(): never {
  throw "Game object is null";
}
function errorPlayerMissingChild(player: number): never {
  throw `Player ${player} doesn't have a child element`;
}
function errorPlayerNotExisting(player: number): never {
  throw `Player ${player} doesn't exist`;
}
function errorNotEnoughPlayers(amount: number): never {
  throw `Not enough players to play: ${amount}`;
}
