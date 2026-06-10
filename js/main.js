const STORAGE_KEY = 'studyloom_data';

// Default data structure
let data = {
  tasks: [],
  subjects: [],
  notes: []
};

// Load data
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      data = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load data from localStorage", e);
  }
  if (!data.notes) data.notes = [];
}

// Save data
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data to localStorage", e);
  }
}

// Render Tasks
function renderTasks() {
  const taskList = document.getElementById('taskList');
  if (!taskList) return;
  taskList.innerHTML = '';
  
  if (data.tasks.length === 0) {
    taskList.innerHTML = '<div style="color:var(--text-muted);font-size:14px;padding:16px 0;">No tasks yet. Add one above!</div>';
    return;
  }
  
  data.tasks.forEach((task, index) => {
    const item = document.createElement('div');
    item.className = 'task-item';
    
    // priority color class
    let priorityClass = 'tag-medium';
    if (task.priority === 'High') priorityClass = 'tag-high';
    if (task.priority === 'Low') priorityClass = 'tag-low';
    
    item.innerHTML = `
      <input type="checkbox" class="task-check" ${task.done ? 'checked' : ''} onchange="toggleTask(${index})">
      <span class="task-name" style="${task.done ? 'text-decoration: line-through; opacity:0.6' : ''}">${task.name}</span>
      <span class="task-category">${task.subject}</span>
      <span class="tag ${priorityClass}">${task.priority}</span>
      <button class="menu-btn" onclick="deleteTask(${index})" title="Delete Task" style="font-size: 16px;">✕</button>
    `;
    
    taskList.appendChild(item);
    
    if (index < data.tasks.length - 1) {
      const hr = document.createElement('hr');
      hr.className = 'task-divider';
      taskList.appendChild(hr);
    }
  });

  // Update progress
  const chart = document.getElementById('taskProgressChart');
  if (chart) {
    const completed = data.tasks.filter(t => t.done).length;
    const pct = data.tasks.length ? Math.round((completed / data.tasks.length) * 100) : 0;
    chart.style.background = `conic-gradient(var(--primary) ${pct}%, var(--secondary-bg) 0%)`;
    chart.title = `${pct}% Completed`;
  }
}

// Render Notes
function renderNotes() {
  const notesContainer = document.getElementById('notesContainer');
  if (!notesContainer) return;
  notesContainer.innerHTML = '';
  
  if (!data.notes || data.notes.length === 0) {
    notesContainer.innerHTML = '<div style="color:var(--text-muted);font-size:14px; grid-column: 1/-1;">No notes yet. Add one!</div>';
    return;
  }
  
  data.notes.forEach((note, index) => {
    const el = document.createElement('div');
    el.className = 'sticky-note';
    // Random subtle rotation between -2 and 2 deg
    const rot = (Math.random() * 4) - 2;
    el.style.transform = `rotate(${rot}deg)`;
    // Store original rotation as a data attribute to keep it when hovered
    el.innerHTML = `
      <button class="note-delete-btn" onclick="deleteNote(${index})" title="Delete Note">✕</button>
      <div style="white-space:pre-wrap;">${note.text}</div>
    `;
    notesContainer.appendChild(el);
  });
}

// Render Subjects
function renderSubjects() {
  const subjectList = document.getElementById('subjectList');
  if (!subjectList) return;
  subjectList.innerHTML = '';
  
  data.subjects.forEach((subject, index) => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'space-between';
    div.style.padding = '14px 18px';
    div.style.backgroundColor = 'var(--secondary-bg)';
    div.style.borderRadius = '12px';
    div.style.marginTop = '12px';
    div.style.fontSize = '14px';
    div.style.fontWeight = '500';
    div.style.color = 'var(--text-dark)';
    div.style.width = '100%';
    
    div.innerHTML = `
      <span>${subject.name}</span>
      <button style="background:transparent;border:none;color:#B4505B;cursor:pointer;font-size:14px;padding:4px;" onclick="deleteSubject(${index})" title="Delete Subject">✕</button>
    `;
    subjectList.appendChild(div);
  });
}

// Actions (must be accessible from inline event handlers)
window.toggleTask = function(index) {
  data.tasks[index].done = !data.tasks[index].done;
  saveData();
  renderTasks();
};

window.deleteTask = function(index) {
  if (confirm('Delete this task?')) {
    data.tasks.splice(index, 1);
    saveData();
    renderTasks();
  }
};

window.deleteSubject = function(index) {
  if (confirm('Delete this subject?')) {
    data.subjects.splice(index, 1);
    saveData();
    renderSubjects();
  }
};

window.deleteNote = function(index) {
  if (confirm('Delete this note?')) {
    data.notes.splice(index, 1);
    saveData();
    renderNotes();
  }
};

// Setup Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  // DOM Elements
  const addTaskBtn = document.getElementById('addTaskBtn');
  const addSubjectBtn = document.getElementById('addSubjectBtn');
  const dateEl = document.getElementById('currentDate');
  
  // Set Date Dynamically
  if (dateEl) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const today = new Date().toLocaleDateString('en-GB', options); // DD/MM/YYYY
    dateEl.innerHTML = `<svg class="cal-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg> ${today}`;
  }
  
  // Modal Functions
  const overlay = document.getElementById('modalOverlay');
  function openModal(id) {
    document.querySelectorAll('.modal-content').forEach(m => m.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    overlay.classList.add('active');
  }
  function closeModal() {
    overlay.classList.remove('active');
    document.querySelectorAll('.modal-content').forEach(m => m.classList.remove('active'));
  }
  
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Add Task Logic
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      document.getElementById('taskNameInput').value = '';
      document.getElementById('taskSubjectInput').value = '';
      document.getElementById('taskPriorityInput').value = 'Medium';
      openModal('taskModal');
    });
  }
  
  document.getElementById('saveTaskBtn')?.addEventListener('click', () => {
    const name = document.getElementById('taskNameInput').value.trim();
    if (!name) return;
    const subject = document.getElementById('taskSubjectInput').value.trim();
    const priority = document.getElementById('taskPriorityInput').value;
    
    data.tasks.push({
      name,
      subject: subject || 'General',
      priority,
      done: false,
      id: Date.now()
    });
    saveData();
    renderTasks();
    closeModal();
  });

  // Add Subject Logic
  if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', () => {
      document.getElementById('subjectNameInput').value = '';
      openModal('subjectModal');
    });
  }

  document.getElementById('saveSubjectBtn')?.addEventListener('click', () => {
    const name = document.getElementById('subjectNameInput').value.trim();
    if (!name) return;
    data.subjects.push({
      name,
      id: Date.now()
    });
    saveData();
    renderSubjects();
    closeModal();
  });
  
  // Add Note Logic
  const addNoteBtn = document.getElementById('addNoteBtn');
  if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => {
      document.getElementById('noteContentInput').value = '';
      openModal('noteModal');
    });
  }

  document.getElementById('saveNoteBtn')?.addEventListener('click', () => {
    const text = document.getElementById('noteContentInput').value.trim();
    if (!text) return;
    data.notes.push({
      text,
      id: Date.now()
    });
    saveData();
    renderNotes();
    closeModal();
  });
  
  renderTasks();
  renderSubjects();
  renderNotes();
});
