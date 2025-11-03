interface Settings {
  [key: string]: any,
  points: (picked_coins: number, tricks_won: number) => number,
}

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

let settings: Settings = {
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

function set_setting(path: string, value: any) {
  let path_parts = path.split(".");
  let setting: Settings = settings;
  let values: any = settings_values;
  let last_part: string = path_parts[0];
  for (let i = 0; i < path_parts.length - 1; i++) {
    last_part = path_parts[i];
    values = values[path_parts[i]];
    setting = setting[path_parts[i]];
    if (values == null || values == undefined || setting == null || setting == undefined) {
      console.error("invalid settings path:", path, "at", i);
      return;
    }
  }
  if (last_part == "") {
    console.error("invalid/empty settings path:", path);
    return;
  }
  let result = values[last_part][value];
  if (result == null || result == undefined) {
    console.error("invalid settings value:", value);
    return;
  }

  setting[last_part] = result;
  console.log("set setting", path, "to", value);
  console.log(settings);
}
