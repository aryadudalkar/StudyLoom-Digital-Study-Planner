const CalendarManager = (function(){
  function id(){return 'e_'+Date.now()+Math.random().toString(36).slice(2,8)}
  function list(){return Storage.load().events}
  function add(ev){withState(s=>s.events.push({id:id(),title:ev.title||'Event',date:ev.date,kind:ev.kind||'Study',notes:ev.notes||''}));renderMonth(currentYear,currentMonth);renderCalendar();updateAnalytics();}
  function update(id,patch){withState(s=>{const e=s.events.find(x=>x.id===id); if(e) Object.assign(e,patch)});renderMonth(currentYear,currentMonth);renderCalendar();updateAnalytics();}
  function remove(id){withState(s=>{s.events=s.events.filter(x=>x.id!==id)});renderMonth(currentYear,currentMonth);renderCalendar();updateAnalytics();}

  // Calendar UI state
  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();

  function openCalendarModal(){ document.getElementById('calendarModal').classList.remove('hidden'); renderMonth(currentYear,currentMonth); }
  function closeCalendarModal(){ document.getElementById('calendarModal').classList.add('hidden'); }

  function renderMonth(year,month){
    currentYear = year; currentMonth = month;
    const grid = document.getElementById('calendarGrid'); if(!grid) return;
    grid.innerHTML='';
    const monthLabel = document.getElementById('monthLabel'); monthLabel.textContent = new Date(year,month,1).toLocaleString(undefined,{month:'long',year:'numeric'});

    // first day index and days in month
    const first = new Date(year,month,1).getDay(); // 0..6 (Sun..Sat)
    const days = new Date(year,month+1,0).getDate();

    // days from previous month fill
    const prevDays = first; // number of blanks
    const totalCells = prevDays + days;

    // create cells for weekday headers
    const headers = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    headers.forEach(h=>{ const el=document.createElement('div'); el.className='day-cell'; el.style.background='transparent'; el.style.fontWeight='600'; el.style.textAlign='center'; el.textContent=h; grid.appendChild(el); });

    for(let i=0;i<prevDays;i++){
      const el=document.createElement('div'); el.className='day-cell empty'; grid.appendChild(el);
    }

    for(let d=1;d<=days;d++){
      const el=document.createElement('div'); el.className='day-cell';
      const dn = document.createElement('div'); dn.className='day-number'; dn.textContent=d; el.appendChild(dn);
      const eventsWrap = document.createElement('div'); eventsWrap.className='day-events';
      const dayKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dayEvents = getEventsForDay(dayKey);
      dayEvents.slice(0,3).forEach(ev=>{
        const pill = document.createElement('div'); pill.className='event-pill'; pill.textContent = ev.title; pill.title = ev.notes || '';
        pill.addEventListener('click',(e)=>{ e.stopPropagation(); editEvent(ev);});
        eventsWrap.appendChild(pill);
      });
      if(dayEvents.length>3){ const more = document.createElement('div'); more.className='event-pill'; more.textContent = `+${dayEvents.length-3} more`; eventsWrap.appendChild(more); }
      el.appendChild(eventsWrap);
      el.addEventListener('click',()=>{ addEventDialog(dayKey); });
      grid.appendChild(el);
    }
  }

  function getEventsForDay(isoDate){ return list().filter(e=>e.date===isoDate).sort((a,b)=>a.title.localeCompare(b.title)); }

  function addEventDialog(date){
    const title = prompt('Event title', 'Study Session'); if(!title) return;
    const kind = prompt('Kind (Exam,Assignment,Revision,Study)','Study')||'Study';
    const notes = prompt('Notes (optional)','')||'';
    add({title,date,kind,notes});
  }

  function editEvent(ev){
    const actions = prompt(`Event: ${ev.title}\n1) Edit title\n2) Edit notes\n3) Delete\nChoose 1-3`,'1');
    if(!actions) return;
    if(actions==='1'){ const t = prompt('Title',ev.title); if(t!=null) update(ev.id,{title:t}); }
    else if(actions==='2'){ const n = prompt('Notes',ev.notes); if(n!=null) update(ev.id,{notes:n}); }
    else if(actions==='3'){ if(confirm('Delete event?')) remove(ev.id); }
  }

  function renderCalendar(){
    const upcoming = list().filter(e=>new Date(e.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,6);
    document.getElementById('upcomingEvents').textContent = upcoming.length;
  }

  // wire modal controls when DOM available
  document.addEventListener('DOMContentLoaded',()=>{
    const openBtn = document.querySelector('.nav-btn[data-view="calendar"]'); if(openBtn) openBtn.addEventListener('click',openCalendarModal);
    const closeBtn = document.getElementById('closeCalendarModal'); if(closeBtn) closeBtn.addEventListener('click',closeCalendarModal);
    const prev = document.getElementById('prevMonth'); const next = document.getElementById('nextMonth');
    if(prev) prev.addEventListener('click',()=>{ const m = currentMonth-1; if(m<0){ currentMonth=11; currentYear -=1;} else currentMonth = m; renderMonth(currentYear,currentMonth); });
    if(next) next.addEventListener('click',()=>{ const m = currentMonth+1; if(m>11){ currentMonth=0; currentYear +=1;} else currentMonth = m; renderMonth(currentYear,currentMonth); });
  });

  return {add,update,remove,list,renderCalendar,openCalendarModal}
})();
