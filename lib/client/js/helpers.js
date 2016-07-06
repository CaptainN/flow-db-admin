/* global AdminConfig AdminDashboard */
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import { _ } from 'meteor/underscore'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { isGroupAdmin, getAdminGroup } from '../../both/utils'
import { AdminTables } from '../../both/startup'
import { AdminCollectionsCount, Groups } from '../../both/collections'

Template.registerHelper('AdminTables', AdminTables)

const adminCollections = function () {
  var collections = {}
  if (typeof AdminConfig !== 'undefined' && typeof AdminConfig.collections === 'object') {
    collections = AdminConfig.collections
  }
  if (getAdminGroup(Meteor.userId()) === 'super') {
    AdminConfig.collections.Groups = {
      collectionObject: Groups,
      label: 'Groups',
      icon: 'users',
      tableColumns: [
        { label: 'Name', name: 'name' },
        { label: 'slug', name: 'slug' }
      ]
    }
  }
  if (getAdminGroup(Meteor.userId()) === 'super') {
    collections.Users = {
      collectionObject: Meteor.users,
      icon: 'user',
      label: 'Users'
    }
  }
  return _.map(collections, function (obj, key) {
    obj = _.extend(obj, {
      name: key
    })
    obj = _.defaults(obj, {
      label: key,
      icon: 'plus',
      color: 'blue'
    })
    obj = _.extend(obj, {
      viewPath: FlowRouter.path('/admin/view/:coll', {
        coll: key
      }),
      newPath: FlowRouter.path('/admin/new/:coll', {
        coll: key
      })
    })
    return obj
  })
}

Template.registerHelper('AdminConfig', function () {
  if (typeof AdminConfig !== 'undefined') {
    return AdminConfig
  }
})

Template.registerHelper('admin_skin', function () {
  return (typeof AdminConfig !== 'undefined' && AdminConfig !== null ? AdminConfig.skin : void 0) || 'black-light'
})

Template.registerHelper('admin_collections', adminCollections)

Template.registerHelper('admin_collection_name', function () {
  return Session.get('admin_collection_name')
})

Template.registerHelper('admin_current_id', function () {
  return Session.get('admin_id')
})

Template.registerHelper('admin_current_doc', function () {
  return Session.get('admin_doc')
})

Template.registerHelper('admin_is_users_collection', function () {
  return Session.get('admin_collection_name') === 'Users'
})

Template.registerHelper('admin_sidebar_items', function () {
  return AdminDashboard.sidebarItems
})

Template.registerHelper('admin_collection_items', function () {
  var items = []
  _.each(AdminDashboard.collectionItems, (fn) => {
    var item = fn(this.name, '/admin/' + this.name)
    if ((item != null ? item.title : void 0) && (item != null ? item.url : void 0)) {
      return items.push(item)
    }
  })
  return items
})

Template.registerHelper('admin_omit_fields', function () {
  var collection, global
  if (typeof AdminConfig.autoForm !== 'undefined' && typeof AdminConfig.autoForm.omitFields === 'object') {
    global = AdminConfig.autoForm.omitFields
  }
  if (!Session.equals('admin_collection_name', 'Users') && typeof AdminConfig !== 'undefined' && typeof AdminConfig.collections[Session.get('admin_collection_name')].omitFields === 'object') {
    collection = AdminConfig.collections[Session.get('admin_collection_name')].omitFields
  }
  if (typeof global === 'object' && typeof collection === 'object') {
    return _.union(global, collection)
  } else if (typeof global === 'object') {
    return global
  } else if (typeof collection === 'object') {
    return collection
  }
})

Template.registerHelper('AdminSchemas', function () {
  return AdminDashboard.schemas
})

Template.registerHelper('adminGetUsers', function () {
  return Meteor.users
})

Template.registerHelper('adminGetUserSchema', function () {
  var schema
  if (_.has(AdminConfig, 'userSchema')) {
    schema = AdminConfig.userSchema
  } else if (typeof Meteor.users._c2 === 'object') {
    schema = Meteor.users.simpleSchema()
  }
  return schema
})

Template.registerHelper('adminCollectionLabel', function (collection) {
  if (collection != null) {
    return AdminDashboard.collectionLabel(collection)
  }
})

Template.registerHelper('adminCollectionCount', function (collection) {
  var ref
  if (collection === 'Users') {
    return Meteor.users.find().count()
  } else if (collection === 'Groups') {
    return Groups.find().count()
  } else {
    return (ref = AdminCollectionsCount.findOne({
      collection: collection
    })) != null ? ref.count : void 0
  }
})

Template.registerHelper('adminTemplate', function (collection, mode) {
  var ref, ref1
  if ((collection != null ? collection.toLowerCase() : void 0) !== 'users' && typeof (typeof AdminConfig !== 'undefined' && AdminConfig !== null ? (ref = AdminConfig.collections) != null ? (ref1 = ref[collection]) != null ? ref1.templates : void 0 : void 0 : void 0) !== 'undefined') {
    return AdminConfig.collections[collection].templates[mode]
  }
})

Template.registerHelper('adminGetCollection', function (collection) {
  return _.find(adminCollections(), function (item) {
    return item.name === collection
  })
})

Template.registerHelper('adminWidgets', function () {
  if (typeof AdminConfig.dashboard !== 'undefined' && typeof AdminConfig.dashboard.widgets !== 'undefined') {
    return AdminConfig.dashboard.widgets
  }
})

Template.registerHelper('adminViewPath', function (collection) {
  return FlowRouter.path('/admin/view/:coll', {
    coll: collection
  })
})

Template.registerHelper('adminNewPath', function (collection) {
  return FlowRouter.path('/admin/new/:coll', {
    coll: collection
  })
})

Template.registerHelper('AdminDashboardPath', function () {
  return FlowRouter.path('AdminDashboard')
})

Template.registerHelper('isSubReady', function (sub) {
  if (sub) {
    return FlowRouter.subsReady(sub)
  } else {
    return FlowRouter.subsReady()
  }
})

Template.registerHelper('isGroupAdmin', function () {
  return isGroupAdmin(Meteor.userId())
})
