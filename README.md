# 📝 Minha Lista de Tarefas (To-Do List)

Uma aplicação simples, moderna e intuitiva de lista de tarefas criada com as três tecnologias fundamentais da web: **HTML5**, **CSS3** e **JavaScript (Vanilla)**.

---

##  Como Executar o Projeto

Você não precisa instalar nenhuma ferramenta, biblioteca ou servidor para rodar este projeto:

1. Localize a pasta do projeto no seu computador.
2. Dê um **duplo clique no arquivo `index.html`** (ou clique com o botão direito e escolha "Abrir com" > seu navegador favorito, como Chrome, Edge ou Firefox).
3. A aplicação abrirá imediatamente pronta para uso!

---

##  Estrutura do Projeto

O projeto foi dividido intencionalmente em três arquivos para separar as responsabilidades de forma clara:

```
├── index.html   # Estrutura e conteúdo da página (O esqueleto)
├── style.css    # Aparência visual, cores e layout (A roupa / design)
├── script.js    # Lógica, interatividade e armazenamento (O cérebro)
├── testes.html  # Painel interativo de testes das funcionalidades
└── README.md    # Documentação e guia de estudo
```

---

##  Como Funciona Cada Componente?

### 1. `index.html` — Estrutura e Semântica
- Define os elementos visuais que aparecem na tela:
  - `<header>`: O título da aplicação.
  - `<form>` e `<input>`: A caixa de texto onde o usuário digita a nova atividade e o botão para adicionar.
  - `<div class="filters">`: Botões para filtrar tarefas (Todas, Pendentes, Concluídas).
  - `<ul id="task-list">`: A lista não-ordenada onde as tarefas são inseridas dinamicamente pelo JavaScript.

### 2. `style.css` — Estilização e Design
- Utiliza **Variáveis CSS (`:root`)** para centralizar a paleta de cores. Se você quiser trocar a cor principal do projeto, basta alterar a variável `--primary-color`.
- Usa **Flexbox (`display: flex`)** para alinhar elementos com precisão (como o input ao lado do botão, ou o checkbox ao lado do texto da tarefa).
- Define efeitos de transição (`transition`) e estados como `:hover` para dar feedback visual imediato quando o usuário passa o mouse sobre botões.

### 3. `script.js` — Lógica e Interação
Este arquivo contém os conceitos mais importantes de programação web para iniciantes:

- **Seleção de Elementos (DOM)**: Métodos como `document.getElementById` e `document.querySelector` encontram elementos do HTML para que possamos manipulá-los no código.
- **Estado (State)**: A variável `tasks` é um Array de objetos. Cada tarefa é um objeto como:
  ```javascript
  {
    id: 1712345678901,
    text: "Comprar pão",
    completed: false
  }
  ```
- **Manipulação de Arrays**:
  - `tasks.unshift(...)`: Adiciona novas tarefas no topo da lista.
  - `tasks.map(...)`: Atualiza o status (`completed`) de uma tarefa específica.
  - `tasks.filter(...)`: Remove uma tarefa pelo ID ou filtra por tarefas ativas/concluídas.
- **Persistência (`localStorage`)**: Quando você adiciona, conclui ou remove tarefas, o JavaScript salva a lista no navegador (`localStorage.setItem`). Assim, suas tarefas continuam lá mesmo depois de fechar ou recarregar a página!
- **Escuta de Eventos (`addEventListener`)**: Captura as ações do usuário (clique no botão, envio do formulário com Enter, marcar checkbox).

---

##  Próximos Passos e Desafios para Praticar

Se você quiser expandir seu aprendizado, tente implementar as seguintes melhorias:

1. **Botão "Limpar Concluídas"**: Adicione um botão para remover todas as tarefas que já foram marcadas como concluídas de uma só vez.
2. **Edição de Tarefas**: Permita dar um duplo clique no texto de uma tarefa para editá-la.
3. **Data de Criação**: Mostre a data ou horário em que a tarefa foi adicionada.
4. **Categorias ou Tags**: Adicione etiquetas coloridas (ex: *Estudos*, *Trabalho*, *Pessoal*).
