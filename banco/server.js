require('dotenv').config();
const express = require('express');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const produtosRoutes = require('./src/routes/produtos.routes');

app.use('/produtos', produtosRoutes);


const pedidosRoutes = require('./src/routes/pedidos.routes');

app.use('/pedidos', pedidosRoutes);


const clientesRoutes = require('./src/routes/clientes.routes');

app.use('/clientes', clientesRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
