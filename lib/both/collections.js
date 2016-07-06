import {Mongo} from 'meteor/mongo'
import {SimpleSchema} from 'meteor/aldeed:simple-schema'

export const AdminCollectionsCount = new Mongo.Collection('adminCollectionsCount')

export const Groups = new Mongo.Collection('Groups')

export const GroupSchema = new SimpleSchema({
  name: {
    type: String
  },
  slug: {
    type: String,
    index: true
  }
})

Groups.attachSchema(GroupSchema)

// need to be in globaly space
const exp = this.window || this.global
exp.Groups = Groups
