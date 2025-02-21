
class TreeNode {
    constructor(name) {
        this.name = name;
        this.columns = [];
        this.records = [];
        this.left = null;
        this.right = null;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    insert(name) {
        this.root = this._insertRec(this.root, name);
    }

    _insertRec(node, name) {
        if (!node) return new TreeNode(name);
        if (name < node.name) node.left = this._insertRec(node.left, name);
        else if (name > node.name) node.right = this._insertRec(node.right, name);
        return node;
    }

    delete(name) {
        this.root = this._deleteRec(this.root, name);
    }

    _deleteRec(node, name) {
        if (!node) return null;
        if (name < node.name) node.left = this._deleteRec(node.left, name);
        else if (name > node.name) node.right = this._deleteRec(node.right, name);
        else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;
            let minNode = this._minValueNode(node.right);
            node.name = minNode.name;
            node.right = this._deleteRec(node.right, minNode.name);
        }
        return node;
    }

    _minValueNode(node) {
        let current = node;
        while (current.left) current = current.left;
        return current;
    }

    search(name) {
        return this._searchRec(this.root, name);
    }

    _searchRec(node, name) {
        if (!node || node.name === name) return node;
        if (name < node.name) return this._searchRec(node.left, name);
        return this._searchRec(node.right, name);
    }

    inOrder(node, callback) {
        if (!node) return;
        this.inOrder(node.left, callback);
        callback(node);
        this.inOrder(node.right, callback);
    }
}

const bst = new BST();

function addTable() {
    const tableName = document.getElementById("tableName").value.trim();
    if (!tableName) return alert("Digite um nome válido para a tabela.");
    bst.insert(tableName);
    document.getElementById("tableName").value = "";
    renderTables();
}

function deleteTable(name) {
    bst.delete(name);
    renderTables();
}

function addColumn(tableName) {
    const table = bst.search(tableName);
    if (!table) return;
    const columnName = prompt("Nome da coluna:");
    if (!columnName) return;
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
    
    table.columns.push({ columnName, columnType, allowNull, isPrimaryKey, isForeignKey, foreignKeyReference });
    renderTables();
}

function deleteColumn(tableName, columnName) {
    const table = bst.search(tableName);
    if (!table) return;
    table.columns = table.columns.filter(col => col.columnName !== columnName);
    renderTables();
}

function addRecord(tableName) {
    const table = bst.search(tableName);
    if (!table) return;
    let record = {};
    table.columns.forEach(column => {
        const value = prompt(`Digite um valor para a coluna ${column.columnName}:`);
        record[column.columnName] = value;
    });
    table.records.push(record);
    renderTables();
}

function deleteRecord(tableName, index) {
    const table = bst.search(tableName);
    if (!table) return;
    table.records.splice(index, 1);
    renderTables();
}

function renderTables() {
    const tableList = document.getElementById("tableList");
    tableList.innerHTML = "";
    bst.inOrder(bst.root, node => {
        const div = document.createElement("div");
        div.classList.add("table-item");
        div.innerHTML = `<strong>${node.name}</strong>
            <button onclick="deleteTable('${node.name}')">Remover</button>
            <button onclick="addColumn('${node.name}')">Adicionar Coluna</button>
            <button onclick="addRecord('${node.name}')">Adicionar Registro</button>
            <ul>${node.columns.map(col => `<li>${col.columnName} (${col.columnType}) - NULL: ${col.allowNull} | PK: ${col.isPrimaryKey} | FK: ${col.isForeignKey} ${col.foreignKeyReference ? `(${col.foreignKeyReference})` : ''} <button onclick="deleteColumn('${node.name}', '${col.columnName}')">Excluir</button></li>`).join('')}</ul>
            <h4>Registros:</h4>
            <ul>${node.records.map((record, index) => `<li>${JSON.stringify(record)} <button onclick="deleteRecord('${node.name}', ${index})">Excluir</button></li>`).join('')}</ul>`;
        tableList.appendChild(div);
    });
}