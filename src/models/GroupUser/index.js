const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class GroupUser extends Model {
  static get tableName() {
    return 'group_users';
  }

  static get relationMappings() {
    const { User, Group } = require('../index');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'group_users.user_id',
          to: 'users.id',
        },
      },
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'group_users.group_id',
          to: 'groups.id',
        },
      },
    };
  }
}

module.exports = GroupUser;
