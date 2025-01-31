function createArray<T>(size: number, value: T): T[] {
  return Array(size).fill(value, 0, size);
}

class Game {
  private player_amount: number;
  private points: number[]
  private picked_coins: number[]
  private tricks_won: number[]
  private current_round: number = 1;
  private starting_player: number;

  constructor(player_amount: number) {
    if(player_amount < MIN_PLAYERS)
      errorNotEnoughPlayers(player_amount);
    this.player_amount = player_amount;
    this.points = createArray<number>(player_amount, 0);
    this.picked_coins = createArray<number>(player_amount, 0);
    this.tricks_won = createArray<number>(player_amount, 0);
    this.starting_player = random(0, player_amount);
  }

  public pickedCoin(player: number): boolean {
    if(this.picked_coins[player] >= this.current_round)
      return false;
    this.picked_coins[player]++;
    return true;
  }
  public unpickedCoin(player: number): boolean {
    if(this.picked_coins[player] <= 0)
      return false;

    this.picked_coins[player]--;
    return true;
  }
  public getPickedCoins(player: number): number {
    return this.picked_coins[player];
  }

  public trickWon(player: number): boolean {
    if(this.tricks_won[player] >= this.current_round)
      return false;
    if(this.getTotalTricksWon() >= this.current_round)
      return false;
    this.tricks_won[player]++;
    return true;
  }
  public trickLost(player: number): boolean {
    if(this.tricks_won[player] <= 0)
      return false;
    this.tricks_won[player]--;
    return true;
  }
  public getTricksWon(player: number): number  {
    return this.tricks_won[player];
  }
  public getTotalTricksWon(): number {
    return this.tricks_won.reduce((total, cur) => total + cur);
  }

  public nextRound(): number {
    for(let i = 0; i < this.player_amount; i++) {
      this.calculatePointsForPlayer(i);
      this.tricks_won[i] = 0;
      this.picked_coins[i] = 0;
    }
    this.starting_player = (this.starting_player + 1) % this.player_amount;
    return ++this.current_round;
  }

  private calculatePointsForPlayer(player: number) {
    let picked_coins = this.picked_coins[player];
    let points_delta = this.tricks_won[player];
    if(this.tricks_won[player] == picked_coins)
      points_delta += 2;
    else
      points_delta -= Math.abs(this.tricks_won[player] - picked_coins);

    this.points[player] += points_delta;
  }

  public getCurrentRound(): number {
    return this.current_round;
  }
  public getStartingPlayer(): number {
    return this.starting_player;
  }
  public getPoints(): number[] {
    return this.points;
  }
}
