var express = require('express');
var app = express();
var mysql2 = require('mysql2');
var multer = require('multer');
var cors = require('cors');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Oi@2025';

app.use(express.static('./pages'));
app.use(express.json());
app.use(cors());

const port = 3000;
const router = express.Router();

var con = mysql2.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "PUC@1234",
    database: "gbcSports"
});

con.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the database!");
});

router.get("/api/usuarios", authenticateToken, (request, response) => {
    const sql = 'SELECT id, nome, email, endereco, cidade, estado, data_nascimento, cpf FROM usuarios';
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
    // Adicione data_nascimento e cpf aqui:
    const { nome, email, senha, endereco, cidade, estado, data_nascimento, cpf } = request.body;
    const sql = 'UPDATE usuarios SET nome = ?, email = ?, senha = ?, endereco = ?, cidade = ?, estado = ?, data_nascimento = ?, cpf = ? WHERE id = ?';
    con.query(sql, [nome, email, senha, endereco, cidade, estado, data_nascimento, cpf, id], function (err, result) {
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
    const sql = 'SELECT id, nome, email, senha, endereco, cidade, estado, data_nascimento, cpf FROM usuarios WHERE id = ?';
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
    const { email, senha } = request.body;
    const sql = `SELECT id, email FROM usuarios WHERE email = ? AND senha = ?`;
    con.query(sql, [email, senha], function (err, result) {
        if (err) {
            console.error("Erro ao fazer login:", err);
            return response.status(500).json({ error: "Erro interno do servidor." });
        }
        if (result.length > 0) {
            // Gera o token JWT
            const user = result[0];
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
            response.status(200).json({ token, id: user.id, email: user.email });
        } else {
            response.status(401).json({ error: "E-mail ou senha inválidos." });
        }
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

router.post("/api/produtos", upload.single('imagem'), (req, res) => {
    const { nome, preco, ano, ativo, genero, categorias } = req.body;
    const imagem = req.file ? req.file.buffer : null;

    const sql = `INSERT INTO produtos (nome, preco, ano, ativo, imagem, genero) VALUES (?, ?, ?, ?, ?, ?)`;
    con.query(sql, [nome, preco, ano, ativo === 'true', imagem, genero], function (err, result) {
        if (err) return res.status(500).json({ error: err.message });
        const produtoId = result.insertId;

        // Relacionar categorias
        let cats = [];
        try { cats = JSON.parse(categorias); } catch {}
        if (Array.isArray(cats) && cats.length > 0) {
            const values = cats.map(catId => [produtoId, catId]);
            con.query('INSERT INTO produto_categorias (produto_id, categoria_id) VALUES ?', [values], (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.status(201).json({ id: produtoId });
            });
        } else {
            res.status(201).json({ id: produtoId });
        }
    });
});

// Exemplo de endpoint para listar produtos com categorias
router.get("/api/produtos", authenticateToken, (req, res) => {
  const sql = `
    SELECT p.id, p.nome, p.preco, p.ano, p.ativo, p.genero,
      GROUP_CONCAT(pc.categoria_id) AS categorias
    FROM produtos p
    LEFT JOIN produto_categorias pc ON p.id = pc.produto_id
    GROUP BY p.id
  `;
  con.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    // Transforme categorias em array de números
    const produtos = result.map(prod => ({
      ...prod,
      categorias: prod.categorias
        ? prod.categorias.split(',').map(Number)
        : [],
    }));
    res.status(200).json(produtos);
  });
});

router.get("/api/produtos/:id", (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT id, nome, preco, ano, ativo, imagem, genero FROM produtos WHERE id = ?';
    con.query(sql, [id], function (err, result) {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: "Produto não encontrado!" });
        const produto = result[0];
        if (produto.imagem) produto.imagem = produto.imagem.toString('base64');

        // Buscar categorias
        con.query('SELECT categoria_id FROM produto_categorias WHERE produto_id = ?', [id], (err2, cats) => {
            if (err2) return res.status(500).json({ error: err2.message });
            produto.categorias = cats.map(c => c.categoria_id);
            res.status(200).json(produto);
        });
    });
});

router.put("/api/produtos/:id", (req, res) => {
    const { id } = req.params;
    const { nome, preco, ano, ativo, genero, categorias } = req.body;
    const sql = 'UPDATE produtos SET nome = ?, preco = ?, ano = ?, ativo = ?, genero = ? WHERE id = ?';
    con.query(sql, [nome, preco, ano, ativo, genero, id], function (err, result) {
        if (err) return res.status(500).json({ error: err.message });

        // Atualizar categorias
        let cats = [];
        try { cats = JSON.parse(categorias); } catch {}
        con.query('DELETE FROM produto_categorias WHERE produto_id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            if (Array.isArray(cats) && cats.length > 0) {
                const values = cats.map(catId => [id, catId]);
                con.query('INSERT INTO produto_categorias (produto_id, categoria_id) VALUES ?', [values], (err3) => {
                    if (err3) return res.status(500).json({ error: err3.message });
                    res.status(200).json({ message: "Produto atualizado com sucesso!" });
                });
            } else {
                res.status(200).json({ message: "Produto atualizado com sucesso!" });
            }
        });
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

// Listar categorias
router.get("/api/categorias", authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM categorias';
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(result);
    });
});

// Criar categoria
router.post("/api/categorias", (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });
    const sql = 'INSERT INTO categorias (nome) VALUES (?)';
    con.query(sql, [nome], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, nome });
    });
});

// Atualizar categoria
router.put("/api/categorias/:id", (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    const sql = 'UPDATE categorias SET nome = ? WHERE id = ?';
    con.query(sql, [nome, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Categoria atualizada com sucesso!" });
    });
});

// Deletar categoria
router.delete("/api/categorias/:id", (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM categorias WHERE id = ?';
    con.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(204).send();
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
}

app.use(router);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});