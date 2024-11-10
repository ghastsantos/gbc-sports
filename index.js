var express = require('express');
var app = express();
var mysql = require('mysql');
var multer = require('multer');
var path = require('path');

// Configuração do multer para processar o upload de arquivos
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

app.use(express.static('./pages'));
app.use(express.json());

const port = 3000;
const router = express.Router();

var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "Ga$t@26062006",
    database: "gbcSports"
});

con.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the database!");
});

router.post("/api/produtos", upload.single('imagem'), (request, response) => {
    const produto = {
        nome: request.body.nome,
        preco: request.body.preco,
        ano: request.body.ano,
        ativo: request.body.ativo === 'true', // Convertendo string para boolean
        imagem: request.file ? request.file.buffer : null // Buffer do arquivo
    };

    console.log("Produto recebido:", produto);

    const sql = `INSERT INTO produtos (nome, preco, ano, ativo, imagem) VALUES (?, ?, ?, ?, ?)`;
    con.query(sql, [produto.nome, produto.preco, produto.ano, produto.ativo, produto.imagem], function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        produto.id = result.insertId;
        response.status(201).json(produto);
    });
});

router.get("/api/produtos", (request, response) => {
    const sql = 'SELECT id, nome, preco, ano, ativo, imagem FROM produtos';
    con.query(sql, function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        // Converte o buffer da imagem para base64
        result.forEach(produto => {
            if (produto.imagem) {
                produto.imagem = produto.imagem.toString('base64');
            }
        });
        response.status(200).json(result);
    });
});

router.delete("/api/produtos/:id", (request, response) => {
    const id = request.params.id;
    const sql = `DELETE FROM produtos WHERE id = ?`;
    con.query(sql, [id], function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        response.status(204).send();
    });
});

app.use(router);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});