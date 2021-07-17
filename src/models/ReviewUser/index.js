const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class ReviewUser extends Model {
  static get tableName() {
    return 'review_users';
  }

  static get relationMappings() {
    const { User, Event } = require('../index');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'review_users.user_id',
          to: 'users.id',
        },
      },
      user_reviewed: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'review_users.user_reviewed_id',
          to: 'users.id',
        },
      },
      event: {
        relation: Model.BelongsToOneRelation,
        modelClass: Event,
        join: {
          from: 'review_users.event_id',
          to: 'events.id',
        },
      },
    };
  }
}

module.exports = ReviewUser;
