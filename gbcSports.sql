DROP DATABASE IF EXISTS gbcSports;
CREATE DATABASE gbcSports;
USE gbcSports;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    confirmarsenha VARCHAR(255) DEFAULT NULL,
    ativo BOOLEAN DEFAULT FALSE,
    endereco VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    cpf CHAR(11)
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    ano INT NOT NULL,
    ativo BOOLEAN NOT NULL,
    imagem LONGBLOB,
    tipo ENUM('camisa', 'regata', 'casaco') NOT NULL,
    genero ENUM('masculino', 'feminino') NOT NULL
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE produto_categorias (
    produto_id INT,
    categoria_id INT,
    PRIMARY KEY (produto_id, categoria_id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

ALTER TABLE produtos DROP COLUMN tipo;

INSERT INTO categorias (nome) VALUES ('Camisas'), ('Regatas'), ('Casacos');

SELECT * FROM produtos;
SELECT * FROM usuarios;
SELECT * FROM categorias;

SELECT * FROM produto_categorias WHERE categoria_id = 1;