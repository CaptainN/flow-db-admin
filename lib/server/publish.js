/* global AdminConfig */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { _ } from 'meteor/underscore'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { isGroupAdmin, getAdminGroup, adminCollectionObject } from '../both/utils'
import { AdminTables } from '../both/startup'

Meteor.publishComposite('adminCollectionDoc', function (collection, id) {
  var ref, ref1
  check(collection, String)
  check(id, Match.OneOf(String, Mongo.ObjectID))

  if (isGroupAdmin(this.userId)) {
    return {
      find: () => {
        const group = getAdminGroup(this.userId)
        if (group === 'super') {
          return adminCollectionObject(collection).find(id)
        } else {
          return adminCollectionObject(collection).find({ _id: id, group })
        }
      },
      children: (typeof AdminConfig !== 'undefined' && AdminConfig !== null ? (ref = AdminConfig.collections) != null ? (ref1 = ref[collection]) != null ? ref1.children : void 0 : void 0 : void 0) || []
    }
  } else {
    return this.ready()
  }
})

Meteor.publish('adminUsers', function () {
  // must be a super admin
  if (Roles.userIsInRole(this.userId, ['admin'], 'super')) {
    return Meteor.users.find()
  } else {
    return this.ready()
  }
})

Meteor.publish('adminUser', function () {
  return Meteor.users.find(this.userId)
})

Meteor.publish('adminCollectionsCount', function () {
  var handles = []
  _.each(AdminTables, (table, name) => {
    var id = new Mongo.ObjectID()
    var count = 0
    var ready = false
    const group = getAdminGroup(this.userId)
    const query = group === 'super' ? {} : { group: getAdminGroup(this.userId) }
    handles.push(table.collection.find(query).observeChanges({
      added: () => {
        count += 1
        return ready && this.changed('adminCollectionsCount', id, {
          count: count
        })
      },
      removed: () => {
        count -= 1
        return ready && this.changed('adminCollectionsCount', id, {
          count: count
        })
      }
    }))
    ready = true
    return this.added('adminCollectionsCount', id, {
      collection: name,
      count: count
    })
  })

  this.onStop(() => {
    _.each(handles, (handle) => handle.stop())
  })

  return this.ready()
})

Meteor.publish(null, function () {
  return Meteor.roles.find({})
})
