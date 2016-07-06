/* global AdminConfig AdminDashboard */
import {Meteor} from 'meteor/meteor'
import {Session} from 'meteor/session'
import {Router} from 'meteor/kadira:flow-router'
import {_} from 'meteor/underscore'
import {SimpleSchema} from 'meteor/aldeed:simple-schema'
import {isGroupAdmin} from '../both/utils'
import {Groups, GroupSchema} from './collections'

AdminDashboard = { // eslint-disable-line
  schemas: {},
  sidebarItems: [],
  collectionItems: [],
  alertSuccess (message) {
    Session.set('adminError', null)
    return Session.set('adminSuccess', message)
  },
  alertFailure (message) {
    Session.set('adminSuccess', null)
    return Session.set('adminError', message)
  },
  checkAdmin () {
    if (isGroupAdmin(Meteor.userId())) {
      Meteor.call('adminCheckAdmin')
      if (typeof (typeof AdminConfig !== 'undefined' && AdminConfig !== null ? AdminConfig.nonAdminRedirectRoute : void 0) === 'string') {
        Router.go(AdminConfig.nonAdminRedirectRoute)
      }
    }
    if (typeof this.next === 'function') {
      return this.next()
    }
  },
  adminRoutes: ['adminDashboard', 'adminDashboardUsersNew', 'adminDashboardUsersEdit', 'adminDashboardView', 'adminDashboardNew', 'adminDashboardEdit'],
  collectionLabel (collection) {
    if (collection === 'Users') {
      return 'Users'
    } else if ((collection != null) && typeof AdminConfig.collections[collection].label === 'string') {
      return AdminConfig.collections[collection].label
    } else {
      return Session.get('admin_collection_name')
    }
  },
  addSidebarItem (title, url, options) {
    var item
    item = {
      title: title
    }
    if (_.isObject(url) && typeof options === 'undefined') {
      item.options = url
    } else {
      item.url = url
      item.options = options
    }
    return this.sidebarItems.push(item)
  },
  extendSidebarItem (title, urls) {
    var existing
    if (_.isObject(urls)) {
      urls = [urls]
    }
    existing = _.find(this.sidebarItems, function (item) {
      return item.title === title
    })
    if (existing) {
      existing.options.urls = _.union(existing.options.urls, urls)
    }
    return existing
  },
  addCollectionItem (fn) {
    return this.collectionItems.push(fn)
  },
  path (s) {
    var path
    path = '/admin'
    if (typeof s === 'string' && s.length > 0) {
      path += (s[0] === '/' ? '' : '/') + s
    }
    return path
  }
}

AdminDashboard.schemas.newUser = new SimpleSchema({
  email: {
    type: String,
    label: 'Email address'
  },
  chooseOwnPassword: {
    type: Boolean,
    label: 'Let this user choose their own password with an email',
    defaultValue: true
  },
  password: {
    type: String,
    label: 'Password',
    optional: true
  },
  sendPassword: {
    type: Boolean,
    label: 'Send this user their password by email',
    optional: true
  }
})

AdminDashboard.schemas.sendResetPasswordEmail = new SimpleSchema({
  _id: {
    type: String
  }
})

AdminDashboard.schemas.changePassword = new SimpleSchema({
  _id: {
    type: String
  },
  password: {
    type: String
  }
})

AdminDashboard.schemas.GroupSchema = GroupSchema

AdminDashboard.Groups = Groups
