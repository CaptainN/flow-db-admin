this.adminCollectionObject = function(collection) {
  if (typeof AdminConfig.collections[collection] !== 'undefined' && typeof AdminConfig.collections[collection].collectionObject !== 'undefined') {
    return AdminConfig.collections[collection].collectionObject;
  } else {
    return lookup(collection);
  }
};

this.adminCallback = function(name, args, callback) {
  var ref1, ref2, stop;
  stop = false;
  if (typeof (typeof AdminConfig !== "undefined" && AdminConfig !== null ? (ref1 = AdminConfig.callbacks) != null ? ref1[name] : void 0 : void 0) === 'function') {
    stop = (ref2 = AdminConfig.callbacks)[name].apply(ref2, args) === false;
  }
  if (typeof callback === 'function') {
    if (!stop) {
      return callback.apply(null, args);
    }
  }
};

this.lookup = function(obj, root, required) {
  var arr, ref;
  if (required == null) {
    required = true;
  }
  if (typeof root === 'undefined') {
    root = Meteor.isServer ? global : window;
  }
  if (typeof obj === 'string') {
    ref = root;
    arr = obj.split('.');
    while (arr.length && (ref = ref[arr.shift()])) {
      continue;
    }
    if (!ref && required) {
      throw new Error(obj + ' is not in the ' + root.toString());
    } else {
      return ref;
    }
  }
  return obj;
};

this.parseID = function(id) {
  if (typeof id === 'string') {
    if (id.indexOf("ObjectID") > -1) {
      return new Mongo.ObjectID(id.slice(id.indexOf('"') + 1, id.lastIndexOf('"')));
    } else {
      return id;
    }
  } else {
    return id;
  }
};

this.parseIDs = function(ids) {
  return _.map(ids, function(id) {
    return parseID(id);
  });
};
