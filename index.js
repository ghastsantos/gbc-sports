var express = require('express');
var app = express();
var mysql = require('mysql');
var multer = require('multer');
const nodemailer = require('nodemailer');

var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

app.use(express.static('./pages'));
app.use(express.json());

const port = 3000;
const router = express.Router();
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: 'gasesb26@gmail.com',
        pass: 'sua-senha'
    }
});

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

router.get("/api/usuarios", (request, response) => {
    const sql = 'SELECT id, nome, email, endereco, cidade FROM usuarios';
    con.query(sql, function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        response.status(200).json(result);
    });
});

router.post("/api/usuarios/verificar", (request, response) => {
    const { email, cpf } = request.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ? OR cpf = ?';
    con.query(sql, [email, cpf], function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        if (result.length > 0) {
            response.status(200).json({ exists: true });
        } else {
            response.status(200).json({ exists: false });
        }
    });
});

router.post("/api/usuarios", (request, response) => {
    const { nome, email, senha, endereco, cidade, estado, data_nascimento, cpf } = request.body;

    if (!email || !senha || !cpf) {
        return response.status(400).json({ error: "Email, senha e CPF são obrigatórios!" });
    }

    const sql = `
        INSERT INTO usuarios (nome, email, senha, endereco, cidade, estado, data_nascimento, cpf, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)
    `;

    const values = [nome, email, senha, endereco, cidade, estado, data_nascimento, cpf];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error("Erro ao inserir usuário:", err);
            return response.status(500).json({ error: err.message });
        }
        response.status(201).json({
            message: "Usuário cadastrado com sucesso!",
            id: result.insertId,
        });
    });
});

router.put("/api/usuarios/:id", (request, response) => {
    const { id } = request.params;
    const { nome, email, senha, endereco, cidade, estado } = request.body;
    const sql = 'UPDATE usuarios SET nome = ?, email = ?, senha = ?, endereco = ?, cidade = ?, estado = ? WHERE id = ?';
    con.query(sql, [nome, email, senha, endereco, cidade, estado, id], function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        response.status(200).json({ message: "Usuário atualizado com sucesso!" });
    });
});

router.get("/api/usuarios/:id", (request, response) => {
    const { id } = request.params;
    const sql = 'SELECT id, nome, email, senha, endereco, cidade, estado FROM usuarios WHERE id = ?';
    con.query(sql, [id], function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        if (result.length === 0) {
            return response.status(404).json({ error: "Usuário não encontrado!" });
        }
        response.status(200).json(result[0]);
    });
});

router.delete("/api/usuarios/:id", (request, response) => {
    const { id } = request.params;

    const sql = `DELETE FROM usuarios WHERE id = ?`;

    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao deletar usuário:", err);
            return response.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return response.status(404).json({ error: "Usuário não encontrado!" });
        }

        response.status(200).json({ message: "Usuário deletado com sucesso!" });
    });
});



router.post("/api/login", (request, response) => {
    const usuario = request.body;
    const email = usuario.email;
    const senha = usuario.senha;

    const sql = `select id, email from usuarios where email = '${email}' and senha = '${senha}'`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
        response.status(200).json(result);
    }); 
});

router.post("/api/cadastrese", async (request, response) => {
    const { nome, email, senha, confirmarsenha, endereco, cidade, estado, data_nascimento, cpf } = request.body;

    if (senha !== confirmarsenha) {
        return response.status(400).json({ error: "Senha e Confirmar Senha devem ser iguais." });
    }

    const sql = `
        INSERT INTO usuarios (nome, email, senha, confirmarsenha, endereco, cidade, estado, data_nascimento, cpf, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `;

    const values = [nome, email, senha, confirmarsenha, endereco, cidade, estado, data_nascimento, cpf];

    con.query(sql, values, (err, result) => {
        if (err) {
            console.error("Erro ao inserir usuário:", err);
            return response.status(500).json({ error: err.message });
        }
        response.status(201).json({
            message: "Usuário cadastrado com sucesso!",
            id: result.insertId,
        });
    });
});

router.post("/api/produtos", upload.single('imagem'), (request, response) => {
    const produto = {
        nome: request.body.nome,
        preco: request.body.preco,
        ano: request.body.ano,
        ativo: request.body.ativo === 'true', 
        imagem: request.file ? request.file.buffer : null,
        tipo: request.body.tipo,
        genero: request.body.genero
    };

    console.log("Produto recebido:", produto);

    const sql = `INSERT INTO produtos (nome, preco, ano, ativo, imagem, tipo, genero) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    con.query(sql, [produto.nome, produto.preco, produto.ano, produto.ativo, produto.imagem, produto.tipo, produto.genero], function (err, result) {
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
    const sql = 'SELECT id, nome, preco, ano, ativo, imagem, tipo, genero FROM produtos';
    con.query(sql, function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        result.forEach(produto => {
            if (produto.imagem) {
                produto.imagem = produto.imagem.toString('base64');
            }
        });
        response.status(200).json(result);
    });
});

router.get("/api/produtos/:id", (request, response) => {
    const { id } = request.params;
    const sql = 'SELECT id, nome, preco, ano, ativo, imagem, tipo, genero FROM produtos WHERE id = ?';
    con.query(sql, [id], function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        if (result.length === 0) {
            return response.status(404).json({ error: "Produto não encontrado!" });
        }
        const produto = result[0];
        if (produto.imagem) {
            produto.imagem = produto.imagem.toString('base64');
        }
        response.status(200).json(produto);
    });
});

router.put("/api/produtos/:id", (request, response) => {
    const { id } = request.params;
    const { nome, preco, ano, ativo, tipo, genero } = request.body;

    const sql = 'UPDATE produtos SET nome = ?, preco = ?, ano = ?, ativo = ?, tipo = ?, genero = ? WHERE id = ?';

    con.query(sql, [nome, preco, ano, ativo, tipo, genero, id], function (err, result) {
        if (err) {
            console.error("Error executing query:", err);
            response.status(500).json({ error: err.message });
            return;
        }
        response.status(200).json({ message: "Produto atualizado com sucesso!" });
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