'use strict';
/* ===== the story in pages (v19) =====
   The spine: you took Count Varhollow's silver to buy medicine for your sister Ilse, who coughs. She gave you a candle
   stub and told you to bring it back lit. On the ninetieth night Varhollow sold the wall to the Wound to save the city,
   and you fell with it. In the Pit the stub never lights. Each boss is someone the Pit kept, and each one gives you a
   piece of the truth: Agathe delivered you both; the Choir sings your mother's lullaby; the Tithe ledger has Ilse's
   name written in next, after your father's; and Saint Aurel tells you what the ending means — you died on the wall,
   and you are climbing because someone keeps calling. At the end Ilse lights your stub from hers.
   Every panel id here is a slot for a Higgsfield still (see the shot list in the project: claude/higgsfield-shots.md). */
const Y=56.25;
const LY={
  wide3:(a,b,c)=>[Object.assign(a,{r:[0,0,100,30.5]}),Object.assign(b,{r:[0,32,49,24.25],sl:[0,2,0,-2]}),Object.assign(c,{r:[51,32,49,24.25],sl:[2,0,-2,0]})],
  tall2:(a,b)=>[Object.assign(a,{r:[0,0,49,Y],sl:[0,3,0,-3]}),Object.assign(b,{r:[51,0,49,Y],sl:[3,0,-3,0]})],
  l4:(a,b,c,d)=>[Object.assign(a,{r:[0,0,55,Y],sl:[0,3,0,-2]}),Object.assign(b,{r:[57,0,43,17.75],sl:[3,0,1.42,0]}),Object.assign(c,{r:[57,19.25,43,17.75],sl:[1.29,0,-.29,0]}),Object.assign(d,{r:[57,38.5,43,17.75],sl:[-.42,0,-2,0]})],
  top2:(a,b,c)=>[Object.assign(a,{r:[0,0,49,26],sl:[0,2,0,-2]}),Object.assign(b,{r:[51,0,49,26],sl:[2,0,-2,0]}),Object.assign(c,{r:[0,27.5,100,28.75]})],
  one:(a)=>[Object.assign(a,{r:[0,0,100,Y]})]
};
const STORY={
  opening:[
    {panels:LY.wide3(
      {id:'op-1-wall',art:'wall_siege',cap:[{t:'The ninetieth night of the siege. The Ashen Host has no supply lines. Its dead get back up.',jp:'籠城、九十日目'}]},
      {id:'op-2-window',art:'window_candle',cap:[{t:'Below the wall, one house still keeps a window lit.',at:'bl'}]},
      {id:'op-3-candle',art:'hands_candle',say:[{t:'Bring it back lit.',at:[.62,.24]}],cap:[{t:'Ilse. Nineteen. She coughs when she laughs, so she laughs less.',at:'bl'}]})},
    {panels:LY.l4(
      {id:'op-4-eyes',px:3,art:'sellsword_eyes',v:'calm',say:[{t:'By dawn.',who:'you',at:[.5,.88]}],cap:[{t:'You took Count Varhollow\'s silver. Silver buys medicine.',jp:'銀貨は薬になる'}]},
      {id:'op-5-crow',px:3,art:'crow',cap:[{t:'The crows watched you go. They liked her at once.',at:'bl',w:.5}]},
      {id:'op-6-count',art:'count_crown',cap:[{t:'The Count has done arithmetic for nine nights.',at:'bl',w:.38}]},
      {id:'op-7-wall',alt:'wall_siege',shot:'start',cap:[{t:'Tonight you would settle for dawn.',at:'bl'}]})}],
  'act:Act I':[
    {panels:LY.wide3(
      {id:'a1-1-fall',art:'fall',fx:'down',sfx:{t:'落',at:[.82,.5],size:7,red:1},cap:[{t:'Varhollow sold the wall to save the city. Every soul on it was the price. You fell.',jp:'城壁は売られた'}]},
      {id:'a1-2-eye',art:'wound_eye',cap:[{t:'Something above counted the falling, one by one.',at:'bl'}]},
      {id:'a1-3-stub',px:3,art:'candle_close',v:'unlit',cap:[{t:'You held on to the candle. You don\'t remember deciding to.',at:'bl'}]})},
    {panels:LY.wide3(
      {id:'a1-4-level',alt:'bones_wake',shot:'start',cap:[{t:'Act I — The Marrowdeep. Under Hollowmere there is an older city, and under that, the Pit.',jp:'第一幕　骨髄の底'}]},
      {id:'a1-5-bones',art:'bones_wake',cap:[{t:'You woke among the Bone Kings\' dead. The stub was still in your fist. Unlit.',at:'bl'}]},
      {id:'a1-6-up',art:'sellsword_back',say:[{t:'Up.',who:'you',at:[.75,.75]}],cap:[{t:'Nothing that falls here is supposed to climb out.',at:'tl'}]})}],
  'boss:mother':[
    {panels:LY.l4(
      {id:'b1-1-fall',alt:'cradle',shot:'boss',sfx:{t:'静',at:[.8,.2],size:6},cap:[{t:'Agathe. Midwife to the lower wards for forty years.',jp:'産婆アガーテ',at:'bl'}]},
      {id:'b1-2-agathe',art:'agathe',say:[{t:'I know that scowl. I pulled you into the world. You screamed for an hour.',dead:1,at:[.21,.36],w:.42}]},
      {id:'b1-3-cradle',art:'cradle',say:[{t:'Your sister never made a sound. I thought I\'d lost her. Tell her she was worth the fright.',dead:1,at:[.5,.3]}]},
      {id:'b1-4-rise',art:'cradle',v:'rise',cap:[{t:'Let them go, Agathe.',at:'bl'}],say:[{t:'…All right.',dead:1,at:[.7,.25]}]})}],
  'act:Act II':[
    {panels:LY.wide3(
      {id:'a2-1-level',alt:'bell',shot:'start',cap:[{t:'Act II — The Drowned. The water down here is black and warm, and it sings.',jp:'第二幕　溺れし者'}]},
      {id:'a2-2-bell',art:'bell',cap:[{t:'The bell under the water rang once. Only you heard it.',at:'bl'}]},
      {id:'a2-3-letter',px:3,art:'crow_letter',cap:[{t:'"Mrs. Harl says to stop setting your place at the table. I haven\'t. The cough is worse, so don\'t you dare hurry. Come home in one piece. — I"',letter:1,at:'tl'}]})}],
  'boss:choir':[
    {panels:LY.wide3(
      {id:'b2-1-fall',alt:'choir_mouths',shot:'boss',sfx:{t:'唄',at:[.78,.3],size:6},cap:[{t:'Seven mouths. One hymn. Two hundred years on the first verse.',jp:'未完の一節'}]},
      {id:'b2-2-mouths',art:'choir_mouths',say:[{t:'…and the lamp shall not go out…',dead:1,at:[.5,.5],w:.4}]},
      {id:'b2-3-eyes',px:3,art:'sellsword_eyes',v:'tear',say:[{t:'…not while someone waits.',who:'you',at:[.78,.82]}],cap:[{t:'It was the lullaby your mother sang. You knew how it ended.',at:'tl'}]})},
    {panels:LY.one({id:'b2-4-shut',art:'choir_mouths',v:'shut',cap:[{t:'The hymn ends. Silence is also a note.',jp:'静寂もまた一音',at:'bl'}]})}],
  'act:Act III':[
    {panels:LY.l4(
      {id:'a3-1-level',alt:'ledger',shot:'start',cap:[{t:'Act III — The Debt. Somebody down here keeps the accounts.',jp:'第三幕　負債'}]},
      {id:'a3-2-ledger',px:3,art:'ledger',cap:[{t:'The Tithe: one soul in ten, every generation. Third volume.',at:'bl'}]},
      {id:'a3-3-father',px:3,art:'ledger',v:'father',cap:[{t:'Your father. Taken the winter you were seven.',at:'bl'}]},
      {id:'a3-4-ilse',px:3,art:'ledger',v:'close',crop:{y:.66,z:1.12},sfx:{t:'ドクン',at:[.82,.3],size:3.6,red:1},cap:[{t:'Under his name, the ink still wet: ILSE.',at:'tl',w:.62}]})}],
  'boss:tithe':[
    {panels:LY.wide3(
      {id:'b3-1-fall',alt:'cage_open',shot:'boss',sfx:{t:'断',at:[.85,.35],size:7},cap:[{t:'The first tax-collector of Hollowmere. The collecting outlived the man.',jp:'徴収人、倒る'}]},
      {id:'b3-2-cage',art:'cage_open',cap:[{t:'The cage opens. The debtors climb out, still holding out their coins.',at:'bl'}]},
      {id:'b3-3-struck',px:3,art:'ledger',v:'struck',say:[{t:'Paid.',who:'you',at:[.25,.25]}],cap:[{t:'You strike her name out with his own pen.',at:'bl'}]})}],
  'act:Act IV':[
    {panels:LY.wide3(
      {id:'a4-1-level',alt:'candle_close',shot:'start',cap:[{t:'Act IV — The Kiln. Here they made saints the old way: by fire, by nails, by patience.',jp:'第四幕　窯'}]},
      {id:'a4-2-letter',px:3,art:'crow_letter',cap:[{t:'"The sky has been red for nine days. I keep the candle going on the last of the wax. Whatever you are doing, it is working. — I"',letter:1}]},
      {id:'a4-3-stub',px:3,art:'candle_close',v:'blood',cap:[{t:'Your stub still won\'t light. You\'ve stopped trying.',at:'bl'}]})}],
  'boss:saint':[
    {panels:LY.l4(
      {id:'b4-1-fall',alt:'saint_arms',shot:'boss',sfx:{t:'解',at:[.8,.25],size:6},cap:[{t:'Saint Aurel. Martyred thirteen times. The church kept needing her back.',jp:'聖アウレル'}]},
      {id:'b4-2-mask',px:3,art:'mask_fall',cap:[{t:'The gold mask comes away. Underneath, only a tired woman.',at:'bl',w:.5}]},
      {id:'b4-3-arms',art:'saint_arms',v:'down',say:[{t:'You climb well, for a dead man.',dead:1,at:[.2,.24],w:.36}]},
      {id:'b4-4-ghost',art:'sellsword_back',v:'ghost',say:[{t:'You died on the wall, child. Someone keeps calling you up. Go, before she stops.',dead:1,at:[.5,.2]}],cap:[{t:'Rest your arms.',at:'bl'}]})}],
  'act:Act V':[
    {panels:LY.wide3(
      {id:'a5-1-level',alt:'wound_eye',shot:'start',cap:[{t:'Act V — The Breach. Ash falls upward now.',jp:'第五幕　裂け目'}]},
      {id:'a5-2-sky',art:'wound_eye',v:'ash',cap:[{t:'Above it: wind, a red sky, and a war that is not finished.',at:'bl'}]},
      {id:'a5-3-window',art:'window_candle',v:'low',cap:[{t:'"It\'s almost burnt down. I\'ll keep it lit as long as I\'m awake. Hurry."',letter:1,at:'tl'}]})}],
  'act:Finale':[
    {panels:LY.tall2(
      {id:'a6-1-field',alt:'count_crown',shot:'start',cap:[{t:'Finale — The Crowned Wound. The Host kneels in rows.',jp:'終幕　冠の傷'}]},
      {id:'a6-2-count',art:'count_crown',cap:[{t:'In the middle of them, a man is waiting for you with a crown on his head.',at:'bl'}]})}],
  'boss:count':[
    {panels:LY.wide3(
      {id:'b5-1-fall',alt:'crown_break',shot:'boss',sfx:{t:'崩',at:[.82,.4],size:7,red:1},cap:[{t:'The Crowned Wound comes apart like wet paper.',jp:'冠、崩る'}]},
      {id:'b5-2-face',px:3,art:'count_face',v:'crack',say:[{t:'One wall for one city. I did the arithmetic. It balanced.',dead:1,at:[.83,.5],w:.32}]},
      {id:'b5-3-crown',px:3,art:'crown_break',say:[{t:'I forgot to count myself.',dead:1,at:[.5,.24]}],cap:[{t:'The crown was always hollow.',at:'bl'}]})}],
  ending:[
    {panels:LY.wide3(
      {id:'e-1-dawn',art:'dawn_city',cap:[{t:'The Wound closed like an eye that had seen enough. Dawn came up grey over Hollowmere. The ordinary kind.',jp:'ただの夜明け'}]},
      {id:'e-2-door',art:'door',cap:[{t:'She had kept the candle lit for a hundred and four nights. It had a finger\'s width left.',at:'bl'}]},
      {id:'e-3-light',art:'hands_candle',v:'two',cap:[{t:'You held out the stub. She lit it from hers.',at:'bl'}]})},
    {panels:LY.tall2(
      {id:'e-4-embrace',art:'embrace',cap:[{t:'You were not the man who fell. She knew you anyway.',jp:'それでも妹は、兄だと分かった',at:'bl'}]},
      {id:'e-5-window',art:'candle_relit',cap:[{t:'Two candles in the window.',at:'tl'},{t:'七転八起 — Fall seven times. Stand up eight.',at:'br'}]})}]
};

/* ---------- how each panel moves (v22, see the motion layer in manga.js) ----------
   drift: [dx,dy] how far the picture slides across its frame (fraction of the frame) · dur: seconds to settle
   red: 'pulse' | 'beat' | 'flicker' · lights: [[x,y,radius,strength]] candle halos, as fractions of the still
   parts: particles, [kind,{options}] — dust, ash ({up:1} rises), embers ({from:[[x,y]]}), souls, streak, drip, tear, birds
   tremble: shake in the art's own blocks. Panels not listed still drift slowly. */
const MOTION={
  'op-1-wall':{drift:[.03,0],parts:[['embers',{from:[[.53,.2],[.62,.1],[.82,.13]],n:12}],['ash',{n:10,speed:.6}]]},
  'op-2-window':{drift:[-.025,0],lights:[[.65,.58,.1,.7]],parts:[['dust',{n:8}]]},
  'op-3-candle':{drift:[0,.02],lights:[[.49,.25,.12,.75]]},
  'op-4-eyes':{drift:[0,-.03],red:'pulse',dur:12},
  'op-5-crow':{drift:[.03,0],parts:[['dust',{n:8}]]},
  'op-6-count':{drift:[0,.035],red:'pulse',parts:[['ash',{up:1,n:16}]]},
  'a1-1-fall':{drift:[0,-.04],dur:8,parts:[['streak',{n:22}],['ash',{up:1,n:10,speed:2.5}]]},
  'a1-2-eye':{drift:[0,.03],red:'pulse',parts:[['ash',{n:14,speed:.8}]]},
  'a1-3-stub':{drift:[.025,0],parts:[['dust',{n:10}]]},
  'a1-5-bones':{drift:[-.03,0],parts:[['dust',{n:12}]]},
  'a1-6-up':{drift:[0,.04],parts:[['ash',{n:14,speed:.5}]]},
  'a2-2-bell':{drift:[0,.025],parts:[['drip',{n:5,xs:[.22,.35,.5,.66,.8],floor:.82}]]},
  'a2-3-letter':{drift:[-.025,0],red:'pulse',parts:[['dust',{n:8}]]},
  'a3-2-ledger':{drift:[.03,0],lights:[[.12,.5,.09,.7]],parts:[['dust',{n:10}]]},
  'a3-3-father':{drift:[.04,0],dur:20},
  'a3-4-ilse':{drift:[0,.02],red:'beat',tremble:.6},
  'a4-2-letter':{drift:[-.03,0],red:'pulse',lights:[[.86,.47,.12,.75]],parts:[['ash',{n:10,speed:.5}]]},
  'a4-3-stub':{drift:[0,.025],red:'beat',parts:[['ash',{n:10,speed:.5}]]},
  'a5-2-sky':{drift:[0,.03],red:'pulse',parts:[['ash',{up:1,n:26}],['embers',{n:10}]]},
  'a5-3-window':{drift:[.025,0],lights:[[.66,.74,.08,.6]]},
  'a6-2-count':{drift:[0,.03],parts:[['ash',{up:1,n:18}]]},
  'b1-2-agathe':{drift:[0,.02],parts:[['dust',{n:10}]]},
  'b1-3-cradle':{drift:[.02,0],lights:[[.82,.3,.06,.5]],parts:[['dust',{n:10}]]},
  'b1-4-rise':{drift:[.02,0],lights:[[.82,.3,.06,.5]],parts:[['souls',{from:[.56,.58],n:18}]]},
  'b2-2-mouths':{drift:[0,.02],tremble:.5,parts:[['dust',{n:8}]]},
  'b2-3-eyes':{drift:[0,-.02],parts:[['tear',{from:[.605,.64],fall:.3}]]},
  'b2-4-shut':{drift:[0,.015],dur:24,parts:[['ash',{n:12,speed:.35}]]},
  'b3-2-cage':{drift:[-.03,0],parts:[['dust',{n:10}]]},
  'b3-3-struck':{drift:[.025,0],red:'pulse'},
  'b4-2-mask':{drift:[0,.025],red:'pulse',parts:[['ash',{up:1,n:10}]]},
  'b4-3-arms':{drift:[0,.03],lights:[[.5,.2,.14,.45]],parts:[['ash',{up:1,n:14}]]},
  'b4-4-ghost':{drift:[0,.03],parts:[['ash',{up:1,n:20}]]},
  'b5-2-face':{drift:[0,.025],red:'beat'},
  'b5-3-crown':{drift:[.03,0],red:'pulse',parts:[['ash',{n:12,speed:.6}]]},
  'e-1-dawn':{drift:[.035,0],dur:20,parts:[['birds',{n:4,y:.08,h:.25}]]},
  'e-2-door':{drift:[0,.025],lights:[[.43,.46,.1,.7]]},
  'e-3-light':{drift:[0,.02],lights:[[.55,.2,.12,.8],[.48,.33,.09,.7]]},
  'e-4-embrace':{drift:[0,.025],lights:[[.32,.42,.08,.65]],parts:[['dust',{n:8}]]},
  'e-5-window':{drift:[0,.02],lights:[[.52,.52,.1,.75],[.625,.5,.1,.75]],parts:[['dust',{n:6}]]}
};

/* ---------- where the pages play ---------- */
function storyPlay(id,then){ const pages=STORY[id]; if(!pages||mgSeen(id)||RM_STORY()){ if(then) then(); return false; } mangaPlay(id,pages,then); return true; }
const RM_STORY=()=>false;
/* the opening replaces the old caption cut over the wall */
openingCut=function(){ L.redHour=0; const card=()=>{ mode='card'; showCard({title:'Prologue — The Hollowmere Wall',jp:'序章　ホロウミアの城壁',body:'The Host is on the wall. You have a shirt, a cloak, and two bare hands. There is a dead man ahead who will not need his sword.',buttons:[{label:'Go',fn:()=>{ hideCard(); mode='play'; hud.hidden=false; bark('bare',true); }}]}); };
  if(!storyPlay('opening',card)) card(); };
/* each act opens on its pages the first time; afterwards the old card */
(function(){ const o=actCard; actCard=function(act,next){ if(STORY['act:'+act]&&!mgSeen('act:'+act)&&!(typeof SECRET!=='undefined'&&SECRET.on)){ MG.shots.start=null; storyPlay('act:'+act,next); return; } return o(act,next); }; })();
/* a boss's last moment is shot as it falls; its pages follow the farewell, and the seal roll waits for them */
(function(){ const o=bossDefeated; bossDefeated=function(e){ const id='boss:'+e.kind, play=STORY[id]&&!mgSeen(id);
  if(play){ MG.pendingBoss=true; MG.shots.boss=mgShot(e.x,e.y-e.h*.5,1.3); }
  o(e);
  if(play) setTimeout(()=>{ caption(''); storyPlay(id,()=>{ MG.pendingBoss=false; const a=MG.after||[]; MG.after=[]; for(const f of a) f(); }); },3000); }; })();
if(typeof sealRoll==='function'){ const o=sealRoll; sealRoll=function(p,why){ if(MG.on||MG.pendingBoss){ (MG.after=MG.after||[]).push(()=>setTimeout(()=>sealRoll(p,why),600)); return; } return o(p,why); }; }
/* the ending: the pages, then the same choice as before */
(function(){ const o=playEnding; playEnding=function(){ if(mgSeen('ending')) return o();
  storyPlay('ending',()=>{ mode='card'; showCard({title:'The war is over.',jp:'戦は終わった。',body:'The Pit is not. It is still down there, under the city, under the grass, patient as a debt. Some nights you hear it calling the crows.',
    buttons:[{label:'Go home',fn:()=>{ hideCard(); campaignCleared(); }},{label:'Rest',ghost:1,fn:()=>{ hideCard(); campaignCleared(true); toTitle(); }}]}); }); }; })();
/* the Codex keeps the scenes: replay any you've seen from the pause menu */
(function(){ const o=openPause; openPause=function(){ o(); const col=$('#pause .col'); let b=$('#pStory'); if(!b&&col){ b=document.createElement('button'); b.className='btn ghost'; b.id='pStory'; b.textContent='Story'; col.insertBefore(b,$('#pCodex').nextSibling); }
  if(b) b.onclick=()=>{ const seen=Object.keys(STORY).filter(mgSeen); if(!seen.length){ toast('No scenes yet.'); return; } $('#pause').hidden=true;
    showCard({title:'The story so far',jp:'物語',body:'Choose a scene to read again.',buttons:seen.map(id=>({label:storyName(id),fn:()=>{ hideCard(); const sv=seenIntro['mg:'+id]; delete seenIntro['mg:'+id]; MG.shots.start=null; MG.replay=true; mangaPlay(id,STORY[id],()=>{ seenIntro['mg:'+id]=sv||1; openPause(); }); }})).concat([{label:'Back',ghost:1,fn:()=>{ hideCard(); openPause(); }}])}); }; }; })();
function storyName(id){ if(id==='opening') return 'The ninetieth night'; if(id==='ending') return 'Dawn'; if(id.startsWith('act:')) return id.slice(4); const k=id.slice(5); return BOSSES[k]?BOSSES[k].name:id; }
