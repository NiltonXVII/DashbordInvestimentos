const express = require('express');
const router = express.Router();
const pool = require('./db');

// SALVAR
router.post('/investimentos', async (req, res) => {
    const {tipo_investimento, valor_investimento, data_investimento} = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO dashbord_investimentos.investimentos (tipo_investimento, valor_investimento, data_investimento)
             VALUES ($1, $2, $3) RETURNING *`,
            [tipo_investimento, valor_investimento, data_investimento]
        );

        res.status(201).json({
            mensagem: 'Investimento salvo com sucesso!',
            investimento: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({error: 'Erro ao salvar investimento.'});
    }
});

// BUSCAR TODOS
router.get('/investimentos', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM dashbord_investimentos.investimentos ORDER BY data_investimento DESC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar investimentos.'});
    }
});

// BUSCAR POR ID
router.get('/investimentos/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM dashbord_investimentos.investimentos WHERE id_investimento = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({mensagem: 'Investimento não encontrado.'});
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar investimento.'});
    }
});

// BUSCAR POR TIPO
router.get('/investimentos/tipo/:tipo', async (req, res) => {
    const {tipo} = req.params;

    try {
        const result = await pool.query(
            `SELECT *
             FROM dashbord_investimentos.investimentos
             WHERE tipo_investimento ILIKE $1
             ORDER BY data_investimento DESC`,
            [`%${tipo}%`]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({error: 'Erro ao buscar por tipo de investimento.'});
    }
});

// ATUALIZAR
router.put('/investimentos/:id', async (req, res) => {
    const {id} = req.params;
    const {tipo_investimento, valor_investimento, data_investimento} = req.body;

    try {
        const result = await pool.query(
            `UPDATE dashbord_investimentos.investimentos
             SET tipo_investimento  = $1,
                 valor_investimento = $2,
                 data_investimento  = $3,
                 atualizado_em      = CURRENT_TIMESTAMP
             WHERE id_investimento = $4 RETURNING *`,
            [tipo_investimento, valor_investimento, data_investimento, id]
        );

        res.json({
            mensagem: 'Investimento alterado com sucesso!',
            investimento: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({error: 'Erro ao alterar investimento.'});
    }
});

// EXCLUIR
router.delete('/investimentos/:id', async (req, res) => {
    const {id} = req.params;

    try {
        await pool.query(
            'DELETE FROM dashbord_investimentos.investimentos WHERE id_investimento = $1',
            [id]
        );

        res.status(200).json({mensagem: 'Investimento excluído com sucesso!'});
    } catch (err) {
        res.status(500).json({error: 'Erro ao excluir investimento.'});
    }
});

module.exports = router;
