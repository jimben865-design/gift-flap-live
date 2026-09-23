(() => {
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const ui={score:$('score'),wins:$('wins'),start:$('startPanel'),round:$('roundPanel'),victory:$('victoryPanel'),roundTitle:$('roundTitle'),roundText:$('roundText'),feed:$('eventFeed'),cooldown:$('cooldownInput')};
const W=canvas.width,H=canvas.height,GROUND=95;
let state='ready',score=0,wins=Number(localStorage.getItem('giftFlapWins')||0),lastJump=0,lastTime=0,spawnTimer=0,speed=245;
let bird={x:175,y:430,vy:0,r:25,rotation:0};
let pipes=[],particles=[],stars=[];
for(let i=0;i<70;i++)stars.push({x:Math.random()*W,y:Math.random()*(H-GROUND),r:Math.random()*2+.4,a:Math.random()*.7+.25});
function resetRound(){score=0;speed=245;bird={x:175,y:430,vy:0,r:25,rotation:0};pipes=[];particles=[];spawnTimer=0;updateUI()}
function start(){resetRound();state='playing';ui.start.classList.add('hidden');ui.round.classList.add('hidden');ui.victory.classList.add('hidden')}
function jump(user=''){if(state!=='playing')return;const now=performance.now(),cool=Math.max(0,Number(ui.cooldown.value)||0);if(now-lastJump<cool)return;lastJump=now;bird.vy=-510;for(let i=0;i<9;i++)particles.push({x:bird.x-14,y:bird.y,dx:-80-Math.random()*100,dy:(Math.random()-.5)*120,life:1});if(user)addFeed(user+' made you jump!','')}
function addWin(user=''){wins=Math.min(3,wins+1);saveWins();addFeed((user||'Streamer')+' added a win!','good');updateUI();if(wins>=3)victory()}
function subtractWin(user=''){wins=Math.max(0,wins-1);saveWins();addFeed((user||'Streamer')+' subtracted a win!','bad');updateUI()}
function saveWins(){localStorage.setItem('giftFlapWins',wins)}
function updateUI(){ui.score.textContent=score+' / 20';ui.wins.textContent=wins+' / 3'}
function victory(){state='victory';ui.round.classList.add('hidden');ui.victory.classList.remove('hidden')}
function finishRound(won=false){if(state!=='playing')return;state='over';if(won){wins=Math.min(3,wins+1);saveWins();updateUI();addFeed('20 points - WIN EARNED!','good');if(wins>=3){victory();return}ui.roundTitle.textContent='YOU WON THE ROUND!';ui.roundText.textContent='Win '+wins+' of 3 secured.'}else{ui.roundTitle.textContent='YOU CRASHED!';ui.roundText.textContent='Score: '+score+' / 20'}ui.round.classList.remove('hidden')}
function addFeed(text,kind){const el=document.createElement('div');el.className='event '+kind;el.textContent=text;ui.feed.prepend(el);setTimeout(()=>el.remove(),3500)}
function spawnPipe(){const gap=Math.max(205,270-score*2.5),margin=140,top=margin+Math.random()*(H-GROUND-gap-margin*2);pipes.push({x:W+70,w:105,top,bottom:top+gap,passed:false})}
function collide(p){const bx=bird.x,by=bird.y,r=bird.r-5;return bx+r>p.x&&bx-r<p.x+p.w&&(by-r<p.top||by+r>p.bottom)}
function update(dt){if(state!=='playing')return;bird.vy+=1450*dt;bird.y+=bird.vy*dt;bird.rotation=Math.max(-.45,Math.min(1.15,bird.vy/650));spawnTimer-=dt;if(spawnTimer<=0){spawnPipe();spawnTimer=1.68}speed=245+score*4;for(const p of pipes){p.x-=speed*dt;if(!p.passed&&p.x+p.w<bird.x){p.passed=true;score++;updateUI();addFeed('Point '+score+' / 20','good');if(score>=20){finishRound(true);return}}if(collide(p)){finishRound(false);return}}pipes=pipes.filter(p=>p.x>-150);if(bird.y+bird.r>H-GROUND||bird.y-bird.r<0)finishRound(false);for(const q of particles){q.x+=q.dx*dt;q.y+=q.dy*dt;q.life-=dt*1.8}particles=particles.filter(q=>q.life>0)}
function drawBackground(t){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#091b3c');g.addColorStop(.65,'#0b6c88');g.addColorStop(1,'#1ec0c4');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(const s of stars){ctx.globalAlpha=s.a*(.75+.25*Math.sin(t*.002+s.x));ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;ctx.fillStyle='#0a4968';for(let i=0;i<8;i++){const x=i*120-(t*.015%120);ctx.beginPath();ctx.moveTo(x,H-GROUND);ctx.lineTo(x+70,H-310);ctx.lineTo(x+145,H-GROUND);ctx.fill()}ctx.fillStyle='#06344f';ctx.fillRect(0,H-GROUND,W,GROUND);ctx.fillStyle='#20dca7';ctx.fillRect(0,H-GROUND,W,14);ctx.fillStyle='#119474';for(let x=-(t*.12%42);x<W;x+=42)ctx.fillRect(x,H-GROUND+25,25,8)}
function drawPipe(p){const drawPart=(y,h,capY)=>{const grad=ctx.createLinearGradient(p.x,0,p.x+p.w,0);grad.addColorStop(0,'#087f75');grad.addColorStop(.45,'#33f2bd');grad.addColorStop(1,'#075f66');ctx.fillStyle=grad;ctx.fillRect(p.x,y,p.w,h);ctx.fillStyle='#063c48';ctx.fillRect(p.x+p.w-12,y,12,h);ctx.fillStyle='#50ffd0';ctx.fillRect(p.x+10,y,10,h);ctx.fillStyle='#074f57';ctx.fillRect(p.x-12,capY,p.w+24,32);ctx.fillStyle='#3cf2ba';ctx.fillRect(p.x-5,capY+5,p.w+10,8)};drawPart(0,p.top-22,p.top-32);drawPart(p.bottom+22,H-GROUND-p.bottom-22,p.bottom)}
function drawBird(){ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(bird.rotation);ctx.fillStyle='#ffe35b';ctx.beginPath();ctx.arc(0,0,bird.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff9d2e';ctx.beginPath();ctx.moveTo(19,-5);ctx.lineTo(48,4);ctx.lineTo(19,13);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(9,-10,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#102131';ctx.beginPath();ctx.arc(12,-10,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffc02b';ctx.beginPath();ctx.ellipse(-15,5,18,10,-.4,0,Math.PI*2);ctx.fill();ctx.restore();for(const q of particles){ctx.globalAlpha=q.life;ctx.fillStyle='#ffe35b';ctx.fillRect(q.x,q.y,7,7)}ctx.globalAlpha=1}
function draw(t){drawBackground(t);for(const p of pipes)drawPipe(p);drawBird();if(state==='ready'){ctx.fillStyle='#ffffffaa';ctx.font='700 24px system-ui';ctx.textAlign='center';ctx.fillText('LIVE INTERACTIVE CHALLENGE',W/2,135)}}
function loop(t){const dt=Math.min(.034,(t-lastTime)/1000||0);lastTime=t;update(dt);draw(t);requestAnimationFrame(loop)}
function handleEvent(ev){if(!ev||!ev.type)return;const user=String(ev.user||ev.uniqueId||'viewer');if(ev.type==='jump')jump(user);else if(ev.type==='addWin')addWin(user);else if(ev.type==='subtractWin')subtractWin(user);else if(ev.type==='start')start();else if(ev.type==='resetRound')start()}
window.GiftFlap={event:handleEvent,jump,addWin,subtractWin};
$('startBtn').onclick=start;$('retryBtn').onclick=start;$('resetBtn').onclick=()=>{wins=0;saveWins();updateUI();ui.victory.classList.add('hidden');ui.start.classList.remove('hidden');state='ready';resetRound()};
$('setupToggle').onclick=()=>document.getElementById('setupBody').classList.toggle('hidden');
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='jump'){if(state!=='playing')start();jump('Test gift')}if(a==='add')addWin('Test gift');if(a==='subtract')subtractWin('Test gift');if(a==='restart')start()});
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(state==='ready'||state==='over')start();else jump()}});canvas.addEventListener('pointerdown',()=>{if(state==='ready'||state==='over')start();else jump()});
let es;function connect(){try{es=new EventSource('/api/events');es.onmessage=e=>{try{handleEvent(JSON.parse(e.data))}catch{}};es.onerror=()=>{es.close();setTimeout(connect,2500)}}catch{}}connect();
updateUI();resetRound();requestAnimationFrame(loop);
})();