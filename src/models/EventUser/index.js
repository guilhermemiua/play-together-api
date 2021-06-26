const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class EventUser extends Model {
  static get tableName() {
    return 'event_users';
  }

  static get relationMappings() {
    const { User, Event } = require('../index');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'event_users.user_id',
          to: 'users.id',
        },
      },
      event: {
        relation: Model.BelongsToOneRelation,
        modelClass: Event,
        join: {
          from: 'event_users.event_id',
          to: 'events.id',
        },
      },
    };
  }
}

module.exports = EventUser;
