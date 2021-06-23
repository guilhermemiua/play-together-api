const { Model } = require('objection');

const knex = require('../../database/knex');

Model.knex(knex);

class State extends Model {
  static get tableName() {
    return 'states';
  }
}

module.exports = State;
