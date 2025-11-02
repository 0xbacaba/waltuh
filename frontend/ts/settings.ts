let settings_values = {
  points: {
    official: (picked_coins: number, tricks_won: number) => {
      if (picked_coins == tricks_won)
        return 2 + tricks_won;
      else
        return - Math.abs(tricks_won - picked_coins);

    },
    unofficial: (picked_coins: number, tricks_won: number) => {
      if (tricks_won == picked_coins)
        return tricks_won + 2;
      else
        return tricks_won - Math.abs(tricks_won - picked_coins);
    }
  }
};

let settings: { [key: string]: any } = {
  points: settings_values.points.unofficial
};

function apply_selected_setting(name: string) {
  let option = document.querySelector(`input[name="${name}"]:checked`);
  if (option == null || option == undefined) {
    console.error("invalid setting name:", name);
    return;
  }
  setting_clicked(option as HTMLInputElement);
}
