/**
* Images.js
*
* @description :: Handles image operations for all other models
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var _ = require('lodash');
var Promise = require('bluebird');

var urlPrefix = '/images';

module.exports = {

  attributes: {
    // Unique identifier equivalent to URL path, including version
    key: {
      type: 'string',
      unique: true,
      required: true,
      index: true,
    },
    // Semi-unique identifier equivalent to URL path, excluding version
    partialKey: {
      type: 'string',
      required: true,
      index: true,
    },
    // Version of image
    version: {
      type: 'integer',
      defaultsTo: 1
    },
    image: {
      type: 'string',
      required: true,
    },
    forCollection: {
      type: 'string',
      required: true,
    },
    forId: {
      type: 'string',
      required: true,
    },
    forIdField: {
      type: 'string',
      required: true,
    },
    forImageField: {
      type: 'string',
      required: true,
    },
  },

  urlPrefix: urlPrefix,

  /**
   * Stores inline image data in docs[i][imageFields[j]] for collection
   * collectionName in the images collection with a generated key
   * and changes docs[i][imageFields[j]] to the associated image URL.
   */
  process: function(docs, collectionName, idField, imageFields) {
    if(! _.isArray(docs)) {
      docs = [docs];
    }

    if(! imageFields) {
      imageFields = idField;
      idField = 'id';
    }

    if(! _(imageFields).isArray()) {
      imageFields = [imageFields];
    }

    return new Promise(function(resolve, reject) {
      var promises = [];
      var failed = false;

      _(docs).forEach(function(doc) {
        _(imageFields).forEach(function(imageField) {
          if(! hasValidFields(doc, idField, imageField, reject)) {
            failed = true;
            return false;
          }

          var id = doc[idField];
          var image = doc[imageField];

          if(! isImage(image)) return false;

          promises.push(createImage(
            Images, collectionName, id, idField, imageField, image
          ));
        });
        if(failed) return false;
      });

      if(failed) return;

      var p = Promise.all(promises);
      p.then(function(imageUrls) {
        convertImageFields(imageUrls, docs, idField, imageFields);
        resolve();
      });

      p.catch(function(err) {
        reject(err);
      });
    });
  }
};

function hasValidFields(doc, idField, imageField, reject) {
  if(! doc[idField]) {
    reject(new Error(errorMsgs.invalidIdField + idField));
    return false;
  }
  if(! doc[imageField]) {
    reject(new Error(errorMsgs.invalidImageField + imageField));
    return false;
  }
  return true;
}

function isImage(image) {
  if(! _(image).isString()) return false;
  var regex = new RegExp('^data:image/[^;]+;base64,');
  return image.match(regex) ? true : false;
}

var errorMsgs = {
  invalidIdField: 'One or more documents do not contain id field: ',
  invalidImageField: 'One or more documents do not contain image field: ',
};

function buildDoc(Images, doc) {
  return new Promise(function(resolve, reject) {
    doc.partialKey = [
      urlPrefix, 
      doc.forCollection,
      doc.forId,
      doc.forImageField,
    ].join('/');

    var p = Images.find({
      partialKey: doc.partialKey
    }).sort({version: -1}).limit(1);

    p.then(function(prevVersions) {
      if(prevVersions && prevVersions.length > 0) {
        doc.version = prevVersions.shift().version + 1;
      } else {
        doc.version = 1;
      }

      var ext = getExtension(doc.image);
      doc.key = doc.partialKey + '/' + doc.version + '.' + ext;
      resolve(doc);
    });

    p.catch(reject);
  });
}

function createImage(Images, collectionName, id, idField, imageField, image) {
  return new Promise(function(resolve, reject) {
    var p = buildDoc(Images, {
      image: image,
      forCollection: collectionName,
      forId: id,
      forIdField: idField,
      forImageField: imageField,
    });
    
    p.then(function(doc) {
      Images.create(doc).then(resolve).catch(reject);
    });

    p.catch(reject);
  });
}

function convertImageFields(imageUrls, docs, idField, imageFields) {
  if(! imageUrls || imageUrls.length < 1) return;

  imageFields.forEach(function(imageField) {
    imageUrls.forEach(function(imgDoc) {
      var query = {};
      query[idField] = imgDoc.forId;
      var doc = _.find(docs, query);
      doc[imageField] = imgDoc.key;
    });
  });
}

function getExtension(imgBase64) {
  var matches = imgBase64.match(/^data:image\/([a-zA-Z]+);base64,/);
  return matches[1];
}

