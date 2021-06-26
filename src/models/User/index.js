const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get relationMappings() {
    const { City, State, EventUser, Event } = require('../index');

    return {
      city: {
        relation: Model.BelongsToOneRelation,
        modelClass: City,
        join: {
          from: 'users.city_id',
          to: 'cities.id',
        },
      },
      state: {
        relation: Model.BelongsToOneRelation,
        modelClass: State,
        join: {
          from: 'users.state_id',
          to: 'states.id',
        },
      },
      events: {
        relation: Model.ManyToManyRelation,
        modelClass: Event,
        join: {
          from: 'users.id',
          through: {
            from: 'event_users.user_id',
            to: 'event_users.event_id',
            modelClass: EventUser,
          },
          to: 'events.id',
        },
      },
    };
  }
}

module.exports = User;
