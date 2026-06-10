const SubjectManager = (function(){
  function id(){return 's_'+Date.now()+Math.random().toString(36).slice(2,8)}
  function list(){return Storage.load().subjects}
  function add(subject){withState(s=>s.subjects.unshift({id:id(),name:subject.name||'New Subject',cover:subject.cover||'',topics:[],created:Date.now()}));renderSubjects();updateAnalytics();}
  function update(id,patch){withState(s=>{const it=s.subjects.find(x=>x.id===id); if(it) Object.assign(it,patch)});renderSubjects();updateAnalytics();}
  function remove(id){withState(s=>{s.subjects=s.subjects.filter(x=>x.id!==id)});renderSubjects();updateAnalytics();}
  function addTopic(subjectId,topic){withState(s=>{const sub=s.subjects.find(x=>x.id===subjectId); if(sub){sub.topics.push({id:id(),name:topic.name||'Topic',progress:topic.progress||0,notes:topic.notes||''})}});renderSubjects();updateAnalytics();}
  function updateTopic(subjectId,topicId,patch){withState(s=>{const sub=s.subjects.find(x=>x.id===subjectId); if(!sub) return; const top=sub.topics.find(t=>t.id===topicId); if(top) Object.assign(top,patch)});renderSubjects();updateAnalytics();}
  function removeTopic(subjectId,topicId){withState(s=>{const sub=s.subjects.find(x=>x.id===subjectId); if(sub) sub.topics=sub.topics.filter(t=>t.id!==topicId)});renderSubjects();updateAnalytics();}

  function subjectProgress(sub){ if(!sub || !sub.topics || sub.topics.length===0) return 0; const sum=sub.topics.reduce((a,b)=>a+b.progress,0); return Math.round(sum/sub.topics.length);
  }

  function renderSubjects(){
    const container=document.getElementById('subjectsContainer'); if(!container) return; container.innerHTML='';
    list().forEach(s=>{
      const card=document.createElement('div');card.className='subject-card';
      const thumbWrap = document.createElement('div'); thumbWrap.style.width='72px'; thumbWrap.style.height='72px'; thumbWrap.style.borderRadius='50%'; thumbWrap.style.overflow='hidden';
      const img = document.createElement('img'); img.src = s.cover || 'assets/subjects.png'; img.alt = s.name; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover'; thumbWrap.appendChild(img);
      const meta = document.createElement('div'); meta.style.padding='8px 0';
      const h = document.createElement('h4'); h.textContent=s.name; h.style.margin='0 0 6px 0';
      const p = document.createElement('div'); const prog=subjectProgress(s); p.innerHTML = `<div class="sub-progress"><div class="bar" style="height:10px;border-radius:8px;background:linear-gradient(90deg,var(--mocha),var(--terra));width:${prog}%"></div></div><small>${prog}% complete</small>`;
      const actions = document.createElement('div'); actions.style.marginTop='8px';
      const openBtn = document.createElement('button'); openBtn.textContent='Open'; openBtn.className='small'; openBtn.addEventListener('click',()=>openSubject(s.id));
      const delBtn = document.createElement('button'); delBtn.textContent='Delete'; delBtn.className='small'; delBtn.addEventListener('click',()=>{ if(confirm('Delete subject?')) remove(s.id)});
      actions.appendChild(openBtn); actions.appendChild(delBtn);
      meta.appendChild(h); meta.appendChild(p); meta.appendChild(actions);
      card.appendChild(thumbWrap); card.appendChild(meta);
      container.appendChild(card);
    });
    document.getElementById('subjectCount').textContent = list().length;
  }

  function openSubjectModal(id){
    const state = Storage.load(); const sub = state.subjects.find(s=>s.id===id); if(!sub) return alert('Subject not found');
    const modal = document.getElementById('subjectModal'); const content = document.getElementById('subjectModalContent');
    content.innerHTML = '';
    const title = document.createElement('h2'); title.textContent = sub.name; title.style.fontFamily = "Playfair Display, serif";
    const addTopicBtn = document.createElement('button'); addTopicBtn.textContent = '+ Topic'; addTopicBtn.className='small'; addTopicBtn.addEventListener('click',()=>{ const t = prompt('Topic name'); if(t) { addTopic(id,{name:t,progress:0}); renderSubjectModal(id); }});
    // cover controls
    const coverWrap = document.createElement('div'); coverWrap.style.display='flex'; coverWrap.style.alignItems='center'; coverWrap.style.gap='12px'; coverWrap.style.margin='8px 0 12px';
    const coverThumb = document.createElement('div'); coverThumb.style.width='84px'; coverThumb.style.height='84px'; coverThumb.style.borderRadius='10px'; coverThumb.style.overflow='hidden'; coverThumb.style.flex='0 0 84px';
    const coverImg = document.createElement('img'); coverImg.src = sub.cover || 'assets/subjects.png'; coverImg.style.width='100%'; coverImg.style.height='100%'; coverImg.style.objectFit='cover'; coverThumb.appendChild(coverImg);
    const coverActions = document.createElement('div');
    const changeUrlBtn = document.createElement('button'); changeUrlBtn.textContent='Change Cover (URL)'; changeUrlBtn.className='small'; changeUrlBtn.addEventListener('click',()=>{
      const url = prompt('Enter image URL', sub.cover||''); if(url!=null){ update(id,{cover:url}); coverImg.src = url; renderSubjectModal(id); }
    });
    const uploadBtn = document.createElement('button'); uploadBtn.textContent='Upload Cover'; uploadBtn.className='small';
    const fileInput = document.createElement('input'); fileInput.type='file'; fileInput.accept='image/*'; fileInput.style.display='none'; fileInput.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = function(ev){ const data = ev.target.result; update(id,{cover:data}); coverImg.src = data; renderSubjectModal(id); }; reader.readAsDataURL(f);
    });
    uploadBtn.addEventListener('click',()=>fileInput.click());
    coverActions.appendChild(changeUrlBtn); coverActions.appendChild(uploadBtn); coverActions.appendChild(fileInput);
    coverWrap.appendChild(coverThumb); coverWrap.appendChild(coverActions);

    content.appendChild(title); content.appendChild(coverWrap); content.appendChild(addTopicBtn);
    const topicsWrap = document.createElement('div'); topicsWrap.className='subject-topics';
    (sub.topics||[]).forEach(tp=>{
      const row = document.createElement('div'); row.className='topic-row';
      const name = document.createElement('div'); name.className='topic-name'; name.textContent = tp.name;
      const range = document.createElement('input'); range.type='range'; range.min=0; range.max=100; range.value = tp.progress; range.addEventListener('input',()=>{ updateTopic(id,tp.id,{progress:parseInt(range.value)}); renderSubjectModal(id); });
      const pct = document.createElement('div'); pct.textContent = tp.progress + '%'; pct.style.width='48px'; pct.style.textAlign='right';
      const actions = document.createElement('div'); actions.className='topic-actions';
      const editBtn = document.createElement('button'); editBtn.textContent='Edit'; editBtn.className='small'; editBtn.addEventListener('click',()=>{ const n = prompt('Edit topic name', tp.name); if(n!=null) updateTopic(id,tp.id,{name:n}); renderSubjectModal(id); });
      const delBtn = document.createElement('button'); delBtn.textContent='Del'; delBtn.className='small'; delBtn.addEventListener('click',()=>{ if(confirm('Delete topic?')) { removeTopic(id,tp.id); renderSubjectModal(id); }});
      actions.appendChild(editBtn); actions.appendChild(delBtn);
      row.appendChild(name); row.appendChild(range); row.appendChild(pct); row.appendChild(actions);
      topicsWrap.appendChild(row);
    });
    content.appendChild(topicsWrap);
    modal.classList.remove('hidden');
  }

  function renderSubjectModal(id){ openSubjectModal(id); }

  document.addEventListener('DOMContentLoaded',()=>{
    const close = document.getElementById('closeSubjectModal'); if(close) close.addEventListener('click',()=>{ document.getElementById('subjectModal').classList.add('hidden'); });
  });

  return {add,update,remove,list,renderSubjects,addTopic,updateTopic,removeTopic,openSubjectModal}
})();
