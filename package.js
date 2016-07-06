/* global Package Npm */
Package.describe({
  name: 'sach:flow-db-admin',
  version: '1.1.5',
  // Brief, one-line summary of the package.
  summary: 'Meteor Database Admin package for use with Flow Router',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/sachinbhutani/flow-db-admin',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Npm.depends({
  moment: '2.13.0'
})

Package.onUse(function (api) {
  api.versionsFrom('1.2')

  var both = ['client', 'server']

  api.use(
    [
      'underscore',
      'reactive-var',
      'meteorhacks:unblock@1.1.0',
      'kadira:flow-router@2.6.2',
      'kadira:blaze-layout@2.1.0',
      'kadira:dochead@1.5.0',
      'zimme:active-route@2.3.2',
      'reywood:publish-composite@1.4.2',
      'aldeed:collection2@2.5.0',
      'aldeed:autoform@5.7.1',
      'aldeed:template-extension@4.0.0',
      'alanning:roles@1.2.13',
      'raix:handlebar-helpers@0.2.5',
      'aldeed:tabular@1.4.0',
      'mfactory:admin-lte@0.0.2',
      'ecmascript',
      'check'
    ],
    both)

  api.use(['less', 'session', 'jquery', 'templating'], 'client')

  api.use(['email'], 'server')

  api.add_files([
    'lib/both/AdminDashboard.js',
    'lib/both/routes.js',
    'lib/both/utils.js',
    'lib/both/startup.js',
    'lib/both/collections.js'
  ], both)

  api.add_files([
    'lib/client/html/admin_templates.html',
    'lib/client/html/admin_widgets.html',
    'lib/client/html/fadmin_layouts.html',
    'lib/client/html/admin_sidebar.html',
    'lib/client/html/admin_header.html',
    'lib/client/js/admin_layout.js',
    'lib/client/js/helpers.js',
    'lib/client/js/templates.js',
    'lib/client/js/events.js',
    'lib/client/js/slim_scroll.js',
    'lib/client/js/autoForm.js',
    'lib/client/css/admin-custom.less'
  ], 'client')

  api.add_files([
    'lib/server/publish.js',
    'lib/server/methods.js'
  ], 'server')

  // api.addAssets(['lib/client/css/admin-custom.css'],'client')
  api.export('AdminDashboard', both)
})

Package.onTest(function (api) {
  api.use('tinytest')
  api.use('sach:flow-db-admin')
  api.addFiles('flow-db-admin-tests.js')
})
