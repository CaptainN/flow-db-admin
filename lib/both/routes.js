import {Meteor} from 'meteor/meteor'
import {FlowRouter} from 'meteor/kadira:flow-router'
import {Session} from 'meteor/session'
import {BlazeLayout} from 'meteor/kadira:blaze-layout'
import {isGroupAdmin, parseID} from './utils'

var fadminRoutes = FlowRouter.group({
  name: 'AdminController',
  prefix: '/admin',
  subscriptions () {
    this.register('fadminUsers', Meteor.subscribe('adminUsers'))
    this.register('fadminUser', Meteor.subscribe('adminUser'))
    this.register('fadminCollectionsCount', Meteor.subscribe('adminCollectionsCount'))
    this.register('fadminGroups', Meteor.subscribe('adminGroups'))
  },
  triggersEnter: [
    function (context) {
      if (!isGroupAdmin(Meteor.userId())) {
        Meteor.call('adminCheckAdmin')
      // if (typeof AdminConfig.nonAdminRedirectRoute == 'string')
      //  FlowRouter.go(AdminController.nonAdminRedirectRoute)
      }
    },
    function (context) {
      Session.set('adminSuccess', null)
      Session.set('adminError', null)
      Session.set('admin_title', null)
      Session.set('admin_subtitle', null)
      Session.set('admin_collection_name', null)
      Session.set('admin_collection_page', null)
      Session.set('admin_id', null)
      Session.set('admin_doc', null)
    }
  ]
})

fadminRoutes.route('/', {
  name: 'adminDashboard',
  triggersEnter: [
    function (context) {
      Session.set('admin_title', 'Dashboard')
      Session.set('admin_collection_name', '')
      Session.set('admin_collection_page', '')
    }
  ],
  action () {
    BlazeLayout.render('fAdminLayout', {main: 'AdminDashboard'})
  }
})

fadminRoutes.route('/view/:collectionName', {
  triggersEnter: [
    function (context) {
      Session.set('admin_title', context.params.collectionName)
      Session.set('admin_subtitle', 'View')
      Session.set('admin_collection_page', 'view')
      Session.set('admin_collection_name', context.params.collectionName)
    }],
  triggersExit: [
    function (context) {
      BlazeLayout.render('fAdminLayout', {main: 'AdminLoading'})
    }
  ],
  subscriptions () {
    // this.register('fadminUsers', Meteor.subscribe('adminUsers'))
  },
  action (params) {
    BlazeLayout.render('fAdminLayout', {main: 'AdminDashboardView'})
  }
})

fadminRoutes.route('/new/:collectionName', {
  triggersEnter: [function (context) {
    Session.set('admin_title', context.params.collectionName)
    Session.set('admin_subtitle', 'Create New')
    Session.set('admin_collection_page', 'new')
    Session.set('admin_collection_name', context.params.collectionName)
  }],
  triggersExit: [
    function (context) {
      BlazeLayout.render('fAdminLayout', {main: 'AdminLoading'})
    }
  ],
  action (params) {
    if (params.collectionName === 'Users') {
      BlazeLayout.render('fAdminLayout', {main: 'AdminDashboardUsersNew'})
    } else {
      BlazeLayout.render('fAdminLayout', {main: 'AdminDashboardNew'})
    }
  }
})

fadminRoutes.route('/edit/:collectionName/:_id', {
  triggersEnter: [function (context) {
    Session.set('admin_title', context.params.collectionName)
    Session.set('admin_subtitle', 'Edit')
    Session.set('admin_collection_page', 'edit')
    Session.set('admin_collection_name', context.params.collectionName)
    if (context.params.collectionName === 'Users') {
      Session.set('admin_id', context.params._id)
    } else {
      Session.set('admin_id', null)
    }
  }],
  triggersExit: [
    function (context) {
      BlazeLayout.render('fAdminLayout', {main: 'AdminLoading'})
      Session.set('admin_id', null)
    }
  ],
  subscriptions (params) {
    if (params.collectionName !== 'Users') {
      this.register('admindoc2edit', Meteor.subscribe('adminCollectionDoc', params.collectionName, parseID(params._id)))
    }
  },
  action (params) {
    if (params.collectionName === 'Users') {
      BlazeLayout.render('fAdminLayout', {main: 'AdminDashboardUsersEdit'})
    } else {
      BlazeLayout.render('fAdminLayout', {main: 'AdminDashboardEdit'})
    }
  }
})
