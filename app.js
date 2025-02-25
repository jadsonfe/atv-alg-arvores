class TreeNode {
  constructor(name) {
    this.name = name;
    this.columns = new BST((a, b) => a.name.localeCompare(b.name)); // Comparação por nome
    this.records = new BST((a, b) => a.id - b.id); // Comparação por ID
    this.left = null;
    this.right = null;
  }
}

class ColumnNode {
  constructor(
    name,
    type,
    allowNull,
    isPrimaryKey,
    isForeignKey,
    foreignKeyReference
  ) {
    this.name = name;
    this.type = type;
    this.allowNull = allowNull;
    this.isPrimaryKey = isPrimaryKey;
    this.isForeignKey = isForeignKey;
    this.foreignKeyReference = foreignKeyReference;
    this.left = null;
    this.right = null;
  }
}

class RecordNode {
  constructor(id, data) {
    this.id = id; // ID único para o registro
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor(compareFn) {
    this.root = null;
    this.compareFn = compareFn || ((a, b) => a.name.localeCompare(b.name)); // Função de comparação padrão
  }

  insert(node) {
    this.root = this._insertRec(this.root, node);
  }

  _insertRec(root, node) {
    if (!root) return node;
    if (this.compareFn(node, root) < 0)
      root.left = this._insertRec(root.left, node);
    else if (this.compareFn(node, root) > 0)
      root.right = this._insertRec(root.right, node);
    return root;
  }

  search(target) {
    return this._searchRec(this.root, target);
  }

  _searchRec(root, target) {
    if (!root || this.compareFn(root, target) === 0) return root;
    if (this.compareFn(target, root) < 0)
      return this._searchRec(root.left, target);
    return this._searchRec(root.right, target);
  }

  inOrder(root, callback) {
    if (!root) return;
    this.inOrder(root.left, callback);
    callback(root);
    this.inOrder(root.right, callback);
  }
}

const bst = new BST((a, b) => a.name.localeCompare(b.name)); // BST para tabelas
let recordIdCounter = 0; // Contador para gerar IDs únicos para os registros

function addTable() {
  const tableName = document.getElementById("tableName").value.trim();
  if (!tableName) return alert("Digite um nome válido para a tabela.");
  bst.insert(new TreeNode(tableName));
  document.getElementById("tableName").value = "";
  renderTables();
}

let currentTable = null; // Variável global para armazenar a tabela atual

function addColumn(tableName) {
  currentTable = bst.search({ name: tableName });
  if (!currentTable) return alert("Tabela não encontrada.");

  document.getElementById("columnModal").style.display = "block";
}

function saveColumn() {
  if (!currentTable) return alert("Nenhuma tabela selecionada.");

  const columnName = document.getElementById("columnName").value.trim();
  const columnType = document.getElementById("columnType").value.trim();
  const allowNull = document.getElementById("allowNull").checked ? true : false;
  const isPrimaryKey = document.getElementById("isPrimaryKey").checked
    ? true
    : false;
  const isForeignKey = document.getElementById("isForeignKey").checked
    ? true
    : false;

  let foreignKeyReference = "";
  if (isForeignKey === true) {
    const referencedTable = document
      .getElementById("referencedTable")
      .value.trim();
    const referencedColumn = document
      .getElementById("referencedColumn")
      .value.trim();
    if (referencedTable && referencedColumn) {
      foreignKeyReference = `FK que referencia ${referencedColumn} da tabela ${referencedTable}`;
    } else {
      return alert(
        "É necessário preencher a tabela e a coluna referenciada para FK."
      );
    }
  }

  if (!columnName || !columnType)
    return alert("Preencha todos os campos obrigatórios.");

  currentTable.columns.insert(
    new ColumnNode(
      columnName,
      columnType,
      allowNull,
      isPrimaryKey,
      isForeignKey,
      foreignKeyReference
    )
  );

  closeModal();
  renderTables(); // Atualiza a exibição das tabelas
}

function toggleForeignKey() {
  let fkFields = document.getElementById("foreignKeyFields");
  fkFields.style.display = document.getElementById("isForeignKey").checked
    ? "block"
    : "none";
}

function closeModal() {
  document.getElementById("columnModal").style.display = "none";

  // Resetar os campos do modal
  document.getElementById("columnName").value = "";
  document.getElementById("columnType").value = "";
  document.getElementById("allowNull").checked = false;
  document.getElementById("isPrimaryKey").checked = false;
  document.getElementById("isForeignKey").checked = false;
  document.getElementById("foreignKeyFields").style.display = "none";
  document.getElementById("referencedTable").value = "";
  document.getElementById("referencedColumn").value = "";
}

/* function addRecord(tableName) {
  const table = bst.search({ name: tableName });
  if (!table) return alert("Tabela não encontrada.");
  let record = {};
  table.columns.inOrder(table.columns.root, (col) => {
    const value = prompt(`Digite um valor para a coluna ${col.name}:`);
    record[col.name] = value;
  });
  recordIdCounter++; // Incrementa o contador de IDs
  table.records.insert(new RecordNode(recordIdCounter, record)); // Insere o registro com um ID único
  renderTables();
} */

function addRecord(tableName) {
  const table = bst.search({ name: tableName });
  if (!table) return alert("Tabela não encontrada.");

  currentTableName = tableName; // Armazena a tabela atual para usar no saveRecord()

  const recordInputs = document.getElementById("recordInputs");
  recordInputs.innerHTML = ""; // Limpa os inputs antes de gerar novos

  // Cria dinamicamente os campos com base nas colunas da tabela
  table.columns.inOrder(table.columns.root, (col) => {
    const inputDiv = document.createElement("div");
    inputDiv.innerHTML = `
      <label>${col.name}:</label>
      <input type="text" id="record-${col.name}" placeholder="Digite um valor">
    `;
    recordInputs.appendChild(inputDiv);
  });

  document.getElementById("recordModal").style.display = "flex"; // Abre o modal
}

function saveRecord() {
  const table = bst.search({ name: currentTableName });
  if (!table) return alert("Erro: Tabela não encontrada.");

  let record = {};
  table.columns.inOrder(table.columns.root, (col) => {
    const input = document.getElementById(`record-${col.name}`);
    record[col.name] = input.value.trim();
  });

  recordIdCounter++; // Incrementa o contador de IDs
  table.records.insert(new RecordNode(recordIdCounter, record)); // Insere o registro com um ID único

  closeRecordModal();
  renderTables();
}

function closeRecordModal() {
  document.getElementById("recordModal").style.display = "none";
}

function renderTables() {
  const tableList = document.getElementById("tableList");
  const tableTemplate = document.getElementById("tableTemplate");

  tableList.innerHTML = "";

  bst.inOrder(bst.root, (node) => {
    const tableElement = tableTemplate.content.cloneNode(true); // Clona o template

    tableElement.querySelector(".table-name").textContent = node.name; // Define o nome da tabela

    // Botões
    tableElement
      .querySelector(".add-column-btn")
      .addEventListener("click", () => addColumn(node.name));
    tableElement
      .querySelector(".add-record-btn")
      .addEventListener("click", () => addRecord(node.name));

    // Colunas
    const columnsList = tableElement.querySelector(".columns-list");
    node.columns.inOrder(node.columns.root, (col) => {
      const li = document.createElement("li");
      li.textContent = `${col.name} (${col.type}) - NULL: ${
        col.allowNull
      } | PK: ${col.isPrimaryKey} | FK: ${col.isForeignKey} ${
        col.foreignKeyReference ? `(${col.foreignKeyReference})` : ""
      }`;
      columnsList.appendChild(li);
    });

    // Registros
    const recordsList = tableElement.querySelector(".records-list");
    node.records.inOrder(node.records.root, (record) => {
      const li = document.createElement("li");
      li.textContent = Object.entries(record.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      recordsList.appendChild(li);
    });

    tableList.appendChild(tableElement); // Adiciona no DOM
  });
}
