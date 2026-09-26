import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/hello', (_req, res) => {
  res.send('Olá, mundo!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
