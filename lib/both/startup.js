var adminCreateTables, adminDelButton, adminEditButton, adminEditDelButtons, adminPublishTables, adminTablePubName, adminTablesDom, defaultColumns;

this.AdminTables = {};

adminTablesDom = '<"box"<"box-header"<"box-toolbar"<"pull-left"<lf>><"pull-right"p>>><"box-body"t>>';

adminEditButton = {
  data: '_id',
  title: 'Edit',
  createdCell: function(node, cellData, rowData) {
    return $(node).html(Blaze.toHTMLWithData(Template.adminEditBtn, {
      _id: cellData
    }, node));
  },
  width: '40px',
  orderable: false
};

adminDelButton = {
  data: '_id',
  title: 'Delete',
  createdCell: function(node, cellData, rowData) {
    return $(node).html(Blaze.toHTMLWithData(Template.adminDeleteBtn, {
      _id: cellData
    }, node));
  },
  width: '40px',
  orderable: false
};

adminEditDelButtons = [adminEditButton, adminDelButton];

defaultColumns = function() {
  return [
    {
      data: '_id',
      title: 'ID'
    }
  ];
};

AdminTables.Users = new Tabular.Table({
  changeSelector: function(selector, userId) {
    var $or;
    $or = selector['$or'];
    $or && (selector['$or'] = _.map($or, function(exp) {
      var ref;
      if (((ref = exp.emails) != null ? ref['$regex'] : void 0) != null) {
        return {
          emails: {
            $elemMatch: {
              address: exp.emails
            }
          }
        };
      } else {
        return exp;
      }
    }));
    return selector;
  },
  name: 'Users',
  collection: Meteor.users,
  columns: _.union([
    {
      data: '_id',
      title: 'Admin',
      createdCell: function(node, cellData, rowData) {
        return $(node).html(Blaze.toHTMLWithData(Template.adminUsersIsAdmin, {
          _id: cellData
        }, node));
      },
      width: '40px'
    }, {
      data: 'emails',
      title: 'Email',
      render: function(value) {
        if (value) {
          return value[0].address;
        } else {
          return '';
        }
      },
      searchable: true
    }, {
      data: 'emails',
      title: 'Mail',
      createdCell: function(node, cellData, rowData) {
        return $(node).html(Blaze.toHTMLWithData(Template.adminUsersMailBtn, {
          emails: cellData
        }, node));
      },
      width: '40px'
    }, {
      data: 'createdAt',
      title: 'Joined'
    }
  ], adminEditDelButtons),
  dom: adminTablesDom
});

adminTablePubName = function(collection) {
  return "admin_tabular_" + collection;
};

adminCreateTables = function(collections) {
  return _.each(typeof AdminConfig !== "undefined" && AdminConfig !== null ? AdminConfig.collections : void 0, function(collection, name) {
    var columns;
    _.defaults(collection, {
      showEditColumn: true,
      showDelColumn: true
    });
    columns = _.map(collection.tableColumns, function(column) {
      var createdCell;
      if (column.template) {
        createdCell = function(node, cellData, rowData) {
          $(node).html('');
          return Blaze.renderWithData(Template[column.template], {
            value: cellData,
            doc: rowData
          }, node);
        };
      }
      return {
        data: column.name,
        title: column.label,
        createdCell: createdCell
      };
    });
    if (columns.length === 0) {
      columns = defaultColumns();
    }
    if (collection.showEditColumn) {
      columns.push(adminEditButton);
    }
    if (collection.showDelColumn) {
      columns.push(adminDelButton);
    }
    return AdminTables[name] = new Tabular.Table({
      name: name,
      collection: adminCollectionObject(name),
      pub: collection.children && adminTablePubName(name),
      sub: collection.sub,
      columns: columns,
      extraFields: collection.extraFields,
      dom: adminTablesDom
    });
  });
};

adminPublishTables = function(collections) {
  return _.each(collections, function(collection, name) {
    if (!collection.children) {
      return void 0;
    }
    return Meteor.publishComposite(adminTablePubName(name), function(tableName, ids, fields) {
      var extraFields;
      check(tableName, String);
      check(ids, Array);
      check(fields, Match.Optional(Object));
      extraFields = _.reduce(collection.extraFields, function(fields, name) {
        fields[name] = 1;
        return fields;
      }, {});
      _.extend(fields, extraFields);
      this.unblock();
      return {
        find: function() {
          this.unblock();
          return adminCollectionObject(name).find({
            _id: {
              $in: ids
            }
          }, {
            fields: fields
          });
        },
        children: collection.children
      };
    });
  });
};

Meteor.startup(function() {
  adminCreateTables(typeof AdminConfig !== "undefined" && AdminConfig !== null ? AdminConfig.collections : void 0);
  if (Meteor.isServer) {
    return adminPublishTables(typeof AdminConfig !== "undefined" && AdminConfig !== null ? AdminConfig.collections : void 0);
  }
});
