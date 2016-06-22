import { Template } from 'meteor/templating'
import { BlazeLayout } from 'meteor/kadira:blaze-layout'
import { $ } from 'meteor/jquery'
import { ReactiveVar } from 'meteor/reactive-var'

BlazeLayout.setRoot('body')
Template.fAdminLayout.created = function () {
  this.minHeight = new ReactiveVar($(window).height() - $('.main-header').height())

  $(window).resize(() => {
    this.minHeight.set($(window).height() - $('.main-header').height())
  })

  $('body').addClass('fixed')
}

Template.fAdminLayout.helpers({
  minHeight: function () {
    return Template.instance().minHeight.get() + 'px'
  }
})

dataTableOptions = {
  'aaSorting': [],
  'bPaginate': true,
  'bLengthChange': false,
  'bFilter': true,
  'bSort': true,
  'bInfo': true,
  'bAutoWidth': false
}
