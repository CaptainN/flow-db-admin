/* global AdminConfig */
import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { isGroupAdmin, adminCollectionObject } from '../../both/utils'
import { AdminTables } from '../../both/startup'
import { AdminCollectionsCount, Groups } from '../../both/collections'

Template.AdminSidebar.rendered = function () {
  return this.$('.sidebar').slimScroll({
    position: 'left',
    height: '800px'
  })
}

function handleCreated () {
  var curCollection = Session.get('admin_collection_name')
  const collection = AdminConfig.collections[curCollection]
  var subs = collection && collection.subscriptions
  this.autorun(() => {
    subs && subs.forEach(sub => {
      if (sub.options) {
        this.subscribe(sub.name, sub.options)
      } else {
        this.subscribe(sub.name)
      }
    })
  })
}

Template.AdminDashboardEdit.created = handleCreated
Template.AdminDashboardNew.created = handleCreated
Template.AdminDashboardView.created = handleCreated

Template.AdminDashboardView.rendered = function () {
  return this.$('.dataTable').DataTable()
}

Template.AdminDashboardView.helpers({
  hasDocuments () {
    const collectionName = Session.get('admin_collection_name')
    if (collectionName === 'Groups') {
      return Groups.find().count() > 0
    }
    var ref
    return ((ref = AdminCollectionsCount.findOne({
      collection: collectionName
    })) != null ? ref.count : void 0) > 0
  },
  newPath () {
    return FlowRouter.path('/admin/new/:coll', {
      coll: Session.get('admin_collection_name')
    })
  },
  admin_table () {
    return AdminTables[Session.get('admin_collection_name')]
  }
})

Template.adminUsersIsAdmin.helpers({
  checkadmin () {
    return isGroupAdmin(this._id)
  }
})

Template.adminUsersMailBtn.helpers({
  adminUserEmail () {
    var user = this
    if (user && user.emails && user.emails[0] && user.emails[0].address) {
      return user.emails[0].address
    } else if (user && user.services && user.services.facebook && user.services.facebook.email) {
      return user.services.facebook.email
    } else if (user && user.services && user.services.google && user.services.google.email) {
      return user.services.google.email
    } else {
      return 'null@null.null'
    }
  }
})

Template.adminEditBtn.helpers({
  path () {
    return FlowRouter.path('/admin/edit/:coll/:_id', {
      coll: Session.get('admin_collection_name'),
      _id: this._id
    })
  }
})

Template.adminDeleteBtn.helpers({
  path () {
    return FlowRouter.path('/admin/edit/:coll/:_id', {
      coll: Session.get('admin_collection_name'),
      _id: this._id
    }, {
      action: 'delete'
    })
  }
})

Template.AdminHeader.helpers({
  profilepath () {
    return FlowRouter.path('/admin/edit/:coll/:_id', {
      coll: 'Users',
      _id: Meteor.userId()
    })
  }
})

Template.AdminDashboardEdit.rendered = function () {
  var editcollectionName = FlowRouter.getParam('collectionName')
  var editId = FlowRouter.getParam('_id')
  return Session.set('admin_doc', adminCollectionObject(editcollectionName).findOne({
    _id: editId
  }))
}

Template.AdminDashboardEdit.helpers({
  fadmin_doc () {
    var editcollectionName = FlowRouter.getParam('collectionName')
    var editId = FlowRouter.getParam('_id')
    if (editcollectionName && editId) {
      return adminCollectionObject(editcollectionName).findOne({
        _id: editId
      })
    }
  },
  action () {
    return FlowRouter.getQueryParam('action')
  }
})

Template.AdminDashboardUsersEdit.helpers({
  user () {
    return Meteor.users.find(FlowRouter.getParam('_id')).fetch()
  },
  username () {
    const user = Meteor.users.findOne(FlowRouter.getParam('_id'))
    return (user && (user.username || (user.emails && user.emails.length > 1 && user.emails[0]))) || ''
  },
  action () {
    return FlowRouter.getQueryParam('action')
  },
  groups () {
    return Groups.find()
  },
  statusClass (userId) {
    if (isGroupAdmin(userId, this.slug)) {
      return 'btn-remove-group btn-primary'
    } else {
      return 'btn-add-group btn-default'
    }
  }
})
