# AoC guidelines
This script/repo/tool does follow the automation guidelines on the [/r/adventofcode community wiki](https://www.reddit.com/r/adventofcode/wiki/faqs/automation)

## Outbound calls
Outbound calls are to https://adventofcode.com/2025/leaderboard/private/view/2252784.json at minute 30 past hour 5, 6, 7, 11, and 15 UTC, every day in december. (see .github/workflows/main.yml under on -> schedule -> cron)

Calls are also made at each merge of a pull request, which is not very often.

## UA-header
The User-Agent header under jobs -> update-scores -> steps -> Fetch Scores -> with -> configuration is set to the maintainers tfe@netcompany.com and chce@netcompany.com

# Status
|Action|Status|
|-|-|
| Update scores | [![Update Scores](https://github.com/Netcompany-AoC-DK/aoc-nc-scoreboard/actions/workflows/main.yml/badge.svg)](https://github.com/Netcompany-AoC-DK/aoc-nc-scoreboard/actions/workflows/main.yml) |
| Deploy (triggered by above) | [![pages-build-deployment](https://github.com/Netcompany-AoC-DK/aoc-nc-scoreboard/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/Netcompany-AoC-DK/aoc-nc-scoreboard/actions/workflows/pages/pages-build-deployment) |
