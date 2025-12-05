import { useEffect, useState } from 'react';
import './App.css';
enum HighscoreType {
  BothStars = 'bothstars',
  Delta = 'delta',
  StarGain = 'stargain',
  FirstStar = 'firststar',
  Total = 'total',
  TotalTime = 'totalTime',
}
const hourInMs = 1000*60*60;
const hourInS = 60*60;
const minuteInMs = 1000*60;
const minuteInS = 60;
const secondInMs = 1000;
let days = new Array(12).fill(false);
let lastDayOfAoC = new Date(2025, 11, 12);
let curDate = new Date();
let curDay = new Date(Math.min(+lastDayOfAoC, +curDate)).getDate()
const numEnabledDays = curDay;
days = days.map((_, idx) => idx+1 > numEnabledDays ? false : true)
const playerList = undefined

function initialiseScores(scores: any) {

  let playerList = sortPlayersForDay(""+numEnabledDays, HighscoreType.BothStars, Object.entries(scores.members))
  for (let i = 0; i < numEnabledDays; i++) {
    insertStarGainsForDay(""+(i+1), playerList);
  }
  playerList = sortPlayersForDay(""+numEnabledDays, HighscoreType.StarGain, playerList)
  return playerList;
} 


function App() {
  const [players, setPlayers] = useState<any[]>(playerList ?? []);
  useEffect(() => {
    import('./scores.json').then((score) => {
      new URLSearchParams(window.location.search).get('ex')?.split(',').forEach(id => (score as any).members[id] ? delete (score as any).members[id] : 0);
      setPlayers(initialiseScores(score));
    });
  },[])
  const [selectedDay, setSelectedDay] = useState<string>(""+numEnabledDays);
  const [selectedScoreType, setSelectedScoreType] = useState<HighscoreType>(HighscoreType.StarGain);
  const [showScoreboardInput, setShowScoreboardInput] = useState<boolean>(false);
  const [customJSON, setCustomJSON] = useState<string>('')
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <span>Netcompany - AoC 2025</span>
          <br />
          <a href="https://afterdark.netcompany.com/event/advent-of-code-2025/">AfterDark</a>
        </h1>
      </header>
      <div className="privboard-row">
        <span className="privboard-days">
          {days.map((day, idx) => {
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            return day ? <a href="" className={""+(idx+1) === selectedDay ? 'leaderboard-daylinks-selected':''} onClick={(ev) => {
              ev.preventDefault()
              ev.stopPropagation();
              ev.currentTarget.blur();
              setSelectedDay(""+(idx+1));
              setPlayers(sortPlayersForDay(""+(idx+1), selectedScoreType, players));
            }}>{(idx+1).toString().split('').map((dayNumber, dayNumberIdx) => <>{dayNumberIdx > 0 ? <br/> : <></>}{dayNumber}</>)}</a> : <span>{(idx+1).toString().split('').map((dayNumber, dayNumberIdx) => <>{dayNumberIdx > 0 ? <br/> : <></>}{dayNumber}</>)}</span>
          })}
        </span>
      </div>
      <section>
      <select value={selectedScoreType} onChange={(ev) => {
        const scoreType = ev.target.value as HighscoreType;
        setSelectedScoreType(scoreType)
        setPlayers(sortPlayersForDay(selectedDay, scoreType, players));
      }}>
              <option value={HighscoreType.BothStars}>Time to both stars</option>
              <option value={HighscoreType.FirstStar}>Time to first star</option>
              <option value={HighscoreType.Delta}>Time between star 1 and 2</option>
              <option value={HighscoreType.StarGain}>Points gained</option>
              <option value={HighscoreType.Total}>Total at day {selectedDay}</option>
              <option value={HighscoreType.TotalTime}>Total time at day {selectedDay}</option>
      </select>

        {players.map((player, idx) => {
          return renderPlayer(player[1], selectedDay, player.placement, selectedScoreType, player.placement === idx+1 ? false: true);
        })}
        
      </section>
      <aside className={`score-input-aside ${showScoreboardInput ? 'expanded' : ''}`}>
        <label htmlFor="scoresinput">Insert custom scoreboard JSON</label><button className="link-like-button" onClick={() => setShowScoreboardInput(!showScoreboardInput)}>{showScoreboardInput ? '-' : '+'}</button>
        {showScoreboardInput && <textarea id="scoresinput" value={customJSON} onChange={(ev) => {
          setCustomJSON(ev.target.value)
        }}></textarea>}
        {showScoreboardInput && <button onClick={() => {
          let parsedScore = JSON.parse(customJSON);
          let playerList = initialiseScores(parsedScore);
          setPlayers(playerList);
        }}>Set scoreboard</button>}
      </aside>
    </div>
  );
}
function getNthStarTs(player: any, n: number, day: string) {
  return player.completion_day_level[day]?.[""+n]?.get_star_ts;
}

function setPlacements(players: any[], day: string, comp: (playerA: any, playerB: any, day: string) => number): any[] {
  let prev: any; // Kunne gøres smartere... Men dette er lettest :-)
  players.forEach((t,i,a) => {
    if (i === 0) {
      t.placement = i+1;
      prev = t;
      return t
    }
    if (comp(t,prev,day) === 0) {
      t.placement = prev.placement;
      prev = t
      return t;
    } else {
      t.placement = i+1
      prev = t
      return t;
    }
  });
  return players;
}

function sortPlayersForDay(day: string, highscoreType: HighscoreType, playerList: any[]): any[] {
  switch(highscoreType) {
    case HighscoreType.BothStars:
      return setPlacements(bothStarsSort(day, playerList),day,bothStarsCompare)
    case HighscoreType.Delta:
      return setPlacements(deltaDaySort(day, playerList), day, deltaDayCompare)
    case HighscoreType.StarGain:
      return setPlacements(starGainSort(day, playerList), day, starGainCompare)
    case HighscoreType.FirstStar:
      return setPlacements(firstStarSort(day, playerList), day, firstStarCompare)
    case HighscoreType.Total:
      return setPlacements(totalScoreSort(day, playerList), day, totalScoreCompare)
    case HighscoreType.TotalTime:
      return setPlacements(totalTimeSort(day, playerList), day, totalTimeCompare)
  }
}

function bothStarsCompare(playerA: any, playerB: any, day: string) {
  const playerA2Ts = getNthStarTs(playerA[1], 2, day);
  const playerB2Ts = getNthStarTs(playerB[1], 2, day);
  const playerA1Ts = getNthStarTs(playerA[1], 1, day);
  const playerB1Ts = getNthStarTs(playerB[1], 1, day);
  if (playerA2Ts && playerB2Ts) {
    return playerA2Ts - playerB2Ts;
  } else if (playerA2Ts && !playerB2Ts) {
    return playerA2Ts - Number.MAX_SAFE_INTEGER;
  } else if (!playerA2Ts && playerB2Ts) {
    return Number.MAX_SAFE_INTEGER - playerB2Ts;
  }
  return (playerA1Ts ?? Number.MAX_SAFE_INTEGER) - (playerB1Ts ?? Number.MAX_SAFE_INTEGER);
}

function bothStarsSort(day: string, playerList: any[]): any[] {
  return [...playerList].sort((playerA, playerB) => bothStarsCompare(playerA, playerB, day));
}

function deltaDayCompare(playerA: any, playerB: any, day: string) {
  const playerA2Ts = getNthStarTs(playerA[1], 2, day);
  const playerB2Ts = getNthStarTs(playerB[1], 2, day);
  const playerA1Ts = getNthStarTs(playerA[1], 1, day);
  const playerB1Ts = getNthStarTs(playerB[1], 1, day);
  if (playerA2Ts && playerB2Ts) {
    return (playerA2Ts - playerA1Ts) - (playerB2Ts - playerB1Ts);
  } else if (playerA2Ts && !playerB2Ts) {
    return (playerA2Ts - playerA1Ts) - Number.MAX_SAFE_INTEGER;
  } else if (!playerA2Ts && playerB2Ts) {
    return Number.MAX_SAFE_INTEGER - (playerB2Ts - playerB1Ts);
  }
  return 0;
}

function deltaDaySort(day: string, playerList: any[]) {
  return [...playerList].sort((playerA, playerB) => deltaDayCompare(playerA, playerB, day));
}

function totalScoreCompare(playerA: any, playerB: any, day: string) {
  let a = 0;
  let b = 0;
  for (let i = 1; i <= +day; i++) {
    a+=getTotalPointGainForDay(i, playerA[1]);
    b+=getTotalPointGainForDay(i, playerB[1]);
  }
  return b-a;
}

// You can get away with all kinds of sickening complexity when N < 200
function totalScoreSort(day: string, playerList: any[]) {
  return [...playerList].sort((playerA, playerB) => totalScoreCompare(playerA,playerB,day))
}


function totalTimeCompare(playerA: any, playerB: any, day: string) {
  let a = 0;
  let b = 0;
  for (let i = 1; i <= +day; i++) {
    const date0S = new Date(2025, 11, i, 6, 0, 0, 0).getTime()/1000;
    a+=getNthStarTs(playerA[1], 2, i.toString())-date0S;
    b+=getNthStarTs(playerB[1], 2, i.toString())-date0S;
  }
  if (isNaN(a)) {
    a = Number.MAX_SAFE_INTEGER;
  }
  if (isNaN(b)) {
    b = Number.MAX_SAFE_INTEGER;
  }
  return a-b;
}

function totalTimeSort(day: string, playerList: any[]) {
  return [...playerList].sort((playerA, playerB) => totalTimeCompare(playerA,playerB,day))
}

function starGainCompare(playerA: any, playerB: any, day: string) {
  const playerA1Star = parseInt(playerA[1].completion_day_level[day]?.["1"]?.star_gain);
  const playerA2Star = parseInt(playerA[1].completion_day_level[day]?.["2"]?.star_gain);
  const playerAStarGain = playerA1Star + playerA2Star;
  const playerB1Star = parseInt(playerB[1].completion_day_level[day]?.["1"]?.star_gain);
  const playerB2Star = parseInt(playerB[1].completion_day_level[day]?.["2"]?.star_gain);
  const playerBStarGain = playerB1Star + playerB2Star;
  return playerBStarGain - playerAStarGain;
}
function starGainSort(day: string, playerList: any[]) {
  return [...playerList].sort((playerA, playerB) => starGainCompare(playerA, playerB, day));
}

function firstStarCompare(playerA: any, playerB: any, day: string) {
  const playerA1Ts = getNthStarTs(playerA[1], 1, day);
  const playerB1Ts = getNthStarTs(playerB[1], 1, day);
  if (playerA1Ts && playerB1Ts) {
    return (playerA1Ts) - (playerB1Ts);
  } else if (playerA1Ts && !playerB1Ts) {
    return (playerA1Ts) - Number.MAX_SAFE_INTEGER;
  } else if (!playerA1Ts && playerB1Ts) {
    return Number.MAX_SAFE_INTEGER - (playerB1Ts - playerB1Ts);
  }
  return 0;
}

function firstStarSort(day: string, playerList: any[]) {
  return [...playerList].sort((playerA, playerB) => firstStarCompare(playerA, playerB, day));
}

function insertStarGainsForDay(day: string, playerList: any[]) {
  let firstStarSortedList = firstStarSort(day, playerList);
  let secondStarSortedList = bothStarsSort(day, playerList);
  firstStarSortedList.forEach((player, idx, players) => {
    let dayCompletion = player[1].completion_day_level[day]?.["1"];
    if (dayCompletion) {
      dayCompletion.star_gain = players.length-idx;
    } else {
      player[1].completion_day_level[day] = {
        '1': {
          star_gain: 0,
        },
      }
    }
  });
  secondStarSortedList.forEach((player, idx, players) => {
    let dayCompletion = player[1].completion_day_level[day]?.["2"];
    if (dayCompletion) {
      dayCompletion.star_gain = players.length-idx;
    } else {
      player[1].completion_day_level[day] = {
        ...player[1].completion_day_level[day],
        '2': {
          star_gain: 0,
        },
      }
    }
  });
}

function renderUnixTimestamp(ts: number, day: string): string {
  if (ts === undefined) {
    return '';
  }
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  const date0Ms = new Date(2025, 11, parseInt(day), 6, 0, 0, 0).getTime();
  const finishTime = new Date(ts * 1000).getTime();
  const diff = finishTime - date0Ms;

  const playerHours = Math.floor(diff/hourInMs);
  const playerMinutes = Math.floor((diff%hourInMs)/minuteInMs);
  const playerSeconds = Math.floor((diff%minuteInMs)/secondInMs);
  // Will display time in 10:30:23 format
  var formattedTime = playerHours + ':' + playerMinutes.toString().padStart(2, "0")+ ':' + playerSeconds.toString().padStart(2, "0");
  return formattedTime
}

function renderPlayerTime(player: any, selectedDay: string, highscoreType: HighscoreType) {
  if (highscoreType === HighscoreType.BothStars || highscoreType === HighscoreType.FirstStar) {
    return `${renderUnixTimestamp(player.completion_day_level?.[selectedDay]?.["1"]?.get_star_ts as number, selectedDay)} / ${renderUnixTimestamp(player.completion_day_level?.[selectedDay]?.["2"]?.get_star_ts as number, selectedDay)}`
  } else if (highscoreType === HighscoreType.Delta) {
    return renderPlayerDeltaTimestamp(player, selectedDay);
  } else if (highscoreType === HighscoreType.StarGain) {
    let star1Gain = player.completion_day_level?.[selectedDay]?.["1"]?.star_gain;
    let star2Gain = player.completion_day_level?.[selectedDay]?.["2"]?.star_gain;
    return <><span className="privboard-star-firstonly">{star1Gain}</span>{' / '}<span className="privboard-star-both">{star2Gain}</span>{' -> '}<span className="privboard-star-both">{(star1Gain??0)+(star2Gain??0)}</span></>;
  } else if (highscoreType === HighscoreType.Total) {
    let total = 0;
    for (let i = 1; i <= +selectedDay; i++) {
      total += getTotalPointGainForDay(i,player);
    }
    return total
  } else if (highscoreType === HighscoreType.TotalTime) {
    let total = 0;
    for (let i = 1; i <= +selectedDay; i++) {
      const date0S = new Date(2025, 11, i, 6, 0, 0, 0).getTime()/1000;
      total += getNthStarTs(player, 2, ''+i) - date0S;
    }
    if (isNaN(total)) {
      total = 0
    }
    return msToTimestamp(total);
  }
}

function getTotalPointGainForDay(day: number, player: any) {
  let star1Gain = player.completion_day_level?.[''+day]?.["1"]?.star_gain;
  let star2Gain = player.completion_day_level?.[''+day]?.["2"]?.star_gain;
  return star1Gain+star2Gain;
}

function msToTimestamp(ms: number) {
  const playerHours = Math.floor(ms/hourInS);
  const playerMinutes = Math.floor((ms%hourInS)/minuteInS);
  const playerSeconds = Math.floor((ms%minuteInS));
  var formattedTime = playerHours + ':' + playerMinutes.toString().padStart(2, "0")+ ':' + playerSeconds.toString().padStart(2, "0");
  return formattedTime;
}

function renderPlayerDeltaTimestamp(player: any, selectedDay: string) {
  const firstStarTime = player.completion_day_level?.[selectedDay]?.["1"]?.get_star_ts;
  const secondStarTime = player.completion_day_level?.[selectedDay]?.["2"]?.get_star_ts;
  if (secondStarTime === undefined) {
    return '';
  }
  const deltaStarTime = secondStarTime - firstStarTime;
  const playerHours = Math.floor(deltaStarTime/hourInS);
  const playerMinutes = Math.floor((deltaStarTime%hourInS)/minuteInS);
  const playerSeconds = Math.floor((deltaStarTime%minuteInS));
  var formattedDelta = playerHours + ':' + playerMinutes.toString().padStart(2, "0")+ ':' + playerSeconds.toString().padStart(2, "0");
  return formattedDelta;
}

function getPlacementClass(idx: number) {
  switch(idx) {
    case 0:
      return 'privboard-star-both';
    case 1:
      return 'privboard-star-firstonly';
    case 2:
      return 'privboard-third';
    default:
      return '';
  }
}

function renderPlayer(player: any, selectedDay: string, placement: number, highscoreType: HighscoreType, shared: boolean) {
  let placementOffset =Array(Math.floor(Math.log10(placement))+2).fill(' ').join('')
  return (
    <div className="privboard-row" title={player.id}>
      <span className="privboard-position">{!shared?placement+')':placementOffset}</span> {renderPlayerTime(player, selectedDay, highscoreType)} <span className={`privboard-name ${getPlacementClass(placement-1)} ${player.name === null ? 'leaderboard-anon' : ''}`}>{player.name ?? `(anonymous user #${player.id})`}</span></div>
  )
}

export default App;
