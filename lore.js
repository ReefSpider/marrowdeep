'use strict';
/* ===== lore: the codex, remembrance stones (koans that ask you to choose), epigraphs ===== */
const VOWS={
  release:{n:'Release',jp:'放',d:'+8 Life',k:'life',v:8},
  carry:{n:'Carry',jp:'担',d:'+4% Damage',k:'dmg',v:4},
  forgive:{n:'Forgive',jp:'赦',d:'+1% Life Stolen',k:'ls',v:1},
  remember:{n:'Remember',jp:'憶',d:'+2% Critical Strike',k:'crit',v:2},
  endure:{n:'Endure',jp:'忍',d:'+6 Defense',k:'def',v:6},
  seek:{n:'Seek',jp:'求',d:'+8% Magic Find',k:'mf',v:8}
};
const CODEX=[
  {id:'varhollow',k:'伯爵',t:'Count Varhollow',x:'Lord of Hollowmere for thirty winters. A careful man; the songs call him just. When the Host surrounded the city he sat up nine nights with his ledgers, and on the tenth he did the arithmetic: one city, or one wall.',q:'Is a sum correct if you are one of the numbers?',a:[['Yes. Arithmetic does not ask permission.','endure'],['No. A sum that eats its own numbers is only hunger.','remember']]},
  {id:'host',k:'灰軍',t:'The Ashen Host',x:'The border garrisons of three kingdoms, buried where they fell in a war nobody remembers. The ground there was not consecrated, only tired. The Host does not hate the living. It has forgotten how anything else feels.'},
  {id:'wound',k:'傷',t:'The Wound',x:'The Lantern College called it the Eye Above and argued for a century about whether it was a god. It is not. A god wants something. The Wound only answers, and it answers anyone who asks loudly enough.'},
  {id:'marrow',k:'骨髄',t:'The Marrowdeep',x:'Below Hollowmere lies an older Hollowmere, and below that, the Pit. The first city was built by the Bone Kings, who believed the dead should be kept close, the way one keeps money close. They were not wrong about the money.',q:'Do we keep the dead, or do the dead keep us?',a:[['We keep them. It is the last thing we can give.','carry'],['They keep us. Every grave is an anchor.','release']]},
  {id:'bonekings',k:'骨王',t:'The Bone Kings',x:'Seven kings, each buried sitting upright on the throne of the last. When the eighth died there was no room, so they buried him standing, and he is standing still. Somewhere under your feet he is waiting to be told he may sit.',q:'What is a crown worth to a man who cannot sit down?',a:[['Nothing. He should have refused it.','release'],['Everything. That is why he still stands.','endure']]},
  {id:'mother',k:'泣母',t:'The Weeping Mother',x:'Agathe was midwife to the lower wards for forty years. She kept the ones who did not live in a cradle she built herself, because she could not bear to give them to the Pit. The Pit came for them anyway. It let her keep holding them.'},
  {id:'crows',k:'鴉',t:'The Crows',x:'A crow will carry a letter between the living and the dead, if it likes you. Crows do not like most people. They liked your sister at once.',q:'Who chose whom?',a:[['She chose them. She always reaches first.','forgive'],['They chose her. Some lights are easy to find.','seek']]},
  {id:'bell',k:'鐘',t:'The Silent Bell',x:'The chapel bell was cast from the chains of the drowned. It has rung every night for two hundred years and no one living has heard it. You heard it in the shaft. You did not tell anyone.',q:'If a bell rings and no one hears it, who is it for?',a:[['For the ones who drowned.','remember'],['For whoever is next.','endure']]},
  {id:'choir',k:'聖歌',t:'Choir of Teeth',x:'Seven choristers prayed to sing one hymn forever, and the Wound, which answers, granted it. They no longer need eyes. They no longer need breath. They have not finished the first verse.'},
  {id:'tithe',k:'十一',t:'The Tithe',x:'Hollowmere paid the Pit one soul in ten, every generation, and called it peace. The ledgers are kept down here. Every name has a number. Your father\'s is in the third volume.',q:'Can a debt be just if no one living agreed to it?',a:[['No. It is only a habit with teeth.','release'],['It can still be paid. That is what makes it heavy.','carry']]},
  {id:'merchant',k:'商人',t:'The Pale Merchant',x:'He has no face, because a face is a kind of promise and he does not make promises. He sells you what you need at exactly the price you can afford. He has never been wrong about either.',q:'If the price is always fair, why does it always hurt?',a:[['Because fairness and mercy are different coins.','forgive'],['Because I wanted it for free.','seek']]},
  {id:'collector',k:'徴収',t:'The Tithe-Collector',x:'The first tax-collector of Hollowmere. He collected for so long that the collecting outlived the man. The cage on his back holds the ones who could not pay. They still try to hand him what they have.'},
  {id:'kiln',k:'窯',t:'The Kiln',x:'The old church made saints the slow way. A candidate was walled into the Kiln with nothing but prayer. If they came out burnt, they were a martyr. If they came out whole, they were a liar. No one ever came out whole.',q:'Is suffering proof of anything?',a:[['Only that you suffered.','release'],['That you did not let it stop you.','endure']]},
  {id:'mask',k:'面',t:'The Gold Masks',x:'The masks were made from the reliquary gold of poor parishes, melted down. Every mask is someone\'s offering. Every face behind one is someone else\'s.',q:'Whose face do you wear when you fight?',a:[['My own. It is the only one I have left.','remember'],['Whoever Ilse needs me to be.','carry']]},
  {id:'saint',k:'聖者',t:'Saint Without Skin',x:'Saint Aurel was martyred thirteen times, and each time the church needed her back. The fourteenth time they nailed a gold mask over what was left so the pilgrims would not see. She has held her arms out for three hundred years. Her arms are very tired.'},
  {id:'brand',k:'烙印',t:'The Brand',x:'Those who climb out of the Pit come back marked. What you have learned are not gifts. They are scars, each burned in by something that nearly killed you. The Pit teaches. It does not care whether you survive the lesson.',q:'Would you trade the scars to forget the lessons?',a:[['Yes. I would rather be a fool and whole.','release'],['No. They are the only proof I was here.','remember']]},
  {id:'mu',k:'無',t:'Mu',x:'A monk once asked whether the Pit has a bottom. The answer was one word: mu. Not yes. Not no. Unask the question.',q:'What were you climbing toward before you fell?',a:[['Silver. Then dawn. Now only her.','carry'],['Nothing. I only learned to want after I fell.','seek']]},
  {id:'hound',k:'猟犬',t:'The Hound',x:'There was a knight who loved his rage more than his name. When he died the rage stayed, the way a dog stays at a grave. It will wear anyone who lets it. You let it.'},
  {id:'hanged',k:'吊',t:'The Hanged',x:'Debtors who could not pay hanged themselves from the Warren\'s beams rather than be collected. The Pit found this very funny. It lets them drop.'},
  {id:'witch',k:'灯',t:'Lantern Witches',x:'Midwives of the underground who learned to deliver light instead of children. Each lantern holds the last breath of someone who died alone.'},
  {id:'hounds',k:'溝犬',t:'Gutter Hounds',x:'The dogs of the besieged city ate what they found. What they found was in the Pit. They still remember being good dogs. They do not remember who for.'},
  {id:'penitent',k:'懺悔',t:'The Penitent',x:'Monks who believed pain was a currency the Wound would accept. It does. It never gives change.'},
  {id:'knight',k:'剥騎',t:'The Flayed Knights',x:'Varhollow\'s own household guard, offered first. Their armour was kept. Their skin was not.'},
  {id:'nun',k:'蝋尼',t:'Candle Nuns',x:'They kept vigil so long the candles grew into them. If they stop praying, the flame goes out, and so do they.'},
  {id:'debtor',k:'金債',t:'The Gilded Debtor',x:'He borrowed from everyone and repaid no one, and now he cannot stop running from the collection. Catch him and the debts come loose.'},
  {id:'ilse',k:'妹',t:'Ilse',x:'Your sister. Nineteen. Clever, stubborn, coughing. She has kept a candle in the window every night since you went to the wall. She says it is so you can find the house. You both know it is so she can sleep.'},
  {id:'crowned',k:'冠傷',t:'The Crowned Wound',x:'In the end Varhollow did not sell the city. He sold himself, and the Wound took the rest as interest. What you fought was the receipt.'},
  {id:'dawn',k:'夜明',t:'Dawn',x:'It is an ordinary morning. That is the miracle.'}
];
const CX=Object.fromEntries(CODEX.map(c=>[c.id,c]));
const STONES={wall:['varhollow'],ossuary:['marrow','bonekings'],chapel:['crows','bell'],warren:['tithe','merchant'],kiln:['kiln','mask'],breach:['brand','mu']};
const TYPE_CODEX={husk:'host',hanged:'hanged',witch:'witch',hound:'hounds',penitent:'penitent',knight:'knight',nun:'nun',debtor:'debtor'};
const BOSS_CODEX={mother:'mother',choir:'choir',tithe:'collector',saint:'saint',count:'crowned'};
const BOSS_FAREWELL={mother:'Let them go, Agathe.',choir:'The hymn ends. Silence is also a note.',tithe:'The account is closed.',saint:'Rest your arms.',count:'The crown was always hollow.'};
const EPIGRAPH={
  wall:{k:'無常',r:'mujō',t:'Impermanence. The wall was built to last forever. So was everything that fell.'},
  ossuary:{k:'骨',r:'hone',t:'Bone. What remains when the story has finished telling itself.'},
  mother:{k:'縁',r:'en',t:'A bond between two lives. It does not care which end is still breathing.'},
  chapel:{k:'静寂',r:'seijaku',t:'Stillness. The water is quiet because everything in it stopped struggling.'},
  choir:{k:'声',r:'koe',t:'A voice. A hymn sung long enough forgets who it was for.'},
  warren:{k:'義理',r:'giri',t:'Obligation. A debt you did not choose, carried in a body you did not choose.'},
  tithe:{k:'業',r:'gō',t:'Karma. Not punishment. Accounting.'},
  kiln:{k:'侘寂',r:'wabi-sabi',t:'The beauty of what is cracked and burnt. Here they made saints by removing everything else.'},
  saint:{k:'我慢',r:'gaman',t:'Endurance. To bear the unbearable with dignity. She bore it. She is bearing it still.'},
  breach:{k:'間',r:'ma',t:'The space between. Between the Pit and the sky. Between the one who fell and the one who climbs.'},
  count:{k:'物の哀れ',r:'mono no aware',t:'The ache of things passing. Even a war. Even a king. Even you.'}
};
const DEATH_LINES=[
  {k:'死',t:'Not here. Not yet.'},
  {k:'七転八起',t:'Fall seven times. Stand up eight.'},
  {k:'無常',t:'All that rises is already falling. Rise anyway.'},
  {k:'縁',t:'The thread to her is still taut. Follow it back.'},
  {k:'業',t:'The Pit keeps accounts. So do you.'},
  {k:'一期一会',t:'This attempt will never come again. Neither will the next.'}
];
let CODEX_OPEN=new Set(), VOWS_TAKEN={};
function unlockCodex(id){ if(!id||CODEX_OPEN.has(id)||!CX[id]) return false; CODEX_OPEN.add(id); toast(`記　${CX[id].k}　${CX[id].t} added to the Codex`); AU.tone('sine',523,523,1.2,.06,.8); return true; }
function vowBonus(k){ let s=0; for(const id in VOWS_TAKEN){ const v=VOWS[VOWS_TAKEN[id]]; if(v&&v.k===k) s+=v.v; } return s; }
