/* ================= AUDIO =================
   Every sound is synthesised. A.s(name) plays an effect; sched() is the generative music. */
import {G} from '../core/state.js';
import {pick,prefs,rand} from '../core/util.js';
import {THEME} from '../table/content.js';

/* ================= AUDIO (all synthesized) ================= */
export const A={ctx:null,sfx:null,mus:null,last:{},vol:prefs.get('vol',{m:.55,s:.8}),step:0,next:0,timer:null,
  init(){if(A.ctx){if(A.ctx.state==='suspended')A.ctx.resume();return;}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    try{const x=A.ctx=new AC();const comp=x.createDynamicsCompressor();comp.connect(x.destination);
      A.sfx=x.createGain();A.sfx.gain.value=A.vol.s;A.sfx.connect(comp);
      A.mus=x.createGain();A.mus.gain.value=A.vol.m*.7;A.mus.connect(comp);
      const d=x.createDelay(1);d.delayTime.value=.34;const fb=x.createGain();fb.gain.value=.38;const lp=x.createBiquadFilter();lp.frequency.value=1800;
      A.wet=x.createGain();A.wet.gain.value=.6;A.wet.connect(d);A.wet.connect(A.mus);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(A.mus);
      const nb=x.createBuffer(1,x.sampleRate,x.sampleRate),ch=nb.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;A.nb=nb;
      // drone
      const dg=x.createGain();dg.gain.value=.05;const dl=x.createBiquadFilter();dl.frequency.value=240;dl.connect(dg);dg.connect(A.mus);
      for(const f of [73.42,73.9,36.71]){const o=x.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(dl);o.start();}
      A.next=x.currentTime+.2;A.timer=setInterval(A.sched,120);}catch(e){A.ctx=null;}},
  setVol(){prefs.set('vol',A.vol);if(A.ctx){A.sfx.gain.value=A.vol.s;A.mus.gain.value=A.vol.m*.7;}},
  tone(f,dur,type,vol,to,delay,bus){const x=A.ctx,t=x.currentTime+(delay||0),o=x.createOscillator(),g=x.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
    if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.0005,t+dur);
    o.connect(g);g.connect(bus||A.sfx);o.start(t);o.stop(t+dur+.02);return g;},
  noise(dur,vol,freq,to,type,delay,q){const x=A.ctx,t=x.currentTime+(delay||0),s=x.createBufferSource(),f=x.createBiquadFilter(),g=x.createGain();s.buffer=A.nb;s.loop=true;
    f.type=type||'lowpass';f.frequency.setValueAtTime(freq,t);if(to)f.frequency.exponentialRampToValueAtTime(to,t+dur);f.Q.value=q||.8;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(f);f.connect(g);g.connect(A.sfx);s.start(t,Math.random()*.5);s.stop(t+dur+.02);},
  arp(notes,step,type,vol,dur){notes.forEach((n,i)=>A.tone(n,dur||.22,type||'triangle',vol||.12,0,i*step));},
  s(name,arg){if(!A.ctx||G.demo||A.ctx.state!=='running')return;const now=A.ctx.currentTime;if(now-(A.last[name]||0)<.035)return;A.last[name]=now;const T_=A.tone,N=A.noise;
    switch(name){
    case 'flip':N(.05,.35,1400,300);T_(120,.06,'square',.12,60);break;
    case 'flipDown':N(.03,.1,700,300);break;
    case 'knock':N(.04,Math.min(.22,(arg||200)/2600),1800,500);break;
    case 'sling':T_(340,.09,'square',.12,110);N(.06,.25,2400,800);break;
    case 'bump':{const f=[196,262,330,147,220,165,247][arg||0]*pick([1,1.19,1.5]);T_(f,.2,'triangle',.22,f*.7);T_(f*2,.08,'square',.05);N(.04,.25,3000,900);break;}
    case 'bell':T_(392,1.4,'sine',.2);T_(392*2.76,1,'sine',.08);T_(392*5.4,.6,'sine',.04);T_(196,1.6,'sine',.1);N(.03,.2,4000,2000);break;
    case 'target':T_(880,.1,'square',.08);T_(1320,.14,'triangle',.1,0,.03);break;
    case 'drop':T_(240,.12,'sawtooth',.12,90);N(.08,.3,900,200);break;
    case 'lane':T_(660,.09,'sine',.12);T_(990,.14,'sine',.1,0,.06);break;
    case 'spin':T_(1100+rand(200),.03,'square',.04);break;
    case 'orbit':N(.35,.2,500,4000,'bandpass',0,3);break;
    case 'rampIn':N(.5,.22,400,3200,'bandpass',0,4);break;
    case 'ramp':A.arp([523,659,784],.06,'triangle',.11);break;
    case 'hole':T_(220,.35,'sine',.2,70);N(.2,.15,500,120);break;
    case 'eject':N(.1,.3,700,2500);T_(110,.14,'square',.1,330);break;
    case 'chute':N(.9,.25,220,90);T_(90,.9,'sine',.12,50);break;
    case 'launch':N(.28,.3,600,3500,'bandpass',0,2);T_(80,.25,'sawtooth',.12,420);break;
    case 'hit':N(.06,.3,1800,400);T_(170,.07,'square',.1,90);break;
    case 'kill':T_(320,.28,'sawtooth',.12,50);N(.22,.25,2600,300);break;
    case 'clank':T_(1450,.07,'square',.07);T_(2130,.1,'square',.05);break;
    case 'hurt':T_(150,.32,'sawtooth',.2,60);N(.15,.2,500,150);break;
    case 'curse':T_(520,.5,'sine',.12,180);T_(533,.5,'sine',.1,190);break;
    case 'interrupt':A.arp([1568,2093,2637],.04,'sine',.1,.25);N(.15,.15,5000,2000,'highpass');break;
    case 'quest':A.arp([587,880],.12,'sine',.14,.5);break;
    case 'questDone':A.arp([587,740,880,1175],.09,'triangle',.13,.45);break;
    case 'level':A.arp([392,494,587,784,988],.08,'triangle',.14,.5);break;
    case 'bank':A.arp([659,784,988],.05,'square',.07,.2);break;
    case 'jackpot':A.arp([784,988,1175,1568,1175,1568],.055,'square',.08,.22);break;
    case 'multiball':A.arp([294,370,440,587,740,880,1175],.07,'sawtooth',.08,.4);N(.9,.2,300,5000,'bandpass',0,2);break;
    case 'boss':T_(55,1.6,'sawtooth',.25,41);T_(58,1.6,'sawtooth',.2,43);N(1.2,.25,300,80);break;
    case 'bossHit':T_(95,.16,'square',.16,55);N(.1,.3,1200,300);break;
    case 'bossDie':T_(220,2,'sawtooth',.22,30);N(1.8,.4,3000,80);A.arp([587,740,880,1175,1480],.12,'triangle',.12,.8);break;
    case 'slam':T_(70,.6,'sawtooth',.28,30);N(.5,.4,900,80);break;
    case 'cast':T_(196,1,'sawtooth',.1,392);T_(199,1,'sawtooth',.08,398);break;
    case 'ward':T_(1175,.3,'sine',.12);T_(1760,.4,'sine',.08,0,.05);break;
    case 'summon':T_(98,.8,'triangle',.18,147);N(.6,.15,400,1500,'bandpass');break;
    case 'drain':T_(330,.8,'triangle',.18,45);N(.5,.15,800,100);break;
    case 'save':A.arp([440,660,880],.07,'sine',.13);break;
    case 'kick':T_(180,.2,'sawtooth',.15,1400);N(.12,.3,3000,800);break;
    case 'tilt':T_(62,1.1,'sawtooth',.25);T_(65,1.1,'square',.1);break;
    case 'nudge':T_(70,.14,'sine',.3,40);N(.07,.2,400,120);break;
    case 'ability':A.arp([440,554,659,880,1109],.045,'sine',.12,.6);N(.5,.12,6000,1500,'highpass');break;
    case 'pickup':T_(1245,.07,'sine',.12);T_(1865,.16,'sine',.1,0,.06);break;
    case 'lock':T_(196,.3,'square',.12);T_(147,.4,'square',.12,0,.15);break;
    case 'choice':A.arp([392,587],.1,'triangle',.1,.3);break;
    case 'pick':A.arp([587,880,1175],.06,'triangle',.12,.25);break;
    case 'deny':T_(140,.15,'square',.1);break;
    case 'ui':T_(700,.04,'triangle',.06);break;
    case 'ballEnd':A.arp([440,415,370,294],.16,'triangle',.13,.5);break;
    case 'over':A.arp([294,277,233,220,147],.3,'triangle',.15,1.2);break;
    case 'victory':A.arp([294,370,440,587,740,880,1175,1480],.11,'triangle',.14,.7);break;}},
  // generative music: D minor, slow harp over pads, a low bell every fourth bar; bosses add a pulse
  sched(){const x=A.ctx;if(!x||x.state!=='running')return;const boss=(!!(G.boss&&G.boss.alive)||G.inGrave)&&!G.demo,quiet=G.mode==='title';
    const rly=G.rallyT>0&&!G.demo,beat=rly?.2:boss?.3:.4;while(A.next<x.currentTime+.3){const st=A.step++,bar=(st/8|0)%4,k=st%8,t=A.next-x.currentTime;
      const ch=[[146.8,174.6,220],[116.5,146.8,174.6],[98,116.5,146.8],[110,138.6,164.8]][bar];
      if(k===0){for(const f of ch)A.tone(f,beat*8.5,'triangle',.035,0,t,A.mus);A.tone(ch[0]/2,beat*8,'sine',.07,0,t,A.mus);
        if(bar===0&&((st/32|0)%2===0)){A.tone(146.8,3,'sine',.07,0,t,A.wet);A.tone(146.8*2.76,2,'sine',.02,0,t,A.wet);}}
      const pat=[0,1,2,1,0,2,1,2][k],oct=[2,2,2,4,2,2,4,2][(k+bar)%8],tier=G.focusTier,mu=(THEME.music||[])[tier]||{};
      if(!quiet||k%2===0){if(Math.random()>.18)A.tone(ch[pat]*oct*(mu.low&&k===3?.5:1),beat*2.2,mu.wave||'triangle',.045,0,t,A.wet);}
      if(boss&&!rly){A.tone(ch[0]/2,beat*.8,'sawtooth',.05,0,t,A.mus);if(k%2===0)A.tone(70,.12,'sine',.16,35,t,A.mus);}
      if(rly){A.tone(k%2?62:52,.16,'sine',.22,30,t,A.mus);if(k%2)A.tone(ch[0]/2,beat*.9,'sawtooth',.06,0,t,A.mus);A.tone(ch[(k+bar)%3]*4,beat*.7,'square',.022,0,t,A.wet);if(k===4)A.tone(196,.08,'triangle',.08,0,t,A.mus);}
      A.next+=beat;}}
};
