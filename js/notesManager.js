const NotesManager = (function(){
  function id(){return 'n_'+Date.now()+Math.random().toString(36).slice(2,8)}
  function list(){return Storage.load().notes}
  function add(note){withState(s=>s.notes.push({id:id(),text:note.text||'New note',color:note.color||'#FAEADC',x:0,y:0,rot:(Math.random()*6)-3})) ; renderNotes()}
  function update(id,patch){withState(s=>{const n=s.notes.find(x=>x.id===id); if(n) Object.assign(n,patch)});renderNotes();}
  function remove(id){withState(s=>{s.notes=s.notes.filter(x=>x.id!==id)});renderNotes();}

  function renderNotes(){
    const container=document.getElementById('notesContainer'); if(!container) return; container.innerHTML='';
    list().forEach(n=>{
      const el=document.createElement('div'); el.className='note'; el.style.background=n.color; el.style.transform=`rotate(${n.rot}deg)`;
      el.innerHTML=`<div>${n.text}</div><div style="margin-top:8px;text-align:right"><button class="edit">Edit</button> <button class="del">Del</button></div>`;
      el.querySelector('.edit').addEventListener('click',()=>{ const t=prompt('Edit note', n.text); if(t!=null) update(n.id,{text:t});});
      el.querySelector('.del').addEventListener('click',()=>{ if(confirm('Delete note?')) remove(n.id);});
      container.appendChild(el);
    });
  }

  return {add,update,remove,list,renderNotes}
})();
