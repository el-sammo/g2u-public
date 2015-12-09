/**
 * ImagesController
 *
 * @description :: Server-side logic for managing images
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var prefix 

module.exports = {
  show: function(req, res) {
    var key = [
      Images.urlPrefix,
      req.params.collection,
      req.params.id,
      req.params.field,
      req.params.version,
    ].join('/');

    var p = Images.findOne({key: key});

    p.then(function(doc) {
      if(! doc) {
        sails.log.error('Invalid image key: ' + key);
        return res.send(404);
      }
      var ext = getExtension(doc.image);
      var imgBase64 = stripHeading(doc.image, ext);
      res.setHeader('content-type', 'image/' + ext);
      res.send(base64ToImage(imgBase64));
    });

    p.catch(function(err) {
      sails.log.error(err);
      return res.send(500);
    });
  }
};

function base64ToImage(imgBase64) {
  var buf = new Buffer(imgBase64, 'base64');
  return buf;
}

function getExtension(imgBase64) {
  var matches = imgBase64.match(/^data:image\/([a-zA-Z]+);base64,/);
  return matches[1];
}

function stripHeading(imgBase64, ext) {
  var regex = new RegExp('^data:image/' + ext + ';base64,');
  return imgBase64.replace(regex, '');
}

