import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import { $ } from 'meteor/jquery'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { adminCollectionObject, parseID } from '../../both/utils'

Template.fAdminLayout.events({
  'click .btn-delete' (e, t) {
    var _id = $(e.target).attr('doc')
    if (Session.equals('admin_collection_name', 'Users')) {
      Session.set('admin_id', _id)
      return Session.set('admin_doc', Meteor.users.findOne(_id))
    } else {
      Session.set('admin_id', parseID(_id))
      return Session.set('admin_doc', adminCollectionObject(Session.get('admin_collection_name')).findOne(parseID(_id)))
    }
  }
})

Template.AdminDashboardUsersEdit.events({
  'click .btn-add-role' (e, t) {
    console.log('adding user to role')
    return Meteor.call('adminAddUserToRole', $(e.target).attr('user'), $(e.target).attr('role'))
  },
  'click .btn-remove-role' (e, t) {
    console.log('removing user from role')
    return Meteor.call('adminRemoveUserToRole', $(e.target).attr('user'), $(e.target).attr('role'))
  }
})

Template.AdminHeader.events({
  'click .btn-sign-out' () {
    return Meteor.logout(() => FlowRouter.go('/'))
  }
})

Template.adminDeleteWidget.events({
  'click #confirm-delete' () {
    var collection = FlowRouter.getParam('collectionName')
    var _id = FlowRouter.getParam('_id')
    return Meteor.call('adminRemoveDoc', collection, _id, function (e, r) {
      return FlowRouter.go('/admin/view/' + collection)
    })
  }
})
