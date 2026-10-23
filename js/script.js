(function(){
  var root=document.documentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hoverFine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  function $(id){return document.getElementById(id)}
  function lsGet(k,d){try{var v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}}
  function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}

  // theme + copy + year
  var tbtn=$('theme');
  var st=lsGet('theme','');root.setAttribute('data-theme',(st==='dark'||st==='light')?st:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));
  tbtn.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
    var next=cur==='dark'?'light':'dark';root.setAttribute('data-theme',next);lsSet('theme',next);
  });
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var el=$(b.getAttribute('data-copy')),t=el.textContent;
      function sel(){var r=document.createRange();r.selectNodeContents(el);var g=getSelection();g.removeAllRanges();g.addRange(r)}
      try{navigator.clipboard.writeText(t).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1400)},sel)}catch(e){sel()}
    });
  });
  $('yr').textContent=new Date().getFullYear();

  // reveal + progress + nav spy + timeline fill
  root.classList.add('js');
  var rvs=[].slice.call(document.querySelectorAll('.rv'));
  rvs.forEach(function(el){
    var sibs=[].slice.call(el.parentElement.children).filter(function(c){return c.classList.contains('rv')});
    el.style.setProperty('--rd',(Math.max(0,sibs.indexOf(el))*0.12)+'s');
  });
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rvs.forEach(function(e){io.observe(e)});
    setTimeout(function(){rvs.forEach(function(e){if(e.getBoundingClientRect().top<innerHeight)e.classList.add('in')})},60);
  }else rvs.forEach(function(e){e.classList.add('in')});
  var bar=$('progress'),links=[].slice.call(document.querySelectorAll('nav a.l')),tl=document.querySelector('.tl');
  var secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
  function onScroll(){
    var h=document.documentElement.scrollHeight-innerHeight;
    bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';
    var cur=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<innerHeight*.4)cur=i});
    links.forEach(function(a,i){a.classList.toggle('on',i===cur)});
    if(tl){var r=tl.getBoundingClientRect(),p=(innerHeight*.62-r.top)/r.height;tl.style.setProperty('--p',Math.max(0,Math.min(1,p)).toFixed(3))}
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // spotlight on cards
  document.querySelectorAll('.sp').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
  });

  // typing line
  var tp=$('type');
  if(tp&&!reduce){
    var words=['Java apps','Python projects','graphics','reliable work','and more'],wi=0,ci=words[0].length,del=true;
    (function tick(){
      var w=words[wi];
      if(del){ci--;tp.textContent=w.slice(0,ci);if(ci<=0){del=false;wi=(wi+1)%words.length;return setTimeout(tick,260)}return setTimeout(tick,45)}
      w=words[wi];ci++;tp.textContent=w.slice(0,ci);
      if(ci>=w.length){del=true;return setTimeout(tick,1700)}
      setTimeout(tick,95);
    })();
  }

  // name scramble
  (function(){
    var nm=$('name');if(!nm)return;
    var glyphs='01{}<>/;#$%&*+=?';
    [].slice.call(nm.querySelectorAll('.ln1,.ln2')).forEach(function(w){
      var txt=w.textContent;w.textContent='';
      for(var i=0;i<txt.length;i++){var sp=document.createElement('span');sp.className='ch';var ch=txt[i]===' '?' ':txt[i];sp.textContent=ch;sp.setAttribute('data-c',ch);sp.setAttribute('aria-hidden','true');w.appendChild(sp)}
    });
    var chs=[].slice.call(nm.querySelectorAll('.ch')),run=0;
    function scramble(){
      if(reduce)return;var id=++run,start=performance.now();
      chs.forEach(function(c,i){c.dataset.t=String(450+i*80)});
      (function step(now){
        if(id!==run)return;var el=now-start,done=true;
        chs.forEach(function(c){var t=+c.dataset.t;
          if(el>=t){c.textContent=c.getAttribute('data-c');c.classList.remove('sc')}
          else{done=false;c.classList.add('sc');if(c.getAttribute('data-c')!==' '&&Math.random()<.6)c.textContent=glyphs[Math.floor(Math.random()*glyphs.length)]}});
        if(!done)requestAnimationFrame(step);
      })(start);
    }
    scramble();nm.addEventListener('pointerenter',scramble);
  })();

  // hero: bio words, network, magnet, parallax, tilt
  (function(){
    var bio=document.querySelector('.hero p.bio');
    if(bio&&!reduce){
      var ws=bio.textContent.trim().split(/\s+/);bio.setAttribute('aria-label',bio.textContent.trim());bio.textContent='';
      ws.forEach(function(w,i){var sp=document.createElement('span');sp.className='w';sp.style.setProperty('--k',i);sp.textContent=w;sp.setAttribute('aria-hidden','true');bio.appendChild(sp);bio.appendChild(document.createTextNode(' '))});
    }
    var cv=$('net');
    if(cv&&!reduce){
      var c=cv.getContext('2d'),W=0,H=0,pts=[],mx=-999,my=-999,vis=true,col='#8b7cff',col2='#22d3ee';
      function size(){var r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;c.setTransform(d,0,0,d,0,0);
        var n=Math.round(Math.min(70,Math.max(24,W*H/14000)));pts=[];for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35})}
      size();addEventListener('resize',size);
      var hero=cv.parentElement;
      hero.addEventListener('pointermove',function(e){var r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});
      hero.addEventListener('pointerleave',function(){mx=my=-999});
      if('IntersectionObserver' in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(cv);
      (function loop(){
        requestAnimationFrame(loop);if(!vis)return;
        var cs=getComputedStyle(root);col=cs.getPropertyValue('--accent').trim()||col;col2=cs.getPropertyValue('--accent2').trim()||col2;
        c.clearRect(0,0,W,H);
        for(var i=0;i<pts.length;i++){var p=pts[i];
          p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
          var dx=mx-p.x,dy=my-p.y,dd=Math.hypot(dx,dy);if(dd<150){p.x+=dx*.012;p.y+=dy*.012}
          c.globalAlpha=.8;c.fillStyle=i%3?col:col2;c.beginPath();c.arc(p.x,p.y,1.8,0,6.283);c.fill();
          for(var j=i+1;j<pts.length;j++){var q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);
            if(d<120){c.globalAlpha=(1-d/120)*.45;c.strokeStyle=col;c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.stroke()}}
          if(dd<170){c.globalAlpha=(1-dd/170)*.8;c.strokeStyle=col2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(mx,my);c.stroke()}
        }
        c.globalAlpha=1;
      })();
    }
    if(!hoverFine||reduce)return;
    document.querySelectorAll('.cta .btn').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.25)+'px,'+((e.clientY-r.top-r.height/2)*.35)+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform=''});
    });
    var hr=document.querySelector('.hero'),sn=[].slice.call(document.querySelectorAll('.snips span'));
    hr.addEventListener('pointermove',function(e){
      var r=hr.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      sn.forEach(function(el){var d=+el.getAttribute('data-d');el.style.transform='translate('+(x*d)+'px,'+(y*d)+'px)'});
    });
    var sch=document.querySelector('.schema');
    sch.addEventListener('pointermove',function(e){var r=sch.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      sch.style.transform='perspective(900px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg)'});
    sch.addEventListener('pointerleave',function(){sch.style.transform=''});
  })();

  // cursor
  if(hoverFine){
    root.classList.add('cur');
    var dot=$('cdot'),ring=$('cring'),mx2=-100,my2=-100,rx=-100,ry=-100;
    addEventListener('pointermove',function(e){mx2=e.clientX;my2=e.clientY;dot.classList.add('c-on');ring.classList.add('c-on');dot.style.transform='translate('+mx2+'px,'+my2+'px)'},{passive:true});
    document.addEventListener('pointerleave',function(){dot.classList.remove('c-on');ring.classList.remove('c-on')});
    addEventListener('pointerdown',function(){ring.classList.add('down')});addEventListener('pointerup',function(){ring.classList.remove('down')});
    document.addEventListener('pointerover',function(e){ring.classList.toggle('hot',!!e.target.closest('a,button,.sp,#catsvg,.theme'))});
    (function loop(){rx+=(mx2-rx)*.18;ry+=(my2-ry)*.18;ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop)})();
  }


  // contact form (opens the visitor's mail app)
  var CONTACT_EMAIL='mr444110911@gmail.com';
  var cform=$('cform');
  if(cform)cform.addEventListener('submit',function(e){
    e.preventDefault();
    var n=$('f-name').value.trim(),m=$('f-msg').value.trim(),note=$('f-note');
    if(!n||!m)return;
    var body='Hi Faizan,\n\n'+m+'\n\nFrom: '+n;
    var url='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent('Freelance enquiry from '+n)+'&body='+encodeURIComponent(body);
    try{navigator.clipboard.writeText(body).catch(function(){})}catch(x){}
    try{window.open(url,'_blank')||(location.href=url)}catch(x){}
    note.textContent='Your mail app should open now. If it does not, your message is copied, so paste it into an email to '+CONTACT_EMAIL+'.';
  });

  // floating nav pill on scroll
  var navEl=document.querySelector('nav');
  function navState(){navEl.classList.toggle('scrolled',(window.scrollY||document.documentElement.scrollTop)>90)}
  addEventListener('scroll',navState,{passive:true});navState();

  // timeline card tilt
  if(hoverFine&&!reduce)document.querySelectorAll('.ti .card').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(800px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg)'});
    c.addEventListener('pointerleave',function(){c.style.transform=''});
  });

  // ---------- Byte Runner (inline console) ----------
  var cv=$('gc'),cx2=cv.getContext('2d'),gsEl=$('gs'),gbEl=$('gb'),consoleEl=$('console');
  var CW=480,CH=180,GROUND=142;
  var G={mode:'demo',dead:false,paused:false,vis:false,hot:false,raf:0,t:0,y:0,vy:0,obs:[],speed:4.6,score:0,next:200,best:+lsGet('byteBest',0)||0,col:{}};
  gbEl.textContent=G.best;
  function colors(){var cs=getComputedStyle(root);G.col={bg:cs.getPropertyValue('--bg').trim()||'#0b0b10',fg:cs.getPropertyValue('--fg').trim()||'#fff',acc:cs.getPropertyValue('--accent2').trim()||'#f5a',mut:cs.getPropertyValue('--muted').trim()||'#888',line:cs.getPropertyValue('--line').trim()||'#333',acc1:cs.getPropertyValue('--accent').trim()||'#0ff'}}
  function reset(){G.y=0;G.vy=0;G.obs=[];G.speed=4.6;G.score=0;G.next=200;G.t=0;G.dead=false;G.paused=false;gsEl.textContent=0;$('c-pause').textContent='Pause'}
  function startPlay(){reset();G.mode='play'}
  function jump(){
    if(G.mode==='demo'||G.dead){startPlay();G.vy=-11.4;return}
    if(G.paused)return;
    if(G.y===0)G.vy=-11.4;
  }
  function togglePause(){if(G.mode!=='play'||G.dead)return;G.paused=!G.paused;$('c-pause').textContent=G.paused?'Resume':'Pause'}
  $('c-jump').addEventListener('click',jump);
  $('c-reset').addEventListener('click',startPlay);
  $('c-pause').addEventListener('click',togglePause);
  cv.addEventListener('pointerdown',function(e){e.preventDefault();jump()});
  consoleEl.addEventListener('pointerenter',function(){G.hot=true});consoleEl.addEventListener('pointerleave',function(){G.hot=false});
  consoleEl.addEventListener('focusin',function(){G.hot=true});consoleEl.addEventListener('focusout',function(){G.hot=false});
  addEventListener('keydown',function(e){
    if(e.key!==' '&&e.key!=='ArrowUp')return;
    var t=e.target&&e.target.tagName;if(t==='BUTTON'||t==='INPUT'||t==='TEXTAREA')return;
    if(G.hot||(G.mode==='play'&&!G.dead&&G.vis)){e.preventDefault();jump()}
  });
  function bug(o){var c=cx2;c.fillStyle=G.col.acc;c.strokeStyle=G.col.acc;c.lineWidth=2;
    c.beginPath();c.ellipse(o.x+o.w/2,o.y+o.h*.62,o.w/2,o.h*.38,0,0,6.283);c.fill();
    c.beginPath();c.arc(o.x+o.w/2,o.y+o.h*.3,o.w*.3,0,6.283);c.fill();
    c.beginPath();for(var i=0;i<3;i++){var yy=o.y+o.h*(.5+i*.16);c.moveTo(o.x,yy);c.lineTo(o.x-5,yy+4);c.moveTo(o.x+o.w,yy);c.lineTo(o.x+o.w+5,yy+4)}c.stroke();
    c.fillStyle=G.col.bg;c.fillRect(o.x+o.w/2-4,o.y+o.h*.26,3,3);c.fillRect(o.x+o.w/2+1,o.y+o.h*.26,3,3)}
  function drawCat(x,y,run){var c=cx2,f=G.col.fg;
    c.fillStyle=f;c.strokeStyle=f;c.lineWidth=3;c.lineCap='round';
    c.beginPath();c.moveTo(x-2,y-14);c.quadraticCurveTo(x-16,y-18,x-14,y-30);c.stroke();
    c.fillRect(x,y-26,34,20);
    var ph=run?Math.floor(G.t/6)%2:0;
    c.fillRect(x+4,y-6,8,6+(ph?0:-3));c.fillRect(x+22,y-6,8,6+(ph?-3:0));
    c.fillRect(x+16,y-44,26,20);
    c.beginPath();c.moveTo(x+17,y-44);c.lineTo(x+20,y-54);c.lineTo(x+26,y-44);c.moveTo(x+32,y-44);c.lineTo(x+38,y-54);c.lineTo(x+41,y-44);c.fill();
    c.fillStyle=G.col.acc1;c.fillRect(x+30,y-38,6,6);
    c.fillRect(x+20,y-58,2,5);c.beginPath();c.arc(x+21,y-60,2.5,0,6.283);c.fill()}
  function frame(){
    G.raf=requestAnimationFrame(frame);
    if(!G.vis)return;
    var c=cx2;colors();
    c.clearRect(0,0,CW,CH);c.fillStyle=G.col.bg;c.fillRect(0,0,CW,CH);
    c.strokeStyle=G.col.line;c.lineWidth=2;c.beginPath();c.moveTo(0,GROUND+1);c.lineTo(CW,GROUND+1);c.stroke();
    c.fillStyle=G.col.mut;for(var i=0;i<12;i++){var gx=((i*83-G.t*G.speed*.6)%(CW+40)+CW+40)%(CW+40)-20;c.fillRect(gx,GROUND+10+(i%3)*8,10+(i%2)*8,2)}
    var live=!G.dead&&!G.paused;
    if(live){
      G.t++;
      if(G.mode==='play'){G.score+=G.speed*.06;G.speed=Math.min(10,4.6+G.score/90)}
      G.vy+=.7;G.y+=G.vy;if(G.y>0){G.y=0;G.vy=0}
      G.next-=G.speed;
      if(G.next<=0){var tall=Math.random()<.35;G.obs.push({x:CW+10,w:tall?22:16,h:tall?38:26});G.next=250+Math.random()*220+G.speed*16}
      G.obs.forEach(function(o){o.x-=G.speed});G.obs=G.obs.filter(function(o){return o.x>-40});
      var cxp=50,cw=30,ch=44,cyb=GROUND+G.y;
      if(G.mode==='demo'){
        if(G.y===0)G.obs.forEach(function(o){var d=o.x-(cxp+cw);if(d>0&&d<G.speed*17)G.vy=-11.4});
      }else{
        gsEl.textContent=Math.floor(G.score);
        G.obs.forEach(function(o){var oy=GROUND-o.h;if(cxp+cw-4>o.x+3&&cxp+4<o.x+o.w-3&&cyb-4>oy+3&&cyb-ch<GROUND)G.dead=true});
        if(G.dead){var sc=Math.floor(G.score);if(sc>G.best){G.best=sc;gbEl.textContent=sc;lsSet('byteBest',sc)}}
      }
    }
    G.obs.forEach(function(o){bug({x:o.x,y:GROUND-o.h,w:o.w,h:o.h})});
    drawCat(50,GROUND+G.y,live&&G.y===0);
    c.font='600 14px "IBM Plex Mono",monospace';c.textAlign='center';c.fillStyle=G.col.fg;
    if(G.mode==='demo'&&Math.floor(G.t/30)%2===0)c.fillText('Press Jump or tap to play',CW/2,52);
    if(G.paused)c.fillText('Paused',CW/2,52);
    if(G.dead){c.fillStyle=G.col.acc;c.fillText('Game over  ·  press Jump to retry',CW/2,52)}
    c.textAlign='left';
  }
  colors();
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){G.vis=es[0].isIntersecting}).observe(cv);else G.vis=true;
  if(reduce){G.vis=true;frame();cancelAnimationFrame(G.raf)}else frame();

  // ---------- Python quiz (inline) ----------
  var QS=[
    {q:'What does <code>print(type(3.0))</code> show?',o:["<code>&lt;class 'int'&gt;</code>","<code>&lt;class 'float'&gt;</code>","<code>&lt;class 'str'&gt;</code>","<code>&lt;class 'double'&gt;</code>"],a:1,e:'<code>3.0</code> has a decimal point, so Python treats it as a <code>float</code>.'},
    {q:'Which of these creates a list?',o:['<code>(1, 2, 3)</code>','<code>{1, 2, 3}</code>','<code>[1, 2, 3]</code>','<code>&lt;1, 2, 3&gt;</code>'],a:2,e:'Square brackets make a list. Round brackets make a tuple, curly brackets a set.'},
    {q:'What is the result of <code>len("Faizan")</code>?',o:['5','6','7','Error'],a:1,e:'The string has six characters: F, a, i, z, a, n.'},
    {q:'What does <code>7 // 2</code> give?',o:['3.5','4','3','2'],a:2,e:'<code>//</code> is floor division, so 7 divided by 2 is rounded down to 3.'},
    {q:'Which keyword defines a function?',o:['<code>func</code>','<code>def</code>','<code>function</code>','<code>fun</code>'],a:1,e:'Python functions start with <code>def</code>.'},
    {q:'What does <code>"ab" * 3</code> produce?',o:['<code>"ababab"</code>','<code>"ab3"</code>','<code>"aaabbb"</code>','Error'],a:0,e:'Multiplying a string repeats it, so you get <code>"ababab"</code>.'},
    {q:'Which method runs when a new object of a class is created?',o:['<code>__start__</code>','<code>__new_object__</code>','<code>__init__</code>','<code>__main__</code>'],a:2,e:'<code>__init__</code> is the initializer, called when an object is created.'},
    {q:'What does <code>list(range(3))</code> return?',o:['<code>[1, 2, 3]</code>','<code>[0, 1, 2, 3]</code>','<code>[0, 1, 2]</code>','<code>[3]</code>'],a:2,e:'<code>range(3)</code> counts from 0 up to, but not including, 3.'}
  ];
  var qi=0,qs=0,qorder=[],qbody=$('qbody'),qfill=$('qfill'),qn=$('qn'),qbest=+lsGet('pyBest',-1);
  if(qbest>=0)$('pb-quiz').textContent=qbest+'/'+QS.length;
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  function startQuiz(){qi=0;qs=0;qorder=shuffle(QS.map(function(_,i){return i}));renderQ()}
  function renderQ(){
    qn.textContent=Math.min(qi+1,QS.length);qfill.style.width=(qi/QS.length*100)+'%';
    if(qi>=QS.length){
      qfill.style.width='100%';
      if(qs>qbest){qbest=qs;lsSet('pyBest',qs)}$('pb-quiz').textContent=qbest+'/'+QS.length;
      var msg=qs===QS.length?'Perfect score. Python is clearly your language.':qs>=6?'Strong result. A little more practice and you will ace it.':qs>=4?'Good start. Try again to climb higher.':'Keep going. Every run teaches something new.';
      qbody.innerHTML='<div class="qend"><div class="big">'+qs+'/'+QS.length+'</div><p>'+msg+'</p><button type="button" class="btn p" id="qretry">Play again</button></div>';
      $('qretry').addEventListener('click',startQuiz);return;
    }
    var item=QS[qorder[qi]],idx=shuffle(item.o.map(function(_,i){return i}));
    var html='<p class="qtext">'+item.q+'</p><div class="qopts">';
    idx.forEach(function(k){html+='<button type="button" class="qopt" data-k="'+k+'">'+item.o[k]+'</button>'});
    html+='</div><p class="qexp" id="qexp" aria-live="polite"></p><div class="qfoot"><button type="button" class="btn p" id="qnext" hidden>'+(qi===QS.length-1?'See result':'Next question')+'</button></div>';
    qbody.innerHTML=html;
    [].slice.call(qbody.querySelectorAll('.qopt')).forEach(function(b){
      b.addEventListener('click',function(){
        var k=+b.getAttribute('data-k'),ok=k===item.a;if(ok)qs++;
        [].slice.call(qbody.querySelectorAll('.qopt')).forEach(function(x){x.disabled=true;if(+x.getAttribute('data-k')===item.a)x.classList.add('ok')});
        if(!ok)b.classList.add('no');
        $('qexp').innerHTML=(ok?'Correct. ':'Not quite. ')+item.e;
        var nx=$('qnext');nx.hidden=false;
        nx.addEventListener('click',function(){qi++;renderQ()});
      });
    });
  }
  startQuiz();


})();
