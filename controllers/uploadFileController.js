'use strict';
var utils = require('../utils/writer.js');
var uploadFilesService = require('../service/uploadFilesService');

var logHelper = require('../utils/logging.js');

module.exports = {
  uploadArtPdfFile:uploadArtPdfFile
}

function  uploadArtPdfFile(req, res , next) {

     var arraydata =  uploadFilesService.uploadArtPdfFileService(req, res).then(function (response) {
      console.log('uploadFileController: ',arraydata);
      res.end("File is uploaded ..... "+arraydata);
      }).catch(function (response) {
        
      });
    
 }

