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

function addColumn(tableName) {
  const table = bst.search({ name: tableName }); // Busca a tabela pelo nome
  if (!table) return alert("Tabela não encontrada.");
  const columnName = prompt("Nome da coluna:");
  if (!columnName) return alert("Nome da coluna inválido.");
  const columnType = prompt("Tipo da coluna:");
  const allowNull = confirm("Permitir NULL?") ? "SIM" : "NÃO";
  const isPrimaryKey = confirm("É chave primária?") ? "SIM" : "NÃO";
  let isForeignKey = confirm("É chave estrangeira?") ? "SIM" : "NÃO";
  let foreignKeyReference = "";
  if (isForeignKey === "SIM") {
    const referencedTable = prompt("Qual tabela será referenciada?");
    const referencedColumn = prompt("Qual coluna será referenciada?");
    if (referencedTable && referencedColumn) {
      foreignKeyReference = `FK que referencia ${referencedColumn} da tabela ${referencedTable}`;
    }
  }
  table.columns.insert(
    new ColumnNode(
      columnName,
      columnType,
      allowNull,
      isPrimaryKey,
      isForeignKey,
      foreignKeyReference
    )
  );
  renderTables();
}

function addRecord(tableName) {
  const table = bst.search({ name: tableName }); // Busca a tabela pelo nome
  if (!table) return alert("Tabela não encontrada.");
  let record = {};
  table.columns.inOrder(table.columns.root, (col) => {
    const value = prompt(`Digite um valor para a coluna ${col.name}:`);
    record[col.name] = value;
  });
  recordIdCounter++; // Incrementa o contador de IDs
  table.records.insert(new RecordNode(recordIdCounter, record)); // Insere o registro com um ID único
  renderTables();
}

function renderTables() {
  const tableList = document.getElementById("tableList");
  tableList.innerHTML = "";
  bst.inOrder(bst.root, (node) => {
    const div = document.createElement("div");
    div.classList.add("table-item");
    let columnsHtml = "";
    node.columns.inOrder(node.columns.root, (col) => {
      columnsHtml += `<li>${col.name} (${col.type}) - NULL: ${
        col.allowNull
      } | PK: ${col.isPrimaryKey} | FK: ${col.isForeignKey} ${
        col.foreignKeyReference ? `(${col.foreignKeyReference})` : ""
      }</li>`;
    });
    let recordsHtml = "";
    node.records.inOrder(node.records.root, (record) => {
      let recordData = Object.entries(record.data)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      recordsHtml += `<li>${recordData}</li>`;
    });
    div.innerHTML = `<strong>${node.name}</strong>
            <button onclick="addColumn('${node.name}')">Adicionar Coluna</button>
            <button onclick="addRecord('${node.name}')">Adicionar Registro</button>
            <h4>Colunas:</h4>
            <ul>${columnsHtml}</ul>
            <h4>Registros:</h4>
            <ul>${recordsHtml}</ul>`;
    tableList.appendChild(div);
  });
}
