const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class Friend extends Model {
  static get tableName() {
    return 'friends';
  }

  static get relationMappings() {
    const { User } = require('../index');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'friends.user_id',
          to: 'users.id',
        },
      },
      friend: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'friends.friend_id',
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Friend;
