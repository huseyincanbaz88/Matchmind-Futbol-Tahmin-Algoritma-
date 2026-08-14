import {writeFile} from 'node:fs/promises';

const key=process.env.API_FOOTBALL_KEY;
if(!key)throw new Error('API_FOOTBALL_KEY eksik');

const leagues=[39,61,78,135,140,203];
const now=new Date();
const season=now.getUTCMonth()<6?now.getUTCFullYear()-1:now.getUTCFullYear();
const median=values=>{const sorted=[...values].sort((a,b)=>a-b);return sorted.length?sorted[Math.floor((sorted.length-1)/2)]:null};
const days=Array.from({length:7},(_,offset)=>{
  const date=new Date(Date.now()+offset*86400000);
  return date.toISOString().slice(0,10);
});

const rows=[];
for(const date of days){
  for(const league of leagues){
    let page=1,total=1;
    do{
      const url=new URL('https://v3.football.api-sports.io/odds');
      url.searchParams.set('league',league);
      url.searchParams.set('season',season);
      url.searchParams.set('date',date);
      url.searchParams.set('page',page);
      const response=await fetch(url,{headers:{'x-apisports-key':key}});
      if(!response.ok)throw new Error(`API ${response.status}: ${await response.text()}`);
      const payload=await response.json();
      total=payload.paging?.total||1;
      for(const event of payload.response||[]){
        const sets=[];
        for(const bookmaker of event.bookmakers||[]){
          const bet=bookmaker.bets?.find(item=>item.id===1||/match winner/i.test(item.name));
          if(!bet)continue;
          const value=name=>Number(bet.values?.find(item=>String(item.value).toLowerCase()===name)?.odd);
          const home=value('home'),draw=value('draw'),away=value('away');
          if(home>1&&draw>1&&away>1)sets.push({home,draw,away});
        }
        if(!sets.length)continue;
        const home=median(sets.map(x=>x.home)),draw=median(sets.map(x=>x.draw)),away=median(sets.map(x=>x.away));
        const raw=[1/home,1/draw,1/away],sum=raw.reduce((a,b)=>a+b,0);
        rows.push({fixtureId:event.fixture.id,date:event.fixture.date,league:event.league.name,home:event.teams.home.name,away:event.teams.away.name,odds:{home,draw,away},probabilities:{home:raw[0]/sum,draw:raw[1]/sum,away:raw[2]/sum},bookmakerCount:sets.length,updated:event.update||new Date().toISOString()});
      }
      page++;
    }while(page<=total);
  }
}

await writeFile('odds-feed.json',JSON.stringify({generatedAt:new Date().toISOString(),range:{from:days[0],to:days.at(-1)},matches:rows},null,2)+'\n');
console.log(`${days[0]}–${days.at(-1)}: ${rows.length} maç oranı güncellendi`);
