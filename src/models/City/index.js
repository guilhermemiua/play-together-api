const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class City extends Model {
  static get tableName() {
    return 'cities';
  }
}

module.exports = City;
