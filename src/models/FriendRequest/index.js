const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class FriendRequest extends Model {
  static get tableName() {
    return 'friend_requests';
  }

  static get relationMappings() {
    const { User } = require('../index');

    return {
      sender: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'friend_requests.sender_id',
          to: 'users.id',
        },
      },
      receiver: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'friend_requests.receiver_id',
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = FriendRequest;
