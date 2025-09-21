const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Database Setup
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize Database Schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone_number TEXT NOT NULL UNIQUE
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      address_details TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pin_code TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
});

// Validation Functions
const validateCustomer = (data) => {
  const { first_name, last_name, phone_number } = data;
  if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
    return 'First name is required and must be at least 2 characters';
  }
  if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
    return 'Last name is required and must be at least 2 characters';
  }
  if (!phone_number || !/^\d{10}$/.test(phone_number)) {
    return 'Phone number is required and must be a valid 10-digit number';
  }
  return null;
};

const validateAddress = (data) => {
  const { address_details, city, state, pin_code } = data;
  if (!address_details || typeof address_details !== 'string' || address_details.trim().length < 5) {
    return 'Address details are required and must be at least 5 characters';
  }
  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return 'City is required and must be at least 2 characters';
  }
  if (!state || typeof state !== 'string' || state.trim().length < 2) {
    return 'State is required and must be at least 2 characters';
  }
  if (!pin_code || !/^\d{5,6}$/.test(pin_code)) {
    return 'Pin code is required and must be a valid 5 or 6-digit code';
  }
  return null;
};

// Helper Function for Pagination and Sorting
const getPaginatedResults = (query, params, page, limit, sortBy, sortOrder) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const sortColumn = sortBy || 'id';
    const sortDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';
    const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
    
    db.get(countQuery, params, (err, countResult) => {
      if (err) return reject(err);
      
      const paginatedQuery = `
        ${query}
        ORDER BY ${sortColumn} ${sortDirection}
        LIMIT ? OFFSET ?
      `;
      db.all(paginatedQuery, [...params, limit, offset], (err, rows) => {
        if (err) return reject(err);
        resolve({
          data: rows,
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        });
      });
    });
  });
};

// Customer Routes

// POST /api/customers - Create a new customer
app.post('/api/customers', (req, res) => {
  const validationError = validateCustomer(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { first_name, last_name, phone_number } = req.body;
  db.run(
    'INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)',
    [first_name.trim(), last_name.trim(), phone_number],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }
        console.error('Error creating customer:', err.message);
        return res.status(500).json({ error: 'Failed to create customer' });
      }
      res.status(201).json({ message: 'Customer created successfully', id: this.lastID });
    }
  );
});

// GET /api/customers - Get all customers with search, sort, and pagination
app.get('/api/customers', async (req, res) => {
  const { page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc', search } = req.query;
  let query = 'SELECT * FROM customers';
  let params = [];

  if (search) {
    query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ?';
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  try {
    const results = await getPaginatedResults(query, params, parseInt(page), parseInt(limit), sortBy, sortOrder);
    res.json(results);
  } catch (err) {
    console.error('Error fetching customers:', err.message);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/customers/:id - Get a single customer
app.get('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching customer:', err.message);
      return res.status(500).json({ error: 'Failed to fetch customer' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(row);
  });
});

// PUT /api/customers/:id - Update a customer
app.put('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const validationError = validateCustomer(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { first_name, last_name, phone_number } = req.body;
  db.run(
    'UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?',
    [first_name.trim(), last_name.trim(), phone_number, id],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }
        console.error('Error updating customer:', err.message);
        return res.status(500).json({ error: 'Failed to update customer' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json({ message: 'Customer updated successfully' });
    }
  );
});

// DELETE /api/customers/:id - Delete a customer
app.delete('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  // First, delete associated addresses due to foreign key constraints
  db.run('DELETE FROM addresses WHERE customer_id = ?', [id], function (err) {
    if (err) {
      console.error('Error deleting addresses:', err.message);
      return res.status(500).json({ error: 'Failed to delete addresses' });
    }
    // Then, delete the customer
    db.run('DELETE FROM customers WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Error deleting customer:', err.message);
        return res.status(500).json({ error: 'Failed to delete customer' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json({ message: 'Customer deleted successfully' });
    });
  });
});

// Address Routes

// POST /api/customers/:id/addresses - Add a new address
app.post('/api/customers/:id/addresses', (req, res) => {
  const { id } = req.params;
  const validationError = validateAddress(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  db.get('SELECT id FROM customers WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error checking customer:', err.message);
      return res.status(500).json({ error: 'Failed to verify customer' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const { address_details, city, state, pin_code } = req.body;
    db.run(
      'INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)',
      [id, address_details.trim(), city.trim(), state.trim(), pin_code],
      function (err) {
        if (err) {
          console.error('Error creating address:', err.message);
          return res.status(500).json({ error: 'Failed to create address' });
        }
        res.status(201).json({ message: 'Address created successfully', id: this.lastID });
      }
    );
  });
});

// GET /api/customers/:id/addresses - Get all addresses for a customer
app.get('/api/customers/:id/addresses', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM addresses WHERE customer_id = ?', [id], (err, rows) => {
    if (err) {
      console.error('Error fetching addresses:', err.message);
      return res.status(500).json({ error: 'Failed to fetch addresses' });
    }
    res.json({ addresses: rows, hasOnlyOneAddress: rows.length === 1 });
  });
});

app.get('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;
  db.get('SELECT * FROM addresses WHERE id = ?', [addressId], (err, row) => {
    if (err) {
      console.error('Error fetching address:', err.message);
      return res.status(500).json({ error: 'Failed to fetch address' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json(row);
  });
});

// PUT /api/addresses/:addressId - Update an address
app.put('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;
  const validationError = validateAddress(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { address_details, city, state, pin_code } = req.body;
  db.run(
    'UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?',
    [address_details.trim(), city.trim(), state.trim(), pin_code, addressId],
    function (err) {
      if (err) {
        console.error('Error updating address:', err.message);
        return res.status(500).json({ error: 'Failed to update address' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.json({ message: 'Address updated successfully' });
    }
  );
});

// DELETE /api/addresses/:addressId - Delete an address
app.delete('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;
  db.run('DELETE FROM addresses WHERE id = ?', [addressId], function (err) {
    if (err) {
      console.error('Error deleting address:', err.message);
      return res.status(500).json({ error: 'Failed to delete address' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    res.json({ message: 'Address deleted successfully' });
  });
});

// Search by City, State, or Pin Code
app.get('/api/addresses', async (req, res) => {
  const { city, state, pin_code, page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc' } = req.query;
  let query = 'SELECT a.*, c.id as customer_id, c.first_name, c.last_name FROM addresses a JOIN customers c ON a.customer_id = c.id';
  let params = [];

  if (city || state || pin_code) {
    query += ' WHERE';
    const conditions = [];
    if (city) {
      conditions.push('a.city LIKE ?');
      params.push(`%${city}%`);
    }
    if (state) {
      conditions.push('a.state LIKE ?');
      params.push(`%${state}%`);
    }
    if (pin_code) {
      conditions.push('a.pin_code LIKE ?');
      params.push(`%${pin_code}%`);
    }
    query += ' ' + conditions.join(' AND ');
  }

  try {
    const results = await getPaginatedResults(query, params, parseInt(page), parseInt(limit), sortBy, sortOrder);
    res.json(results);
  } catch (err) {
    console.error('Error searching addresses:', err.message);
    res.status(500).json({ error: 'Failed to search addresses' });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});