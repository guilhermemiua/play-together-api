const app = require('../app');
const { getEnvPath } = require('../helpers');
require('dotenv').config({
  path: getEnvPath(),
});

app.listen(process.env.PORT || 3333, () => {
  console.log(`Server is listening on port: ${process.env.PORT || 3333}`);
});
