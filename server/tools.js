// /server/tools.js

function get_player_career_stats(playerName) {
  const stats = {
    "Virat Kohli": "Matches: 240, Runs: 7466, SR: 130.5, HS: 113",
    "Jasprit Bumrah": "Matches: 122, Wickets: 148, Econ: 7.39, BBI: 5/10",
    "Rohit Sharma": "Matches: 245, Runs: 6328, SR: 130.4, HS: 109*",
    "Hardik Pandya": "Matches: 125, Runs: 2341, Wickets: 53, SR: 145.8",
    "MS Dhoni": "Matches: 252, Runs: 5121, SR: 136.2, HS: 84*"
  };
  return stats[playerName] || null;
}

function get_batsman_vs_bowler(batsman, bowler) {
  const matchups = {
    "Virat Kohli_Jasprit Bumrah": "Runs: 140, Balls: 92, Dismissals: 4, SR: 152.1",
    "Rohit Sharma_Sunil Narine": "Runs: 137, Balls: 129, Dismissals: 7, SR: 106.2",
    "MS Dhoni_Varun Chakaravarthy": "Runs: 11, Balls: 16, Dismissals: 3, SR: 68.7"
  };
  return matchups[`${batsman}_${bowler}`] || null;
}

function get_recent_form(playerName) {
  const form = {
    "Virat Kohli": "in form",
    "Jasprit Bumrah": "in form",
    "Rohit Sharma": "out of form",
    "Hardik Pandya": "unknown"
  };
  return form[playerName] || "unknown";
}

module.exports = {
  get_player_career_stats,
  get_batsman_vs_bowler,
  get_recent_form
};
