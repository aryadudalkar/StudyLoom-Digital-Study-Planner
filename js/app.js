// app.js - initialize app and wire interactions
(function(){
  function by(id){return document.getElementById(id)}
  function qAll(sel){return document.querySelectorAll(sel)}

  function init(){
    const state = Storage.load();
    if(state.user){ showApp(); document.getElementById('userNameDisplay').textContent = state.user }
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString();
    // wire landing
    document.getElementById('startBtn').addEventListener('click',()=>{
      const name = document.getElementById('nameInput').value.trim() || 'Friend';
      withState(s=>s.user=name);
      document.getElementById('userNameDisplay').textContent = name;
      // smooth scroll to main dashboard area
      const main = document.querySelector('.main'); if(main) main.scrollIntoView({behavior:'smooth'});
    });

    // nav
    qAll('.nav-btn').forEach(b=>b.addEventListener('click',e=>{ qAll('.nav-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); }))

    // add actions
    document.getElementById('addTaskBtn').addEventListener('click',()=>{
      const name = prompt('Task name'); if(!name) return; const subject = prompt('Subject (optional)')||''; const priority = prompt('Priority (High,Medium,Low)','Medium')||'Medium'; TaskManager.add({name,subject,priority}); updateAnalytics();
    });
    document.getElementById('addSubjectBtn').addEventListener('click',()=>{
      const name = prompt('Subject name'); if(!name) return; const cover = prompt('Cover image URL (optional)')||''; SubjectManager.add({name,cover});
    });
    document.getElementById('addNoteBtn').addEventListener('click',()=>{ const text = prompt('Note text'); if(!text) return; NotesManager.add({text}); });

    // initial renders
    TaskManager.renderTasks(); SubjectManager.renderSubjects(); NotesManager.renderNotes(); CalendarManager.renderCalendar(); updateAnalytics();
    drawProgressSVG();
  }

  function animateLandingAway(){
    // legacy — not used in single-page layout
  }

  function showApp(){ const state=Storage.load(); document.getElementById('userNameDisplay').textContent = state.user || 'Friend'; }

  // analytics and progress
  function updateAnalytics(){
    const state=Storage.load();
    const completed = state.tasks.filter(t=>t.done).length;
    const total = state.tasks.length || 0;
    const taskPct = total>0? Math.round((completed/total)*100) : 0;

    // compute subjects average progress
    let subjectsAvg = 0;
    if(state.subjects && state.subjects.length>0){
      const sums = state.subjects.map(s=>{
        if(!s.topics || s.topics.length===0) return 0;
        const sum = s.topics.reduce((a,b)=>a+(b.progress||0),0);
        return Math.round(sum/s.topics.length);
      });
      subjectsAvg = Math.round(sums.reduce((a,b)=>a+b,0)/sums.length);
    }

    // overall is average of taskPct and subjectsAvg when both exist
    let overallPct = taskPct;
    if(state.subjects && state.subjects.length>0) overallPct = Math.round((taskPct + subjectsAvg)/2);

    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('overallPct').textContent = overallPct + '%';
    animateProgress(overallPct);
    document.getElementById('subjectCount').textContent = state.subjects.length;
  }

  function drawProgressSVG(){ const svg = document.getElementById('progressSvg'); if(!svg) return; svg.innerHTML=''; const circleBg=document.createElementNS('http://www.w3.org/2000/svg','circle'); circleBg.setAttribute('cx',60); circleBg.setAttribute('cy',60); circleBg.setAttribute('r',48); circleBg.setAttribute('fill','none'); circleBg.setAttribute('stroke','#f3e8df'); circleBg.setAttribute('stroke-width','12'); svg.appendChild(circleBg);
    const fg=document.createElementNS('http://www.w3.org/2000/svg','circle'); fg.setAttribute('cx',60); fg.setAttribute('cy',60); fg.setAttribute('r',48); fg.setAttribute('fill','none'); fg.setAttribute('stroke','url(#g)'); fg.setAttribute('stroke-width','12'); fg.setAttribute('stroke-linecap','round'); fg.setAttribute('transform','rotate(-90 60 60)'); fg.setAttribute('stroke-dasharray','302'); fg.setAttribute('stroke-dashoffset','302');
    const defs=document.createElementNS('http://www.w3.org/2000/svg','defs'); const grad=document.createElementNS('http://www.w3.org/2000/svg','linearGradient'); grad.setAttribute('id','g'); grad.setAttribute('x1','0%'); grad.setAttribute('y1','0%'); grad.setAttribute('x2','100%'); grad.setAttribute('y2','0%'); const stop1=document.createElementNS('http://www.w3.org/2000/svg','stop'); stop1.setAttribute('offset','0%'); stop1.setAttribute('stop-color','#A47864'); const stop2=document.createElementNS('http://www.w3.org/2000/svg','stop'); stop2.setAttribute('offset','100%'); stop2.setAttribute('stop-color','#A07761'); grad.appendChild(stop1); grad.appendChild(stop2); defs.appendChild(grad); svg.appendChild(defs); svg.appendChild(fg); svg._fg=fg;
  }
  function animateProgress(pct){ const svg=document.getElementById('progressSvg'); if(!svg || !svg._fg) { drawProgressSVG(); }
    const fg = svg._fg || svg.querySelector('circle[stroke-dasharray]'); const total=302; const to = Math.max(0, total - (total*(pct/100))); fg.style.transition='stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)'; fg.style.strokeDashoffset = to;
  }

  // expose global update fn
  window.updateAnalytics = updateAnalytics;

  document.addEventListener('DOMContentLoaded',init);
})();
