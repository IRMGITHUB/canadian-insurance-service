'use strict';
var fs = require('fs');
var configDetails = fs.readFileSync('config/config.json', 'utf8');
var configData = JSON.parse(configDetails);
var config = require('config');
var constants = require('../config/constants.js');
var util = require('../utils/util.js');
var chaincodeService = require('../service/chaincodeService');
var transactionService = require('../service/transactionService');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);
var crypto = require('crypto');
const uuidV1 = require('uuid/v1');

module.exports = {
  addArtworkAsset: addArtworkAsset,
  findAllArtWorkDetails: findAllArtWorkDetails,
  findAllConditionReports: findAllConditionReports,
  addConditionReport: addConditionReport,
  getArtWorkImage: getArtWorkImage,
  findAllConditionReportsByArtWorkNumber: findAllConditionReportsByArtWorkNumber,
  getallArtImageJson: getallArtImageJson,
  getuploadedConditionReports: getuploadedConditionReports,
  getArtWorkDetails: getArtWorkDetails,
  getConditionReportByConditionRptNo: getConditionReportByConditionRptNo,
  getAccessControlList: getAccessControlList,
  updateAccessControl: updateAccessControl,
  findAllTransactionByType: findAllTransactionByType,
  getAllArtWork: getAllArtWork,
  getTransactionByReferenceNum: getTransactionByReferenceNum,
  getTransactionByTransactionId : getTransactionByTransactionId
}


/**
 * This method will get art image json.
 * @param {*} req 
 * @param {*} res 
 * @param {*} transactionId 
 * @param {*} accessControlId 
 */

async function getallArtImageJson(req, res, transactionId, accessControlId) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ALL_ART_IMAGE_JSON);
  logHelper.logDebug(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ALL_ART_IMAGE_JSON, constants.REQUEST, req);
  try {
    var requestBody = req.body.artWorkImageDatainJSON;
    logger.info("requestBody===Json data========>", requestBody);
    const uploadArtPic = req.files.artWorkImageUpload;
    const readData = JSON.parse(requestBody)
    var fileName = uuidV1();
    let path = configData.ARTWORK_IMAGE_LOCATION + fileName;
    logger.info('path: ', path);
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    uploadArtPic.forEach(function (file) {
      var datetimestamp = Date.now();
      var inputString = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];
      fs.writeFile(path + '/' + inputString, file.buffer, function (err) {
        if (err) {
          debug(err);
          var err = {
            message: 'File not uploaded'
          };
        }
      });
      var hashValue = crypto.createHash('sha256').update(file.buffer.toString('base64')).digest('hex');
      readData["imageHash"] = hashValue;
    });

    readData["imageLocation"] = path;
    readData["imageStorageType"] = configData.CONDITION_REPORT_STORAGE_TYPE;
    readData["accessControlId"] = accessControlId;
    readData["conditionReports"] = [];
    readData["schemaName"] = "artWork";

    var transactionId = util.generateId(constants.TRANSACTION_ID);
    readData["transaction"] = [{
      "transactionId": transactionId,
      "transactionTimeStamp": new Date(),
      "transactionType": "addArtWork",
      "schemaName": "artWork"
    }]
    let edited_ReadData = JSON.stringify(readData);
    logger.info("edited_ReadData==============>", edited_ReadData);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ALL_ART_IMAGE_JSON);
    return edited_ReadData;
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ALL_ART_IMAGE_JSON, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will add Art work image.
 * @param {*} req 
 * @param {*} res 
 */
async function addArtworkAsset(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.ADD_ART_WORK_ASSET);
  logHelper.logDebug(logger, constants.ART_WORK_SERVICE_FILE, constants.ADD_ART_WORK_ASSET, constants.REQUEST, req);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var authOwnerId = req.auth.sub;
    var jsonBody = req.body.artWorkImageDatainJSON;
    var ownerId = JSON.parse(jsonBody).ownerId;
    logger.info("authOwnerId=============", authOwnerId);
    logger.info("ownerId=============", ownerId);
    if (ownerId === authOwnerId) {
      var transactionId = util.generateId(constants.TRANSACTION_ID);
      var accessControlId = util.generateId(constants.ACCESSCONTROL);
      logger.info("accessControlId=============", accessControlId);
      var requestBody = await getallArtImageJson(req, res, transactionId, accessControlId);
      var jsonRequestBody = JSON.parse(requestBody);
      var aclReqBody = {
        accessControlId: accessControlId,
        assetType: 'addartwork',
        ownerId: req.auth.sub,
        schemaType: 'Acl',
        status: 'valid',
        referenceNumber: jsonRequestBody.artWorkNumber,
        fetchAllowedTo: [req.auth.sub]
      }
      aclReqBody = JSON.stringify(aclReqBody);
      var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.addAssociatedACL;
      var accessCtrlResp = await chaincodeService.invokeChainCode(req.auth.fabricToken, aclReqBody, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      logger.info("accessCtrlResp=============", accessCtrlResp);
      if (accessCtrlResp == "") {
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_500
        });
      } else {
        var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.addArtworkAsset;
        var artWorkResp = await chaincodeService.invokeChainCode(req.auth.fabricToken, requestBody, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
        logger.info("artWorkResp=============", artWorkResp);
        if (artWorkResp == "") {
          return ({
            statusCode: constants.NO_CONTENT,
            result: constants.MESSAGE_500
          });
        } else {
          var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, artWorkResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
          var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
          var blockNumber = blockData.header.number.toString();
          var reqTransactionData = {
            transactionId: artWorkResp,
            transactionTimeStamp: timestamp,
            transactionType: 'addArtWork',
            blockno: blockNumber,
            referenceNumber: jsonRequestBody.artWorkNumber,
            createdBy: req.auth.sub
          }
          var transData = await transactionService.addTransaction(reqTransactionData);
          logger.info("transData=============", transData);
          logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.ADD_ART_WORK_ASSET);
          if (transData == "") {
            return ({
              statusCode: constants.NO_CONTENT,
              result: constants.MESSAGE_500
            });
          } else {
            return ({
              statusCode: constants.SUCCESS,
              result: "Success",
              transactionId: artWorkResp
            });
          }
        }
      }
    } else {
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_401
      })
    }
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.ADD_ART_WORK_ASSET, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will get json for condtion report.
 * @param {*} req 
 * @param {*} res 
 * @param {*} accessControlId 
 */

async function getuploadedConditionReports(req, res, accessControlId, requester) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_UPLOADED_CONDITIONREPORTS);
  logHelper.logDebug(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_UPLOADED_CONDITIONREPORTS, constants.REQUEST, req);
  try {
    var arraydata = {};
    const requestBody = req.body;
    arraydata["conditionReportNumber"] = requestBody.conditionReportNumber;
    arraydata["artWorkRefNumber"] = requestBody.artWorkRefNumber;
    arraydata["dateOfCreation"] = requestBody.dateOfCreation;
    arraydata["conditionRptStorageType"] = configData.CONDITION_REPORT_STORAGE_TYPE;
    arraydata["pdfStorageType"] = configData.CONDITION_REPORT_STORAGE_TYPE;
    arraydata["accessControlId"] = accessControlId;
    arraydata["requester"] = requester;
    arraydata["schemaName"] = "conditionReport";
    arraydata["purpose"] = requestBody.purpose;
    var transactionId = util.generateId(constants.TRANSACTION_ID);
    arraydata["transaction"] = [{
      "transactionId": transactionId,
      "transactionTimeStamp": new Date(),
      "transactionType": "addConditionReport",
      "schemaName": "conditionReport"
    }]
    const reqfiles = req.files;
    logger.info('reqfiles: ', reqfiles);
    const uploadjsonfile = req.files.artWorkJsonFileUpload;
    const uploadpdffile = req.files.artWorkPdfFileUpload;
    logger.info('uploadjsonfile: ', uploadjsonfile);
    logger.info('uploadpdffile: ', uploadpdffile);
    uploadjsonfile.forEach(function (file) {
      var fileNameJSON = uuidV1();
      let path = configData.ARTWORK_IMAGE_LOCATION + fileNameJSON;
      logger.info(' json path : ', path);
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      var datetimestamp = Date.now();
      var inputString = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];
      fs.writeFile(path + '/' + inputString, file.buffer, function (err) {
        if (err) {
          debug(err);
          var err = {
            message: 'File not uploaded'
          };
          // return next(err);
        }
      });
      var hashValue = crypto.createHash('sha256').update(file.buffer.toString('base64')).digest('hex');
      logger.info('conditionRptJsonHash:', hashValue);
      arraydata["conditionRptJsonHash"] = hashValue;
      arraydata["conditionRptJsonStorageLocation"] = path;
    });

    uploadpdffile.forEach(function (file) {
      var fileNamePDF = uuidV1();
      let path = configData.ARTWORK_IMAGE_LOCATION + fileNamePDF;
      logger.info(' pdf path : ', path);
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      var datetimestamp = Date.now();
      var inputString = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];
      fs.writeFile(path + '/' + inputString, file.buffer, function (err) {
        if (err) {
          debug(err);
          var err = {
            message: 'File not uploaded'
          };
        }
      });
      var hashValue = crypto.createHash('sha256').update(file.buffer.toString('base64')).digest('hex');
      logger.info('hashValue:', hashValue);
      arraydata["pdfHash"] = hashValue;
      arraydata["pdfStorageLocation"] = path;

    });
    logger.info("arraydata=================>", arraydata);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_UPLOADED_CONDITIONREPORTS);
    return arraydata;
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_UPLOADED_CONDITIONREPORTS, error);
  }
}



/**
 * This method will add condition report .
 * @param {*} req 
 * @param {*} res 
 */
async function addConditionReport(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.ADD_CONDITION_REPORT);
  logHelper.logDebug(logger, constants.ART_WORK_SERVICE_FILE, constants.ADD_CONDITION_REPORT, constants.REQUEST, req);
  try {
    var fabricToken = req.auth.fabricToken;
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var accessControlId = util.generateId(constants.ACCESSCONTROL);
    var artWorkNumber = req.body.artWorkRefNumber;
    var allowedTo = req.body.allowedTo;
    logger.info('artWorkNumber : ', artWorkNumber);
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getArtwork;
    var getArtWorkResp = await chaincodeService.queryChainCode(fabricToken, artWorkNumber, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info("getArtWorkResp...", getArtWorkResp);
    if (getArtWorkResp == "") {
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_500
      });
    } else {
      var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getAssociatedACLByRefNumber;
      var getAccessControlResp = await chaincodeService.queryChainCode(fabricToken, artWorkNumber, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      logger.info("getAccessControlResp...", getAccessControlResp);
      if (getAccessControlResp == "") {
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_500
        });
      } else {
        var artWorkfetchallowedto = getAccessControlResp[0].Record.fetchAllowedTo;
        var artWorkOwnerId = getAccessControlResp[0].Record.ownerId;
        artWorkfetchallowedto.push(allowedTo);
        logger.info("artWorkfetchallowedto=============>", artWorkfetchallowedto);
        logger.info("artWorkOwnerId=============>", artWorkOwnerId);
        logger.info("accessControlId=============>", accessControlId);
        logger.info("req.body.conditionReportNumber=============>", req.body.conditionReportNumber);
        var authOwnerId = req.auth.sub;
        if (authOwnerId === artWorkOwnerId || artWorkfetchallowedto.includes(authOwnerId)) {
          var aclReqBody = {
            accessControlId: accessControlId,
            assetType: 'conditionReport',
            ownerId: artWorkOwnerId,
            schemaType: 'Acl',
            status: 'valid',
            referenceNumber: req.body.conditionReportNumber,
            fetchAllowedTo: artWorkfetchallowedto

          }
          aclReqBody = JSON.stringify(aclReqBody);
          var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.addAssociatedACL;
          var accessCtrlResp = await chaincodeService.invokeChainCode(fabricToken, aclReqBody, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
          if (accessCtrlResp == "") {
            return ({
              statusCode: constants.NO_CONTENT,
              result: constants.MESSAGE_500
            });
          } else {
            getArtWorkResp[0].Record.conditionReports.push({
              "conditionReportNumber": req.body.conditionReportNumber,
              "dateOfCreation": req.body.dateOfCreation,
              "schemaName": "LinkArtconditionreport"
            });
            var requester = getArtWorkResp[0].Record.ownerId;
            logger.info("requester: ", requester);
            var requestBody = await getuploadedConditionReports(req, res, accessControlId, requester);
            requestBody = JSON.stringify(requestBody);
            var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.addConditionReport;
            logger.info("requestBody : ", requestBody);
            var conditionRptResp = await chaincodeService.invokeChainCode(fabricToken, requestBody, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
            logger.info("conditionRptResp=============>", conditionRptResp);
            if (conditionRptResp == "") {
              return ({
                statusCode: constants.NO_CONTENT,
                result: constants.MESSAGE_500
              });
            } else {
              var blockData = await chaincodeService.queryBlockByTransactionId(fabricToken, conditionRptResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
              var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
              var blockNumber = blockData.header.number.toString();
              var reqTransactionData = {
                transactionId: conditionRptResp,
                transactionTimeStamp: timestamp,
                transactionType: 'addConditionReport',
                blockNumber: blockNumber,
                referenceNumber: req.body.conditionReportNumber,
                createdBy: req.auth.sub
              }
              var transData = await transactionService.addTransaction(reqTransactionData);
              logger.info("transData=============>", transData);
              if (transData == "") {
                return ({
                  statusCode: constants.NO_CONTENT,
                  result: constants.MESSAGE_500
                });
              } else {

                var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.addArtworkAsset;
                var updateArtWorkResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getArtWorkResp[0].Record), chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
                logger.info("updateArtWorkResp======", updateArtWorkResp);
                if (updateArtWorkResp == "") {
                  return ({
                    statusCode: constants.NO_CONTENT,
                    result: constants.MESSAGE_500
                  });
                } else {
                  var blockData = await chaincodeService.queryBlockByTransactionId(fabricToken, conditionRptResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
                  var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
                  var blockNumber = blockData.header.number.toString();
                  var reqTransactionData = {
                    transactionId: updateArtWorkResp,
                    transactionTimeStamp: timestamp,
                    transactionType: 'updateArtWork',
                    blockno: blockNumber,
                    referenceNumber: artWorkNumber,
                    createdBy: req.auth.sub
                  }
                  var transData = await transactionService.addTransaction(reqTransactionData);
                  logger.info("transData======", transData);
                  logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.ADD_CONDITION_REPORT);
                  if (transData == "") {
                    return ({
                      statusCode: constants.NO_CONTENT,
                      result: constants.MESSAGE_500
                    });
                  } {
                    return ({
                      statusCode: constants.SUCCESS,
                      result: conditionRptResp
                    });
                  }

                }
              }
            }
          }
        } else {
          return ({
            code: constants.INTERNAL_SERVER_ERROR,
            message: constants.MESSAGE_401
          })
        }
      }

    }
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.ADD_CONDITION_REPORT, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }


}

/**
 * This method will get art work Image.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */

async function getArtWorkImage(auth, artWorkNumber) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ART_WORK_IMAGE);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    //var peerName = configData.chaincodes.artWorkInfo.peerName;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getArtwork;
    logger.info("artWorkNumber================>", artWorkNumber);
    var getArtWorkResp = await chaincodeService.queryChainCode(fabricToken, artWorkNumber, chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    if (getArtWorkResp.length <= 0) {
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
    } else {

      var imageFilePath = getArtWorkResp[0].Record.imageLocation;

      if (imageFilePath == undefined) {
        return ({
          statusCode: constants.SUCCESS,
          result: constants.FILE_NOT_FOUND
        });
      } else {

        var imageFile = imageFilePath + "/" + fs.readdirSync(imageFilePath);
        logger.info('imageFile....', imageFile);
        logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ART_WORK_IMAGE);
        return ({
          statusCode: constants.SUCCESS,
          result: imageFile
        });
      }
    }
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ART_WORK_IMAGE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will get art work Image details.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */

async function getArtWorkDetails(auth, artWorkNumber) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ARTWORK_DETAILS);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    //var peerName = configData.chaincodes.artWorkInfo.peerName;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getArtwork;
    logger.info("artWorkNumber==========>", artWorkNumber);
    var getArtWorkResp = await chaincodeService.queryChainCode(fabricToken, artWorkNumber, chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ARTWORK_DETAILS);
    if (getArtWorkResp.length <= 0) {
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
    } else
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getArtWorkResp)
      });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ARTWORK_DETAILS, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will get art work Image details.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */

async function getAllArtWork(auth, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.getAllArtWork);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getAllArtwork;
    var getArtWorkResp = await chaincodeService.queryChainCode(fabricToken, "", chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.getAllArtWork);
    if (getArtWorkResp.length <= 0) {
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
    } else
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getArtWorkResp)
      });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.getAllArtWork, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will find art work Image details.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */

async function findAllArtWorkDetails(auth) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.FIND_ALL_ART_WORK_DETAILS);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.findAllArtWorkDetails;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var getAllArtWorkResp = await chaincodeService.queryChainCode(fabricToken, "", chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.findAllArtWorkDetails);
    if (getAllArtWorkResp.length <= 0)
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getAllArtWorkResp)
      });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.findAllArtWorkDetails, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will find all condition details.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */

async function findAllConditionReports(auth) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.FIND_ALL_CONDTION_REPORTS);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.findAllConditionReports;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var findAllConditionResp = await chaincodeService.queryChainCode(fabricToken, "", chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.findAllConditionResp);
    if (findAllConditionResp.length <= 0)
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(findAllConditionResp)
      });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.findAllConditionReports, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will find conditon report  details by artwork number.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */

async function findAllConditionReportsByArtWorkNumber(auth, artWorkNumber) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.FINDALLCONDITIONRPT_BY_ARTNO);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.findAllConditionReportsByArtWorkNumber;
    logger.info("artWorkNumber==========>", artWorkNumber);
    var getConditionRptResp = await chaincodeService.queryChainCode(fabricToken, artWorkNumber, chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.findAllConditionReportsByArtWorkNumber);
    if (getConditionRptResp.length <= 0)
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getConditionRptResp)
      });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.findAllConditionReportsByArtWorkNumber, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }

}


/**
 * This method will get all conditon report by conditon report number.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */
async function getConditionReportByConditionRptNo(auth, conditionReportNumber, outputType) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_CONDITIONRPT_BY_CONDTIONNO);
  logger.info("outputType========>", outputType);
  logger.info("conditionReportNumber========>", conditionReportNumber);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getAssociatedACLByRefNumber;
    var getAccessControlResp = await chaincodeService.queryChainCode(fabricToken, conditionReportNumber, chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    console.log("getAccessControlResp=============",getAccessControlResp);
    if (getAccessControlResp == "") {
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
    } else {
      var conditionRptfetchallowedto = getAccessControlResp[0].Record.fetchAllowedTo;
      var conditionRptOwnerId = getAccessControlResp[0].Record.ownerId;
      var authOwnerId = auth.sub;
      if (authOwnerId === conditionRptOwnerId || conditionRptfetchallowedto.includes(authOwnerId)) {
        var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getConditionReport;
        var getConditionRptResp = await chaincodeService.queryChainCode(fabricToken, conditionReportNumber, chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
        if (getConditionRptResp.length <= 0) {
          return ({
            statusCode: constants.SUCCESS,
            result: constants.MESSAGE_204
          });
        } else {
          if (outputType === "PDF") {
            var pdfStorageLocation = getConditionRptResp[0].Record.pdfStorageLocation;
            logger.info("pdfStorageLocation========>", pdfStorageLocation);
            if (pdfStorageLocation == undefined) {

              return ({
                statusCode: constants.SUCCESS,
                result: constants.FILE_NOT_FOUND
              });
            } else {

              var dirFiles = fs.readdirSync(pdfStorageLocation);
              var pdfFileName = "";
              dirFiles.forEach(function (file) {
                pdfFileName = file;
              });
              logger.info("fs.readdirSync(pdfStorageLocation)==>", dirFiles);
              var pdfFile = pdfStorageLocation + "/" + pdfFileName;
              logger.info("pdfFile==============>", pdfFile);
              return ({
                statusCode: constants.SUCCESS,
                result: pdfFile
              });
            }
          } else if (outputType === "JSON") {
            var jsonStorageLocation = getConditionRptResp[0].Record.conditionRptJsonStorageLocation;
            logger.info("jsonStorageLocation========>", jsonStorageLocation);
            if (jsonStorageLocation == undefined) {

              return ({
                statusCode: constants.SUCCESS,
                result: constants.FILE_NOT_FOUND
              });
            } else {
              var dirFiles = fs.readdirSync(jsonStorageLocation);
              var jsonFileName = "";
              dirFiles.forEach(function (file) {
                jsonFileName = file;
              });
              logger.info("fs.readdirSync(jsonStorageLocation)==>", dirFiles);
              console.log('dirFiles>>>>>>>>>>>>>', dirFiles);
              console.log('jsonFileName>>>>>>>>>>>>>', jsonFileName);
              var jsonFile = jsonStorageLocation + "/" + jsonFileName;
              logger.info("jsonFile==============>", jsonFile);
              return ({
                statusCode: constants.SUCCESS,
                result: jsonFile
              });
            }
          } else {
            return ({
              statusCode: constants.SUCCESS,
              result: util.getResultArrayfromBlockChainResult(getConditionRptResp)
            });
          }
        }
      } else {
        return ({
          code: constants.INTERNAL_SERVER_ERROR,
          message: constants.MESSAGE_401
        })
      }
    }
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_CONDITIONRPT_BY_CONDTIONNO, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }

}


/**
 * This method will get all access control list.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */
async function getAccessControlList(auth, referenceNumber) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ACCESS_CTRLLIST);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getAssociatedACLByRefNumber;
    var getAccessControlResp = await chaincodeService.queryChainCode(fabricToken, referenceNumber, chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    return ({
      statusCode: constants.SUCCESS,
      result: util.getResultArrayfromBlockChainResult(getAccessControlResp)
    });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_ACCESS_CTRLLIST, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }

}

/**
 * This method will either add/remove access control.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */
async function updateAccessControl(auth, referenceNumber, operationType, operationValue) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.UPDATE_ACCESS_CONTROL);
  try {
    var chaincodeName = configData.chaincodes.artWorkInfo.name;
    var peerName = util.getPeerName(auth.orgName);
    var fabricToken = auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.getAssociatedACLByRefNumber;
    logger.info("referenceNumber==========>", referenceNumber);
    logger.info("operationType==========>", operationType);
    logger.info("operationValue==========>", operationValue);
    var getaclResp = await chaincodeService.queryChainCode(fabricToken, referenceNumber, chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    if (getaclResp != 0) {
      if (operationType === constants.GRANT) {
        getaclResp[0].Record.fetchAllowedTo.push(operationValue);
      } else if (operationType === constants.REVOKE) {
        getaclResp[0].Record.fetchAllowedTo.splice(getaclResp[0].Record.fetchAllowedTo.indexOf(operationValue), 1);
      }
      var chaincodeFunctionName = configData.chaincodes.artWorkInfo.functions.addAssociatedACL;
      var accessCtrlResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getaclResp[0].Record), chaincodeName, chaincodeFunctionName, peerName, auth.persona.toLowerCase(), auth.orgName);
    }
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.UPDATE_ACCESS_CONTROL);
    return ({
      statusCode: constants.SUCCESS,
      result: accessCtrlResp
    });

  } catch (error) {
    logger.info("error=========>", error);
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.UPDATE_ACCESS_CONTROL, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }

}

/**
 * This method will find all transaction details.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */
async function findAllTransactionByType(auth, transactionType) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.FIND_ALL_TRANSACTION_BY_TYPE);
  try {
    logger.info("transactionType============>", transactionType);
    var transData = await transactionService.getTransactionsByTransactionType(transactionType);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.FIND_ALL_TRANSACTION_BY_TYPE);
    return ({
      statusCode: constants.SUCCESS,
      result: transData
    });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.FIND_ALL_TRANSACTION_BY_TYPE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }

}


/**
 * This method will find all transaction details.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */
async function getTransactionByReferenceNum(auth, referenceNumber) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_TRANSACTION_BY_REFNUM);
  try {
    logger.info("referenceNumber=====================>", referenceNumber);
    var transData = await transactionService.getTransactionByReferenceNum(referenceNumber);
    logger.info("transData==============", transData);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_TRANSACTION_BY_REFNUM);
    return ({
      statusCode: constants.SUCCESS,
      result: transData
    });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_TRANSACTION_BY_REFNUM, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }

}


/**
 * This method will find all transaction details.
 * @param {*} auth 
 * @param {*} artWorkNumber 
 */
async function getTransactionByTransactionId(auth, transactionId) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_TRANSACTION_BY_REFNUM);
  try {
    logger.info("transactionId=====================>", transactionId);
    var transData = await transactionService.getTransactionByTransactionId(transactionId);
    logger.info("transData==============", transData);
    logHelper.logMethodExit(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_TRANSACTION_BY_REFNUM);
    return ({
      statusCode: constants.SUCCESS,
      result: transData
    });
  } catch (error) {
    logHelper.logError(logger, constants.ART_WORK_SERVICE_FILE, constants.GET_TRANSACTION_BY_REFNUM, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }

}


