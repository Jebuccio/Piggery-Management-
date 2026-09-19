import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/piggery_db',
});

// --- SOW CRUD ENDPOINTS ---
app.get('/api/sows', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sows ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sows', async (req, res) => {
  const { sow_id, name, tag_number, status, notes } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO sows (sow_id, name, tag_number, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sow_id, name, tag_number, status || 'Healthy', notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sows/:id', async (req, res) => {
  const { id } = req.params;
  const { name, status, notes } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE sows SET name = COALESCE($1, name), status = COALESCE($2, status), notes = COALESCE($3, notes) WHERE id = $4 RETURNING *',
      [name, status, notes, id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sows/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM sows WHERE id = $1', [id]);
    res.json({ message: 'Sow deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SELLER PORTAL ENDPOINTS ---
app.get('/api/seller/inventory', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM store_inventory ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/seller/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { in_stock } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE store_inventory SET in_stock = $1 WHERE id = $2 RETURNING *',
      [in_stock, id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/seller/customers', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM store_customers ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Piggery API Server running on port ${PORT}`));