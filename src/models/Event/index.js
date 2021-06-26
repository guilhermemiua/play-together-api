const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class Event extends Model {
  static get tableName() {
    return 'events';
  }

  static get relationMappings() {
    const { User, City, State, EventUser } = require('../index');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'events.user_id',
          to: 'users.id',
        },
      },
      city: {
        relation: Model.BelongsToOneRelation,
        modelClass: City,
        join: {
          from: 'events.city_id',
          to: 'cities.id',
        },
      },
      state: {
        relation: Model.BelongsToOneRelation,
        modelClass: State,
        join: {
          from: 'events.state_id',
          to: 'states.id',
        },
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'events.id',
          through: {
            from: 'event_users.event_id',
            to: 'event_users.user_id',
            modelClass: EventUser,
          },
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Event;
