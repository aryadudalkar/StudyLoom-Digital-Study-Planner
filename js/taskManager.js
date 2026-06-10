const TaskManager = (function(){
  function id(){return 't_'+Date.now()+Math.random().toString(36).slice(2,8)}
  function list(){return Storage.load().tasks}
  function add(task){withState(s=>s.tasks.unshift({id:id(),name:task.name||'Untitled',subject:task.subject||'',priority:task.priority||'Medium',done:false,created:Date.now()}));renderTasks()}
  function update(id,patch){withState(s=>{const t=s.tasks.find(x=>x.id===id); if(t) Object.assign(t,patch)});renderTasks();updateAnalytics();}
  function remove(id){withState(s=>{s.tasks=s.tasks.filter(x=>x.id!==id)});renderTasks();updateAnalytics();}
  function toggle(id,done){update(id,{done})}

  function renderTasks(){
    const container=document.getElementById('tasksContainer');if(!container) return;container.innerHTML='';
    const table = document.createElement('table'); table.className='tasks-list';
    list().forEach(t=>{
      const tr = document.createElement('tr');
      const tdThumb = document.createElement('td'); tdThumb.className='task-thumb'; const img = document.createElement('img'); img.src='assets/tasks.png'; img.alt='task'; tdThumb.appendChild(img);
      const tdName = document.createElement('td'); tdName.innerHTML = `<div style="font-weight:600">${t.name}</div><div style='color:var(--pepper);font-size:13px'>${t.subject||''}</div>`;
      const tdPriority = document.createElement('td'); const pBadge = document.createElement('span'); pBadge.className='priority-badge'; if(t.priority==='High') pBadge.classList.add('priority-high'); else if(t.priority==='Low') pBadge.classList.add('priority-low'); else pBadge.classList.add('priority-medium'); pBadge.textContent = t.priority;
      tdPriority.appendChild(pBadge);
      const tdActions = document.createElement('td'); tdActions.innerHTML = `<button class="small edit">Edit</button> <button class="small del">Del</button> <label style="margin-left:8px"><input type='checkbox' ${t.done? 'checked':''} class='complete'/> Done</label>`;
      tr.appendChild(tdThumb); tr.appendChild(tdName); tr.appendChild(tdPriority); tr.appendChild(tdActions);
      // actions
      tdActions.querySelector('.del').addEventListener('click',()=>remove(t.id));
      tdActions.querySelector('.edit').addEventListener('click',()=>{ const name = prompt('Edit task name', t.name); if(name!=null) update(t.id,{name}); });
      tdActions.querySelector('.complete').addEventListener('change',e=>toggle(t.id,e.target.checked));
      table.appendChild(tr);
    });
    container.appendChild(table);
  }

  return {add,remove,update,list,renderTasks,toggle}
})();
