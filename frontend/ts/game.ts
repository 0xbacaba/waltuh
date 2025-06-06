function createArray<T>(size: number, value: T): T[] {
  return Array(size).fill(value, 0, size);
}

class Game {
  private previous_rounds: Round[] = [];
  private current_round: Round;
  private points: number[];
  private player_amount: number;

  constructor(player_amount: number) {
    if(player_amount < MIN_PLAYERS)
      errorNotEnoughPlayers(player_amount);
    this.player_amount = player_amount;
    this.current_round = new Round(player_amount, 1, random(0, player_amount));
    this.points = createArray<number>(player_amount, 0);
  }

  public pickedCoin(player: number): boolean {
    return this.current_round.pickedCoin(player);
  }
  public unpickedCoin(player: number): boolean {
    return this.current_round.unpickedCoin(player);
  }
  public trickWon(player: number): boolean {
    return this.current_round.trickWon(player);
  }
  public trickLost(player: number): boolean {
    return this.current_round.trickLost(player);
  }

  public nextRound(): number {
    let pointsChange = this.current_round.complete();
    this.points = this.points.map((points, index) => points + pointsChange[index]);

    this.previous_rounds.push(this.current_round);
    this.current_round = this.current_round.nextRound();
    return this.current_round.getCurrentRound();
  }
  public previousRound(): number {
    let prev_round = this.previous_rounds.pop();
    if(prev_round == null)
      return -1;
    let pointsChange = prev_round.getPoints();
    this.points = this.points.map((points, index) => points - pointsChange[index])
    this.current_round = prev_round;
    
    return this.current_round.getCurrentRound();
  }

  public getPoints(): number[] {
    return this.points;
  }
  public getTotalTricksWon(): number {
    return this.current_round.getTotalTricksWon();
  }
  public getPreviousRounds(): Round[] {
    return this.previous_rounds;
  }
  public getCurrentRound(): number {
    return this.current_round.getCurrentRound();;
  }
  public getStartingPlayer(): number {
    return this.current_round.getStartingPlayer();
  }
  public getPlayerAmount(): number {
    return this.player_amount;
  }
}

class Round {
  private player_amount: number;
  private points: number[]
  private picked_coins: number[]
  private tricks_won: number[]
  private current_round: number = 1;
  private starting_player: number;

  public constructor(player_amount: number, current_round: number, starting_player: number) {
    this.player_amount = player_amount;
    this.current_round = current_round;
    this.points = createArray<number>(player_amount, 0);
    this.picked_coins = createArray<number>(player_amount, 0);
    this.tricks_won = createArray<number>(player_amount, 0);
    this.starting_player = starting_player;
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

  private calculatePointsForPlayer(player: number) {
    let picked_coins = this.picked_coins[player];
    let tricks_won = this.tricks_won[player];
    if(tricks_won == picked_coins)
      return tricks_won + 2;
    else
      return tricks_won - Math.abs(tricks_won - picked_coins);
  }
  public complete(): number[] {
    for(let i = 0; i < this.player_amount; i++) {
      this.points[i] = this.calculatePointsForPlayer(i);
    }
    console.log("round complete:");
    console.log({ player_amount: this.player_amount, points: this.points });
    return this.points;
  }

  public getTricksWon(player: number): number  {
    return this.tricks_won[player];
  }
  public getTotalTricksWon(): number {
    return this.tricks_won.reduce((total, cur) => total + cur);
  }
  public getPoints(): number[] {
    return this.points;
  }
  public nextRound(): Round {
    return new Round(this.player_amount, this.current_round + 1, (this.starting_player + 1) % this.player_amount);
  }
  public getCurrentRound(): number {
    return this.current_round;
  }
  public getStartingPlayer(): number {
    return this.starting_player;
  }
}
