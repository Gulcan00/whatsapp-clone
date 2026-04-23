require('dotenv').config({ path: '.env.local', override: false });
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initSchema } = require('./db/schema');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/friends',       require('./routes/friends'));
app.use('/api/conversations', require('./routes/conversations'));

require('./socket')(io, app);

const PORT = process.env.PORT || 3001;

initSchema()
  .then(() => server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch(err => { console.error('DB init failed:', err); process.exit(1); });
