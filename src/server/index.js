const path = require('path');
const app = require('../app');

require('dotenv').config({
  path:
    process.env.NODE_ENV === 'test'
      ? path.join(__dirname, '../../.env.test')
      : path.join(__dirname, '../../.env'),
});

app.listen(process.env.PORT || 3333, () => {
  console.log(`Server is listening on port: ${process.env.PORT || 3333}`);
});
