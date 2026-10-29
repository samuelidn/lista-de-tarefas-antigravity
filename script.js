/**
 * ==============================================================================
 * APLICAÇÃO DE LISTA DE TAREFAS (TO-DO LIST)
 * ==============================================================================
 * Este arquivo JavaScript gerencia toda a interatividade e lógica da aplicação:
 * 1. Estado da aplicação (dados em memória e no localStorage)
 * 2. Manipulação do DOM (adicionar, alterar e remover elementos visuais)
 * 3. Escuta de eventos (cliques de botão, digitação, envio de formulário)
 */

// ==============================================================================
// 1. SELEÇÃO DE ELEMENTOS DO DOM (DOCUMENT OBJECT MODEL)
// Guardamos referências aos elementos HTML com os quais vamos interagir.
// ==============================================================================
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const taskCounter = document.getElementById("task-counter");
const filterButtons = document.querySelectorAll(".filter-btn");

// ==============================================================================
// 2. ESTADO DA APLICAÇÃO (DADOS)
// Um array (lista) de objetos que armazena todas as tarefas.
// Cada tarefa tem o formato: { id: number, text: string, completed: boolean }
// ==============================================================================
let tasks = loadTasksFromStorage();
let currentFilter = "all"; // Pode ser: 'all', 'pending', 'completed'

// ==============================================================================
// 3. FUNÇÕES PRINCIPAIS DE MANIPULAÇÃO DE TAREFAS
// ==============================================================================

/**
 * Adiciona uma nova tarefa à lista
 * @param {string} text - O título ou descrição da tarefa
 */
function addTask(text) {
  const trimmedText = text.trim();
  
  // Se o texto estiver vazio, não fazemos nada
  if (trimmedText === "") return;

  // Cria um novo objeto representando a tarefa
  const newTask = {
    id: Date.now() + Math.random(), // Gera um identificador único (timestamp + aleatório)
    text: trimmedText,
    completed: false
  };

  // Adiciona a nova tarefa no início da lista (array)
  tasks.unshift(newTask);

  // Salva no armazenamento do navegador e atualiza a tela
  saveTasksToStorage();
  render();
}

/**
 * Alterna o estado de concluído de uma tarefa (true <-> false)
 * @param {number} id - O ID da tarefa a ser alterada
 */
function toggleTask(id) {
  // Procura a tarefa no array pelo ID
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasksToStorage();
  render();
}

/**
 * Remove uma tarefa da lista pelo seu ID
 * @param {number} id - O ID da tarefa a ser removida
 */
function deleteTask(id) {
  // Filtra a lista, mantendo apenas as tarefas cujo ID seja diferente do selecionado
  tasks = tasks.filter(task => task.id !== id);

  saveTasksToStorage();
  render();
}

// ==============================================================================
// 4. PERSISTÊNCIA DE DADOS (LOCALSTORAGE)
// Permite salvar as tarefas no próprio navegador para não perder ao recarregar a página.
// ==============================================================================

/**
 * Salva a lista de tarefas atual no localStorage convertida em texto JSON
 */
function saveTasksToStorage() {
  try {
    localStorage.setItem("my_tasks_data", JSON.stringify(tasks));
  } catch (e) {
    console.warn("Armazenamento local indisponível:", e);
  }
}

/**
 * Carrega as tarefas salvas no localStorage. Se não houver nada, retorna um array vazio.
 */
function loadTasksFromStorage() {
  try {
    const savedData = localStorage.getItem("my_tasks_data");
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (e) {
    console.error("Erro ao ler dados salvos:", e);
  }
  return [];
}

// ==============================================================================
// 5. ATUALIZAÇÃO DA TELA (RENDERIZAÇÃO)
// Converte os dados do array 'tasks' em elementos visuais HTML.
// ==============================================================================

function render() {
  // Limpa o conteúdo atual da lista antes de redesenhar
  taskList.innerHTML = "";

  // Filtra as tarefas conforme a aba selecionada (Todas, Pendentes, Concluídas)
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true; // "all"
  });

  // Controla a exibição da mensagem de "lista vazia"
  if (filteredTasks.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  // Cria e adiciona cada item de tarefa no DOM
  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : "pending"}`;

    // Monta a estrutura HTML interna de cada item com identificação clara de estado
    li.innerHTML = `
      <label class="task-content">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? "checked" : ""}
          aria-label="Marcar tarefa como ${task.completed ? "pendente" : "concluída"}"
        />
        <div class="task-details">
          <span class="task-text">${escapeHtml(task.text)}</span>
          <span class="status-badge ${task.completed ? "badge-completed" : "badge-pending"}">
            ${task.completed ? "✓ Concluída" : "Pendente"}
          </span>
        </div>
      </label>
      <button class="delete-btn" title="Excluir tarefa" aria-label="Excluir tarefa">&times;</button>
    `;

    // Evento de alternar status ao interagir com o checkbox
    const checkbox = li.querySelector(".task-checkbox");
    checkbox.addEventListener("change", () => {
      toggleTask(task.id);
    });

    // Evento de exclusão ao clicar no botão 'X'
    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation(); // Impede que o clique acione o label
      deleteTask(task.id);
    });

    // Adiciona o elemento criado dentro da lista na página
    taskList.appendChild(li);
  });

  // Atualiza os contadores no resumo
  updateSummary();
}

/**
 * Atualiza o texto do contador de tarefas (ex: '2 de 5 tarefas concluídas')
 */
function updateSummary() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  if (total === 0) {
    taskCounter.textContent = "0 tarefas no total";
  } else {
    taskCounter.textContent = `${completed} de ${total} tarefa(s) concluída(s)`;
  }
}

/**
 * Função utilitária para evitar que códigos maliciosos inseridos pelo usuário
 * quebrem o HTML (Segurança básica contra XSS)
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ==============================================================================
// 6. ESCUTADORES DE EVENTOS GLOBAIS (EVENT LISTENERS)
// ==============================================================================

// Evento quando o formulário é enviado (clique no botão ou pressionar "Enter")
taskForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Impede o recarregamento padrão da página

  addTask(taskInput.value);
  taskInput.value = ""; // Limpa o campo de texto
  taskInput.focus();    // Mantém o cursor no campo de texto para facilitar
});

// Eventos para os botões de filtro (Todas, Pendentes, Concluídas)
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove a classe 'active' de todos e adiciona no botão clicado
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Atualiza o filtro atual e redesenha a lista
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ==============================================================================
// 7. INICIALIZAÇÃO DA APLICAÇÃO
// Renderiza a lista com o que estiver salvo assim que a página é carregada
// ==============================================================================
render();
