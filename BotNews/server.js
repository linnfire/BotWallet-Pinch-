const app = require('./app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`bot News publisher running at http://localhost:${PORT}`);
});
