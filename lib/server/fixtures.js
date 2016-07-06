import {Meteor} from 'meteor/meteor'
import {Groups} from '../both/collections'

// initial values
Meteor.startup(function () {
  if (Groups.find().count() === 0) {
    Groups.insert({
      name: 'Super Admin',
      slug: 'super'
    })
  }
})
