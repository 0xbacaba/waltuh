use rand::prelude::*;

const MIN_PLAYERS: u8 = 3;
const MAX_PLAYERS: u8 = 6;

struct Player {
    picked_coins: u8,
    tricks_won: u8,
    points: i8
}
impl Player {
    /// Create a new `Player` instance
    pub fn new() -> Player {
        Player {
            picked_coins: 0,
            tricks_won: 0,
            points: 0,
        }
    }
    /// Calculates the points for this player and resets picked coins and won tricks
    pub fn next_round(&mut self) {
        let picked_coins = self.picked_coins;
        let mut points_delta = self.tricks_won as i8;
        if self.tricks_won == picked_coins {
            points_delta += 2;
        } else {
            points_delta -= (self.tricks_won as i8 - picked_coins as i8).abs();
        }

        self.points += points_delta;
        self.picked_coins = 0;
        self.tricks_won = 0;
    }
}
struct Game {
    players: Vec<Player>,
    current_round: u8,
    starting_player: u8,
}
impl Game {
    /// Create a new `Game` instance
    /// # Arguments:
    /// * `player_count` - The amount of players playing this game. Must be inside the range 3 to 6.
    pub fn new(player_count: u8) -> Game {
        if player_count < MIN_PLAYERS || player_count > MAX_PLAYERS {
            panic!("Invalid player count {player_count}");
        }

        let mut players = Vec::new();
        for _ in 0..player_count {
            players.push(Player::new())
        }

        let starting_player = rand::rng().random_range(0..player_count);

        Game {
            players,
            current_round: 1,
            starting_player,
        }
    }

    /// Picks a coin for a player.
    /// # Returns: 
    /// `true` if the player has not reached the max amount of coins for the current round, `false` otherwise
    pub fn pick_coin(&mut self, player: usize) -> bool {
        let player = &mut self.players[player];
        if player.picked_coins >= self.current_round {
            return false;
        }

        player.picked_coins += 1;
        true
    }
    /// Removes a coin from a player.
    /// # Returns: 
    /// `true` if the player has at least one coin, `false` otherwise
    pub fn unpick_coin(&mut self, player: usize) -> bool {
        let player = &mut self.players[player];
        if player.picked_coins <= 0 {
            return false;
        }

        player.picked_coins -= 1;
        true
    }
    /// Registers a won trick for a player.
    /// # Returns: 
    /// `true` if the player is able to win the trick, `false` otherwise
    pub fn won_trick(&mut self, player: usize) -> bool {
        let total_tricks_won = self.get_total_tricks_won();
        let player = &mut self.players[player];
        if player.tricks_won >= self.current_round || total_tricks_won >= self.current_round {
            return false;
        }

        player.tricks_won += 1;
        true
    }
    /// Unregisters a won trick for a player.
    /// # Returns: 
    /// `true` if the player has at least one trick won, `false` otherwise
    pub fn lost_trick(&mut self, player: usize) -> bool {
        let player = &mut self.players[player];
        if player.tricks_won <= 0 {
            return false;
        } 

        player.tricks_won -= 1;
        true
    }

    /// Calculates the points for each player and continues to the next round.
    /// # Returns: 
    /// `true` if the game can continue to the next round, `false` if not.
    pub fn next_round(&mut self) -> bool {
        if self.get_total_tricks_won() < self.get_current_round() {
            return false;
        }

        for player in self.players.iter_mut() {
            player.next_round()
        }
        self.starting_player = (self.starting_player + 1) % self.get_player_count();
        self.current_round += 1;

        true
    }

    /// Get the total tricks won by all players in the current round
    pub fn get_total_tricks_won(&self) -> u8 {
        self.players.iter()
            .map(|player| player.tricks_won)
            .reduce(|total, cur| total + cur)
            .expect("Couldn't reduce tricks won")
    }
    /// Get the amount of tricks won by a player in the current round
    pub fn get_tricks_won(&self, player: usize) -> u8 {
        self.players[player].tricks_won
    }
    /// Get the amount of coins picked by a player in the current round
    pub fn get_picked_coins(&self, player: usize) -> u8 {
        self.players[player].picked_coins
    }
    /// Get the amount of points of a player
    pub fn get_points(&self, player: usize) -> i8 {
        self.players[player].points
    }

    /// Get the current round
    pub fn get_current_round(&self) -> u8 {
        self.current_round
    }
    /// Get the amount of players playing the game
    pub fn get_player_count(&self) -> u8 {
        self.players.len() as u8
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_setup() {
        let player_count = 6;
        let game = Game::new(player_count);
        assert_eq!(1, game.get_current_round());
        assert_eq!(player_count, game.get_player_count());
        for player in 0..game.get_player_count() {
            assert_eq!(0, game.get_tricks_won(player as usize));
            assert_eq!(0, game.get_picked_coins(player as usize));
            assert_eq!(0, game.get_points(player as usize));
        }
        assert_eq!(0, game.get_total_tricks_won());
    }

    #[test]
    #[should_panic(expected="Invalid player count")]
    fn test_too_few_players() {
        let _ = Game::new(2);
    }
    #[test]
    #[should_panic(expected="Invalid player count")]
    fn test_too_many_players() {
        let _ = Game::new(7);
    }

    #[test]
    fn test_one_round() {
        let mut game = Game::new(6);
        assert!(game.pick_coin(0));

        assert_eq!(1, game.get_picked_coins(0));
        for player in 1..game.get_player_count() {
            assert_eq!(0, game.get_picked_coins(player as usize));
        }

        assert!(!game.next_round(), "Game should not have been able to continue to next round");

        assert!(game.won_trick(0), "Player 0 should be able to win a trick");
        assert!(!game.won_trick(1), "There should only be one trick won in this round");
        assert!(game.next_round(), "Game should have been able to continue to next round");
        
        for player in 0..game.get_player_count() {
            assert_eq!(0, game.get_picked_coins(player as usize), "Picked coins should have been reset");
            assert_eq!(0, game.get_tricks_won(player as usize), "Won tricks should have been reset");

            if player == 0 {
                assert_eq!(3, game.get_points(0), "Player 0 should have 20 points for correct guess and one trick");
            } else {
                assert_eq!(2, game.get_points(player as usize), "Player {player} should have 20 points for correct guess");
            }
        }
    }
}
