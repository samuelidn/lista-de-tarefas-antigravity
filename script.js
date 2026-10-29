/**
 * ============================================================
 * LISTA DE TAREFAS — script.js
 * ============================================================
 *
 * Seções:
 *  1. Seleção de elementos do DOM
 *  2. Estado da aplicação
 *  3. Funções de Tarefas (CRUD)
 *  4. Persistência (localStorage)
 *  5. Renderização
 *  6. Produtividade / Resumo
 *  7. Tema claro / escuro
 *  8. Modal de confirmação
 *  9. Event listeners
 * 10. Inicialização
 */

// ============================================================
// 1. SELEÇÃO DE ELEMENTOS DO DOM
// ============================================================
const taskForm          = document.getElementById('task-form');
const taskInput         = document.getElementById('task-input');
const taskCategoryEl    = document.getElementById('task-category');
const taskPriorityEl    = document.getElementById('task-priority');
const taskDueDateEl     = document.getElementById('task-due-date');
const taskList          = document.getElementById('task-list');
const emptyState        = document.getElementById('empty-state');
const searchInput       = document.getElementById('search-input');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const sortSelect        = document.getElementById('sort-select');
const themeToggleBtn    = document.getElementById('theme-toggle');
const themeIcon         = themeToggleBtn.querySelector('.theme-icon');

// Elementos de produtividade
const statTotal         = document.getElementById('stat-total');
const statDoneToday     = document.getElementById('stat-done-today');
const statOverdue       = document.getElementById('stat-overdue');
const statPercent       = document.getElementById('stat-percent');
const progressBarFill   = document.getElementById('progress-bar-fill');

// Modal
const confirmModal      = document.getElementById('confirm-modal');
const modalCancel       = document.getElementById('modal-cancel');
const modalConfirm      = document.getElementById('modal-confirm');

// ============================================================
// 2. ESTADO DA APLICAÇÃO
// ============================================================
/**
 * Cada tarefa tem o formato:
 * {
 *   id:           number,   — identificador único
 *   text:         string,   — descrição da tarefa
 *   completed:    boolean,  — se está concluída
 *   priority:     string,   — 'alta' | 'media' | 'baixa'
 *   category:     string,   — 'geral' | 'estudos' | 'trabalho' | 'pessoal'
 *   dueDate:      string,   — 'YYYY-MM-DD' ou ''
 *   createdAt:    number,   — timestamp de criação (Date.now())
 *   completedAt:  number|null — timestamp de conclusão (ou null)
 * }
 */
let tasks         = loadTasksFromStorage();
let currentFilter = 'all';     // Filtro de status
let currentCat    = 'all';     // Filtro de categoria
let currentSort   = 'date_desc';
let searchQuery   = '';
let currentTheme  = localStorage.getItem('theme') || 'light';

// Aplica o tema salvo imediatamente ao carregar
applyTheme(currentTheme);

// ============================================================
// 3. FUNÇÕES DE TAREFAS (CRUD)
// ============================================================

/**
 * Adiciona uma nova tarefa ao array e salva.
 */
function addTask(text, category, priority, dueDate) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id:          Date.now() + Math.random(),
    text:        trimmed,
    completed:   false,
    priority:    priority  || 'media',
    category:    category  || 'geral',
    dueDate:     dueDate   || '',
    createdAt:   Date.now(),
    completedAt: null
  };

  tasks.unshift(newTask);
  saveTasksToStorage();
  render();
}

/**
 * Alterna o estado concluída ↔ pendente de uma tarefa.
 * Registra o timestamp de conclusão quando concluída.
 */
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id !== id) return task;
    const nowDone = !task.completed;
    return {
      ...task,
      completed:   nowDone,
      completedAt: nowDone ? Date.now() : null
    };
  });
  saveTasksToStorage();
  render();
}

/**
 * Salva o novo texto de uma tarefa após edição inline.
 */
function saveTaskEdit(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return; // não salva texto vazio
  tasks = tasks.map(task =>
    task.id === id ? { ...task, text: trimmed } : task
  );
  saveTasksToStorage();
  render();
}

/**
 * Remove uma tarefa pelo id.
 */
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasksToStorage();
  render();
}

/**
 * Remove todas as tarefas já concluídas.
 */
function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasksToStorage();
  render();
}

// ============================================================
// 4. PERSISTÊNCIA (localStorage)
// ============================================================
function saveTasksToStorage() {
  try {
    localStorage.setItem('my_tasks_data', JSON.stringify(tasks));
  } catch (e) {
    console.warn('Não foi possível salvar no localStorage:', e);
  }
}

function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem('my_tasks_data');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Erro ao carregar tarefas:', e);
  }
  return [];
}

// ============================================================
// 5. RENDERIZAÇÃO
// ============================================================

/**
 * Função principal de renderização.
 * Aplica filtros, busca e ordenação; depois gera o HTML de cada tarefa.
 */
function render() {
  taskList.innerHTML = '';

  // 5a. Filtrar por status
  let visible = tasks.filter(task => {
    if (currentFilter === 'pending')   return !task.completed;
    if (currentFilter === 'completed') return  task.completed;
    return true;
  });

  // 5b. Filtrar por categoria
  if (currentCat !== 'all') {
    visible = visible.filter(task => task.category === currentCat);
  }

  // 5c. Filtrar pela busca (nome)
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    visible = visible.filter(task => task.text.toLowerCase().includes(q));
  }

  // 5d. Ordenar
  visible = sortTasks(visible, currentSort);

  // 5e. Estado vazio
  emptyState.classList.toggle('hidden', visible.length > 0);

  // 5f. Renderizar cada item
  visible.forEach(task => {
    const li = buildTaskElement(task);
    taskList.appendChild(li);
  });

  // 5g. Atualizar painel de produtividade
  updateProductivity();
}

/**
 * Ordena o array conforme a opção escolhida.
 */
function sortTasks(list, sort) {
  const priorityOrder = { alta: 0, media: 1, baixa: 2 };
  return [...list].sort((a, b) => {
    switch (sort) {
      case 'priority':
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'due_date':
        // Tarefas sem data ficam por último
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      case 'alpha':
        return a.text.localeCompare(b.text, 'pt-BR');
      default: // date_desc (mais recentes primeiro)
        return b.createdAt - a.createdAt;
    }
  });
}

/**
 * Cria e retorna o elemento <li> completo de uma tarefa.
 */
function buildTaskElement(task) {
  const li = document.createElement('li');
  li.className = [
    'task-item',
    task.completed ? 'completed' : '',
    `priority-${task.priority}`
  ].join(' ').trim();
  li.dataset.id = task.id;

  // --- Checkbox ---
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', task.completed ? 'Marcar como pendente' : 'Marcar como concluída');
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // --- Corpo ---
  const body = document.createElement('div');
  body.className = 'task-body';

  // Linha do texto
  const topRow = document.createElement('div');
  topRow.className = 'task-top';

  const textSpan = document.createElement('span');
  textSpan.className = 'task-text';
  textSpan.textContent = task.text;
  topRow.appendChild(textSpan);

  // Linha de metadados (badges)
  const metaRow = document.createElement('div');
  metaRow.className = 'task-meta';

  // Badge de status
  const statusBadge = document.createElement('span');
  statusBadge.className = `badge ${task.completed ? 'badge-status-done' : 'badge-status-pending'}`;
  statusBadge.textContent = task.completed ? '✓ Concluída' : 'Pendente';
  metaRow.appendChild(statusBadge);

  // Badge de prioridade
  const priBadge = document.createElement('span');
  priBadge.className = `badge badge-priority-${task.priority}`;
  const priLabels = { alta: '🔴 Alta', media: '🟡 Média', baixa: '🟢 Baixa' };
  priBadge.textContent = priLabels[task.priority];
  metaRow.appendChild(priBadge);

  // Badge de categoria
  const catBadge = document.createElement('span');
  catBadge.className = 'badge badge-category';
  const catLabels = { geral: '📋 Geral', estudos: '📚 Estudos', trabalho: '💼 Trabalho', pessoal: '🏠 Pessoal' };
  catBadge.textContent = catLabels[task.category] || task.category;
  metaRow.appendChild(catBadge);

  // Badge de vencimento (só se tiver data)
  if (task.dueDate) {
    const dueBadge = buildDueBadge(task.dueDate);
    metaRow.appendChild(dueBadge);
  }

  body.appendChild(topRow);
  body.appendChild(metaRow);

  // --- Botões de ação ---
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  // Botão Editar
  const editBtn = document.createElement('button');
  editBtn.className = 'task-action-btn edit-btn';
  editBtn.title = 'Editar tarefa';
  editBtn.setAttribute('aria-label', 'Editar tarefa');
  editBtn.textContent = '✏️';
  editBtn.addEventListener('click', () => startInlineEdit(li, task, textSpan, editBtn));
  actions.appendChild(editBtn);

  // Botão Excluir
  const delBtn = document.createElement('button');
  delBtn.className = 'task-action-btn delete-btn';
  delBtn.title = 'Excluir tarefa';
  delBtn.setAttribute('aria-label', 'Excluir tarefa');
  delBtn.textContent = '🗑';
  delBtn.addEventListener('click', () => deleteTask(task.id));
  actions.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(body);
  li.appendChild(actions);

  return li;
}

/**
 * Cria o badge de vencimento com estilo de alerta conforme a data.
 */
function buildDueBadge(dueDate) {
  const badge = document.createElement('span');
  badge.className = 'badge badge-due';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00'); // força interpretação local
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  let icon = '📅';
  let label = formatDateBR(dueDate);

  if (diffDays < 0) {
    badge.classList.add('due-overdue');
    icon = '⚠️';
    label = `Atrasada (${formatDateBR(dueDate)})`;
  } else if (diffDays <= 2) {
    badge.classList.add('due-soon');
    icon = '⏰';
    label = diffDays === 0 ? 'Vence hoje' : diffDays === 1 ? 'Vence amanhã' : `Vence em ${diffDays} dias`;
  }

  badge.textContent = `${icon} ${label}`;
  return badge;
}

/**
 * Converte 'YYYY-MM-DD' para 'DD/MM/YYYY'.
 */
function formatDateBR(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Inicia o modo de edição inline substituindo o <span> por um <input>.
 */
function startInlineEdit(li, task, textSpan, editBtn) {
  // Evita abrir dois inputs simultâneos
  if (li.querySelector('.task-edit-input')) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.text;
  input.setAttribute('aria-label', 'Editar texto da tarefa');

  // Substitui o span pelo input
  textSpan.replaceWith(input);
  input.focus();
  input.select();

  // Troca o botão de editar pelo de salvar
  editBtn.textContent = '💾';
  editBtn.className = 'task-action-btn save-btn';
  editBtn.title = 'Salvar edição';
  editBtn.setAttribute('aria-label', 'Salvar edição da tarefa');

  // Confirmar com Enter ou clicando em Salvar
  const confirm = () => {
    saveTaskEdit(task.id, input.value);
  };

  editBtn.onclick = confirm;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') render(); // cancela
  });

  // Clicar fora também cancela (restaura estado sem salvar)
  input.addEventListener('blur', () => {
    // Pequeno delay para permitir que o clique em "Salvar" seja processado antes
    setTimeout(() => {
      if (document.contains(input)) render();
    }, 150);
  });
}

// ============================================================
// 6. PRODUTIVIDADE / RESUMO
// ============================================================

/**
 * Atualiza os indicadores de produtividade no topo da tela.
 */
function updateProductivity() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent   = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Concluídas HOJE
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const doneToday = tasks.filter(t =>
    t.completed && t.completedAt && t.completedAt >= todayStart.getTime()
  ).length;

  // Atrasadas (não concluídas e com data passada)
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const overdue = tasks.filter(t => {
    if (t.completed || !t.dueDate) return false;
    return new Date(t.dueDate + 'T00:00:00') < now;
  }).length;

  statTotal.textContent     = total;
  statDoneToday.textContent = doneToday;
  statOverdue.textContent   = overdue;
  statPercent.textContent   = percent + '%';
  progressBarFill.style.width = percent + '%';
}

// ============================================================
// 7. TEMA CLARO / ESCURO
// ============================================================

/**
 * Aplica o tema ao atributo data-theme do <html> e atualiza o ícone.
 */
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  applyTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// ============================================================
// 8. MODAL DE CONFIRMAÇÃO
// ============================================================

let confirmCallback = null;

/**
 * Abre o modal pedindo confirmação antes de executar a ação.
 */
function openConfirmModal(message, onConfirm) {
  document.getElementById('modal-message').textContent = message;
  confirmCallback = onConfirm;
  confirmModal.hidden = false;
  modalConfirm.focus();
}

function closeModal() {
  confirmModal.hidden = true;
  confirmCallback = null;
}

// ============================================================
// 9. EVENT LISTENERS
// ============================================================

// Submissão do formulário (adicionar tarefa)
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  addTask(
    taskInput.value,
    taskCategoryEl.value,
    taskPriorityEl.value,
    taskDueDateEl.value
  );
  taskInput.value   = '';
  taskDueDateEl.value = '';
  taskInput.focus();
});

// Busca em tempo real
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  render();
});

// Botão limpar concluídas (abre modal de confirmação)
clearCompletedBtn.addEventListener('click', () => {
  const count = tasks.filter(t => t.completed).length;
  if (count === 0) return;
  openConfirmModal(
    `Deseja remover permanentemente ${count} tarefa(s) concluída(s)? Essa ação não pode ser desfeita.`,
    clearCompleted
  );
});

// Ordenação
sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  render();
});

// Alternador de tema
themeToggleBtn.addEventListener('click', toggleTheme);

// Filtros de status
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Filtros de categoria
document.querySelectorAll('.cat-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCat = btn.dataset.cat;
    render();
  });
});

// Modal — cancelar
modalCancel.addEventListener('click', closeModal);

// Modal — confirmar
modalConfirm.addEventListener('click', () => {
  if (typeof confirmCallback === 'function') confirmCallback();
  closeModal();
});

// Fechar modal clicando no overlay (fora da caixa)
confirmModal.addEventListener('click', e => {
  if (e.target === confirmModal) closeModal();
});

// Fechar modal com Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !confirmModal.hidden) closeModal();
});

// ============================================================
// 10. INICIALIZAÇÃO
// ============================================================
render();
