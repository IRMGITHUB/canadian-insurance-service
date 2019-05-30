'use strict';
var utils = require('../utils/writer.js');
var uploadFilesService = require('../service/uploadFilesService');
var constants = require('../config/constants.js');
var crypto = require('crypto');
const uuidV1 = require('uuid/v1');
var fs = require('fs-extra');
var logHelper = require('../utils/logging.js');


module.exports = {
  uploadArtPdfFileService:uploadArtPdfFileService
}


async function uploadArtPdfFileService(req, res ){

  try{
    var arraydata = [];
   
    const requestBody  = req.body;
    console.log('conditionReportNumber: ',requestBody.conditionReportNumber);
    console.log('artWorkRefNumber: ',requestBody.artWorkRefNumber);
    console.log('dateOfCreation : ',requestBody.dateOfCreation);
    arraydata.push('conditionReportNumber---> ',requestBody.conditionReportNumber);
    arraydata.push('artWorkRefNumber---> ',requestBody.artWorkRefNumber);
    arraydata.push('dateOfCreation---> ',requestBody.dateOfCreation);

    const reqfiles = req.files;
    console.log('reqfiles: ',reqfiles);
    const uploadjsonfile = req.files.uploadjsonfile;
    const uploadpdffile = req.files.uploadpdffile;
    console.log('uploadjsonfile: ',  uploadjsonfile);
    console.log('uploadpdffile: ',  uploadpdffile);
    var fileName = uuidV1();
    let path = './uploaddata/'+fileName;
    console.log('path : ',path);
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    
    arraydata.push('path --->'+path);
    uploadjsonfile.forEach( function (file) {
       console.log(file);
       var datetimestamp = Date.now();
       var  inputString = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
       arraydata.push('file name --->'+inputString);
       fs.writeFile( path+'/'+ inputString, file.buffer , function (err) {
         if (err) {
           debug(err);
           var err = {
             message: 'File not uploaded'
           };
          // return next(err);
         }
       });
       var hashValue = crypto.createHash('sha256').update(file.buffer.toString('base64')).digest('hex');
       console.log('hashValue:',hashValue);
       arraydata.push('file hashValue --->'+hashValue);
    });

    uploadpdffile.forEach( function (file) {
        console.log(file);
        var datetimestamp = Date.now();
        var  inputString = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
        arraydata.push('file name --->',inputString);
        fs.writeFile( path+'/'+ inputString, file.buffer , function (err) {
          if (err) {
            debug(err);
            var err = {
              message: 'File not uploaded'
            };
           // return next(err);
          }
        });
        var hashValue = crypto.createHash('sha256').update(file.buffer.toString('base64')).digest('hex');
        console.log('hashValue:',hashValue);
        arraydata.push('file hashValue --->'+hashValue);
     });
    // res.end("File is uploaded ----> "+arraydata);

     return arraydata;
   }catch(error){
    logHelper.logError('upload file service error : ', error);
   }

}