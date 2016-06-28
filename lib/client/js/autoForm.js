/* global AdminDashboard */
import { Meteor } from 'meteor/meteor'
import { AutoForm } from 'meteor/aldeed:autoform'
import { $ } from 'meteor/jquery'
import { Session } from 'meteor/session'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { adminCallback } from '../../both/utils'

AutoForm.addHooks([
  'admin_insert',
  'admin_update',
  'adminNewUser',
  'adminUpdateUser',
  'adminSendResetPasswordEmail',
  'adminChangePassword'
], {
  beginSubmit () {
    return $('.btn-primary').addClass('disabled')
  },
  endSubmit () {
    return $('.btn-primary').removeClass('disabled')
  },
  onError (formType, error) {
    return AdminDashboard.alertFailure(error.message)
  }
})

AutoForm.hooks({
  admin_insert: {
    onSubmit (insertDoc, updateDoc, currentDoc) {
      Meteor.call('adminInsertDoc', insertDoc, Session.get('admin_collection_name'), (e, r) => {
        if (e) {
          console.error(e)
          return this.done(e)
        } else {
          return adminCallback('onInsert', [Session.get('admin_collection_name', insertDoc, updateDoc, currentDoc)], collection => {
            return this.done(null, collection)
          })
        }
      })
      return false
    },
    onSuccess (formType, collection) {
      AdminDashboard.alertSuccess('Successfully created')
      return FlowRouter.go('/admin/view/' + collection)
    }
  },
  admin_update: {
    onSubmit (insertDoc, updateDoc, currentDoc) {
      Meteor.call('adminUpdateDoc', updateDoc, Session.get('admin_collection_name'), this.docId, (e, r) => {
        if (e) {
          return this.done(e)
        } else {
          return adminCallback('onUpdate', [Session.get('admin_collection_name', insertDoc, updateDoc, currentDoc)], collection => {
            return this.done(null, collection)
          })
        }
      })
      return false
    },
    onSuccess (formType, collection) {
      // :HACK: Temp fix for jumpy post update behavior
      return FlowRouter.go('/admin/view/' + collection)
      // return AdminDashboard.alertSuccess('Successfully updated')
    }
  },
  adminNewUser: {
    onSuccess (formType, result) {
      return AdminDashboard.alertSuccess('Created user')
    }
  },
  adminUpdateUser: {
    onSubmit (insertDoc, updateDoc, currentDoc) {
      Meteor.call('adminUpdateUser', updateDoc, Session.get('admin_id'), this.done)
      return false
    },
    onSuccess (formType, result) {
      return AdminDashboard.alertSuccess('Updated user')
    }
  },
  adminSendResetPasswordEmail: {
    onSuccess (formType, result) {
      return AdminDashboard.alertSuccess('Email sent')
    }
  },
  adminChangePassword: {
    onSuccess (operation, result, template) {
      return AdminDashboard.alertSuccess('Password reset')
    }
  }
})
