/* global AdminConfig */
import {Meteor} from 'meteor/meteor'
import {Mongo} from 'meteor/mongo'
import {_} from 'meteor/underscore'
import {Roles} from 'meteor/alanning:roles'

export function adminCollectionObject (collection) {
  if (typeof AdminConfig.collections[collection] !== 'undefined' && typeof AdminConfig.collections[collection].collectionObject !== 'undefined') {
    return AdminConfig.collections[collection].collectionObject
  } else {
    return lookup(collection)
  }
}

export function adminCallback (name, args, callback) {
  var ref1, ref2, stop
  stop = false
  if (typeof (typeof AdminConfig !== 'undefined' && AdminConfig !== null ? (ref1 = AdminConfig.callbacks) != null ? ref1[name] : void 0 : void 0) === 'function') {
    stop = (ref2 = AdminConfig.callbacks)[name].apply(ref2, args) === false
  }
  if (typeof callback === 'function') {
    if (!stop) {
      return callback.apply(null, args)
    }
  }
}

export function lookup (obj, root, required) {
  var arr, ref
  if (required == null) {
    required = true
  }
  if (typeof root === 'undefined') {
    root = Meteor.isServer ? global : window
  }
  if (typeof obj === 'string') {
    ref = root
    arr = obj.split('.')
    while (arr.length && (ref = ref[arr.shift()])) {
      continue
    }
    if (!ref && required) {
      throw new Error(obj + ' is not in the ' + root.toString())
    } else {
      return ref
    }
  }
  return obj
}

export function parseID (id) {
  if (typeof id === 'string') {
    if (id.indexOf('ObjectID') > -1) {
      return new Mongo.ObjectID(id.slice(id.indexOf('"') + 1, id.lastIndexOf('"')))
    } else {
      return id
    }
  } else {
    return id
  }
}

export function parseIDs (ids) {
  return _.map(ids, function (id) {
    return parseID(id)
  })
}

export function isGroupAdmin (userId, group = getAdminGroup(userId)) {
  return group && Roles.userIsInRole(userId, ['admin'], group)
}
export function getAdminGroup (userId) {
  const groups = Roles.getGroupsForUser(userId, 'admin')
  return groups.length > 0 && groups[0]
}
