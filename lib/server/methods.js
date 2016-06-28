/* global AdminConfig */
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { _ } from 'meteor/underscore'
import { check, Match } from 'meteor/check'
import { Email } from 'meteor/email'
import { Roles } from 'meteor/alanning:roles'
import { isGroupAdmin, adminCollectionObject } from '../both/utils'

Meteor.methods({
  adminInsertDoc: function (doc, collection) {
    check(arguments, [Match.Any])
    if (!isGroupAdmin(this.userId)) {
      throw new Meteor.Error('access denied')
    }
    try {
      var result = adminCollectionObject(collection).insert(doc)
    } catch (e) {
      throw new Meteor.Error(e.message)
    }
    return result
  },
  adminUpdateDoc: function (modifier, collection, _id) {
    check(arguments, [Match.Any])
    if (!isGroupAdmin(this.userId)) {
      throw new Meteor.Error('access denied')
    }
    try {
      var result = adminCollectionObject(collection).update({
        _id: _id
      }, modifier)
    } catch (e) {
      throw new Meteor.Error(e.message)
    }
    return result
  },
  adminRemoveDoc: function (collection, _id) {
    check(arguments, [Match.Any])
    if (isGroupAdmin(this.userId)) {
      if (collection === 'Users') {
        return Meteor.users.remove({
          _id: _id
        })
      } else {
        return adminCollectionObject(collection).remove({
          _id: _id
        })
      }
    }
  },
  adminNewUser: function (doc) {
    var emails
    check(arguments, [Match.Any])
    if (isGroupAdmin(this.userId)) {
      emails = doc.email.split(',')
      return _.each(emails, function (email) {
        var _id, user
        user = {}
        user.email = email
        if (!doc.chooseOwnPassword) {
          user.password = doc.password
        }
        _id = Accounts.createUser(user)
        if (doc.sendPassword && (AdminConfig.fromEmail != null)) {
          Email.send({
            to: user.email,
            from: AdminConfig.fromEmail,
            subject: 'Your account has been created',
            html: "You've just had an account created for " + Meteor.absoluteUrl() + ' with password ' + doc.password
          })
        }
        if (!doc.sendPassword) {
          return Accounts.sendEnrollmentEmail(_id)
        }
      })
    }
  },
  adminUpdateUser: function (modifier, _id) {
    check(arguments, [Match.Any])
    if (!isGroupAdmin(this.userId)) {
      throw new Meteor.Error('access denied')
    }
    try {
      var result = Meteor.users.update({
        _id: _id
      }, modifier)
    } catch (e) {
      throw new Meteor.Error(e.message)
    }
    return result
  },
  adminSendResetPasswordEmail: function (doc) {
    check(arguments, [Match.Any])
    if (isGroupAdmin(this.userId)) {
      console.log('Changing password for user ' + doc._id)
      return Accounts.sendResetPasswordEmail(doc._id)
    }
  },
  adminChangePassword: function (doc) {
    check(arguments, [Match.Any])
    if (isGroupAdmin(this.userId)) {
      console.log('Changing password for user ' + doc._id)
      Accounts.setPassword(doc._id, doc.password)
      return {
        label: 'Email user their new password'
      }
    }
  },
  adminCheckAdmin: function () {
    var adminEmails, email, user
    check(arguments, [Match.Any])
    user = Meteor.users.findOne({
      _id: this.userId
    })
    if (this.userId && !isGroupAdmin(this.userId) && (user.emails.length > 0)) {
      email = user.emails[0].address
      if (typeof Meteor.settings.adminEmails !== 'undefined') {
        adminEmails = Meteor.settings.adminEmails
        if (adminEmails.indexOf(email) > -1) {
          console.log('Adding admin user: ' + email)
          return Roles.addUsersToRoles(this.userId, ['admin'], Roles.GLOBAL_GROUP)
        }
      } else if (typeof AdminConfig !== 'undefined' && typeof AdminConfig.adminEmails === 'object') {
        adminEmails = AdminConfig.adminEmails
        if (adminEmails.indexOf(email) > -1) {
          console.log('Adding admin user: ' + email)
          return Roles.addUsersToRoles(this.userId, ['admin'], Roles.GLOBAL_GROUP)
        }
      } else if (this.userId === Meteor.users.findOne({}, {sort: {createdAt: 1}})._id) {
        console.log('Making first user admin: ' + email)
        return Roles.addUsersToRoles(this.userId, ['admin'])
      }
    }
  },
  adminAddUserToRole: function (_id, role) {
    check(arguments, [Match.Any])
    if (isGroupAdmin(this.userId)) {
      return Roles.addUsersToRoles(_id, role, Roles.GLOBAL_GROUP)
    }
  },
  adminRemoveUserToRole: function (_id, role) {
    check(arguments, [Match.Any])
    if (isGroupAdmin(this.userId)) {
      return Roles.removeUsersFromRoles(_id, role, Roles.GLOBAL_GROUP)
    }
  },
  adminSetCollectionSort: function (collection, _sort) {
    check(arguments, [Match.Any])
    return global.AdminPages[collection].set({
      sort: _sort
    })
  }
})
