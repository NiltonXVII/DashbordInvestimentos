const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const rotas_dashbord = require('./rotas_dashbord');
app.use('/api', rotas_dashbord);

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
