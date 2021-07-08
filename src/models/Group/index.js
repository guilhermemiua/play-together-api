const { Model } = require('objection');
const knex = require('../../database/knex');

Model.knex(knex);

class Group extends Model {
  static get tableName() {
    return 'groups';
  }

  static get relationMappings() {
    const { User, GroupUser } = require('../index');

    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'groups.user_id',
          to: 'users.id',
        },
      },
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'groups.id',
          through: {
            from: 'group_users.group_id',
            to: 'group_users.user_id',
            modelClass: GroupUser,
          },
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Group;
