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

SELECT * FROM produtos;
SELECT * FROM usuarios;