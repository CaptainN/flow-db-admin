/* global adminCollectionObject AdminConfig AdminTables */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { _ } from 'meteor/underscore'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'

Meteor.publishComposite('adminCollectionDoc', function (collection, id) {
  var ref, ref1
  check(collection, String)
  check(id, Match.OneOf(String, Mongo.ObjectID))
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    return {
      find: function () {
        return adminCollectionObject(collection).find(id)
      },
      children: (typeof AdminConfig !== 'undefined' && AdminConfig !== null ? (ref = AdminConfig.collections) != null ? (ref1 = ref[collection]) != null ? ref1.children : void 0 : void 0 : void 0) || []
    }
  } else {
    return this.ready()
  }
})

Meteor.publish('adminUsers', function () {
  if (Roles.userIsInRole(this.userId, ['admin'])) {
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
    var count, id, ready
    id = new Mongo.ObjectID()
    count = 0
    ready = false
    handles.push(table.collection.find().observeChanges({
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
