const express = require('express');
const cors = require('cors');

const authenticatedRoutes = require('../routes/authenticated');
const unauthenticatedRoutes = require('../routes/unauthenticated');
const authMiddleware = require('../middlewares/auth');

class App {
  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.express.use(
      express.json({
        limit: '10mb',
      })
    );
    this.express.use(cors());
  }

  routes() {
    this.express.use(unauthenticatedRoutes);
    this.express.use(authMiddleware);
    this.express.use(authenticatedRoutes);
  }
}

module.exports = new App().express;
