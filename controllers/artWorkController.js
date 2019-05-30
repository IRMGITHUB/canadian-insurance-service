'use strict';
var utils = require('../utils/writer.js');
var artWorkService = require('../service/artWorkService');
var config = require('config');
var constants = require('../config/constants.js');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);

module.exports = {
    addArtWorkInfo: addArtWorkInfo,
    addConditionReport: addConditionReport,
    getArtWorkDetails:getArtWorkDetails,
    getArtWorkImage: getArtWorkImage,
    findAllConditionReportsByArtWorkNumber:findAllConditionReportsByArtWorkNumber,
    getConditionReportByConditionRptNo: getConditionReportByConditionRptNo,
    getAccessControlList:getAccessControlList,
    updateAccessControl:updateAccessControl,
    findAllTransactionByType:findAllTransactionByType,
    getAllArtWork:getAllArtWork,
    getTransactionByReferenceNum: getTransactionByReferenceNum,
    addArtWorkInfoOptions: addArtWorkInfoOptions,
    addConditionReportOptions: addArtWorkInfoOptions,
    getArtWorkImageOption: addArtWorkInfoOptions,
    getAllArtWorkOptions: addArtWorkInfoOptions,
    getArtWorkDetailsOptions: addArtWorkInfoOptions,
    getConditionReportByConditionRptNoOptions: addArtWorkInfoOptions,
    findAllConditionReportsByArtWorkNumberOptions: addArtWorkInfoOptions,
    getAccessControlListOptions: addArtWorkInfoOptions,
    findAllTransactionByTypeOptions: addArtWorkInfoOptions,
    getTransactionByReferenceNumOptions: addArtWorkInfoOptions,
    updateAccessControlOptions: addArtWorkInfoOptions,
    getDetailsByTransactionIdOptions:addArtWorkInfoOptions,
    getDetailsByTransactionId:getDetailsByTransactionId

}

/**
 * This method will add art work details.
 * @param {*} req 
 * @param {*} res 
 */
function addArtWorkInfo(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.ADD_ART_WORK);
    artWorkService.addArtworkAsset(req, res).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.ADD_ART_WORK, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.ADD_ART_WORK);
          utils.writeJson(res, response,constants.SUCCESS);
        }).catch(function (response) {
          utils.writeJson(res, response,constants.ERROR_CODE);
        });
  };

  /**
 * This method will get all condition report corresponding to artwork number.
 * @param {*} req 
 * @param {*} res 
 */
function findAllConditionReportsByArtWorkNumber(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.FINDALLCONDITIONRPT_BY_ARTNO);
  var artWorkNumber = req.swagger.params['artWorkNumber'].value;
  logger.info("artWorkNumber========>",artWorkNumber);
  artWorkService.findAllConditionReportsByArtWorkNumber(req.auth,artWorkNumber).then(function (response) {
        logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.FINDALLCONDITIONRPT_BY_ARTNO, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.FINDALLCONDITIONRPT_BY_ARTNO);
        utils.writeJson(res, response,constants.SUCCESS);
      }).catch(function (response) {
        utils.writeJson(res, response,constants.ERROR_CODE);
      });
  };

  
/**
 * This method will add condition report details.
 * @param {*} req 
 * @param {*} res 
 */
function addConditionReport(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.ADD_CONDITION_REPORT);
  artWorkService.addConditionReport(req, res).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.ADD_CONDITION_REPORT, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.ADD_CONDITION_REPORT);
        utils.writeJson(res, response,constants.SUCCESS);
      }).catch(function (response) {
        utils.writeJson(res, response,constants.ERROR_CODE);
      });
  
  };

  /**
 * This method will get art image.
 * @param {*} req 
 * @param {*} res 
 */
function getArtWorkImage(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ART_WORK_IMAGE);
  var artWorkNumber = req.swagger.params['artWorkNumber'].value;
  logger.info("artWorkNumber========>",artWorkNumber);
  artWorkService.getArtWorkImage(req.auth,artWorkNumber).then(function (response) {
    res.download(response.result);
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ART_WORK_IMAGE, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ART_WORK_IMAGE);
    }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
  };

  /**
 * This method will get art image details.
 * @param {*} req 
 * @param {*} res 
 */
function getArtWorkDetails(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ARTWORK_DETAILS);
  var artWorkNumber = req.swagger.params['artWorkNumber'].value;
  logger.info("artWorkNumber========>",artWorkNumber);
  artWorkService.getArtWorkDetails(req.auth,artWorkNumber).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ARTWORK_DETAILS, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ARTWORK_DETAILS);
    utils.writeJson(res, response,constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
  };

  
   /**
 * This method will get art image details.
 * @param {*} req 
 * @param {*} res 
 */
function getAllArtWork(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ALL_ARTWORK);
  artWorkService.getAllArtWork(req.auth,res).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ALL_ARTWORK, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ALL_ARTWORK);
    utils.writeJson(res, response,constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
  };
  

   /**
 * This method will get condition report details corresponding to conditon
 * report number.
 * @param {*} req 
 * @param {*} res 
 */
function getConditionReportByConditionRptNo(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_CONDITIONRPT_BY_CONDTIONNO);
  var conditionReportNumber = req.swagger.params['conditionReportNumber'].value;
  var outputType = req.swagger.params['outputType'].value;
  logger.info("conditionReportNumber========>",conditionReportNumber);
  logger.info("outputType========>",outputType);
  artWorkService.getConditionReportByConditionRptNo(req.auth,conditionReportNumber,outputType).then(function (response) {
    logger.info('(response.result: ',response.result);
    if(response.result!=undefined && (outputType=="PDF" || outputType=="JSON"))
      res.download(response.result);
    else
      utils.writeJson(res, response,constants.SUCCESS);
      logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_CONDITIONRPT_BY_CONDTIONNO, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_CONDITIONRPT_BY_CONDTIONNO);
  }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
  };

 
 /**
 * This method will get access control corresponding to artworknumber or conditionreportnumber.
 * @param {*} req 
 * @param {*} res 
 */
function getAccessControlList(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ACCESS_CTRLLIST);
  var referenceNumber = req.swagger.params['referenceNumber'].value;
  logger.info("referenceNumber========>",referenceNumber)
  artWorkService.getAccessControlList(req.auth,referenceNumber).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ACCESS_CTRLLIST, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_ACCESS_CTRLLIST);
    utils.writeJson(res, response,constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
  };

  /**
 * This method will update access control.
 * @param {*} req 
 * @param {*} res 
 */
function updateAccessControl(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.UPDATE_ACCESS_CONTROL);
  var referenceNumber = req.body.referenceNumber;
  var operationType = req.body.operationType;
  var operationValue= req.body.operationValue;
  logger.info("referenceNumber========>",referenceNumber);
  logger.info("operationType========>",operationType);
  logger.info("operationValue========>",operationValue);
  artWorkService.updateAccessControl(req.auth,referenceNumber,operationType,operationValue).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.UPDATE_ACCESS_CONTROL, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.UPDATE_ACCESS_CONTROL);
    utils.writeJson(res, response,constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
  };

   /**
 * This method will get all transaction details corresponding to transactiontype.
 * @param {*} req 
 * @param {*} res 
 */
function findAllTransactionByType(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.FIND_ALL_TRANSACTION_BY_TYPE);
  var transactionType = req.swagger.params['transactionType'].value;
  logger.info("transactionType========>",transactionType);
  artWorkService.findAllTransactionByType(req.auth,transactionType).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.FIND_ALL_TRANSACTION_BY_TYPE, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.FIND_ALL_TRANSACTION_BY_TYPE);
    utils.writeJson(res, response,constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
  };
  
  /**
 * This method will get transaction details by reference number.
 * @param {*} req 
 * @param {*} res 
 */
function getTransactionByReferenceNum(req, res) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_TRANSACTION_BY_REFNUM);
  var referenceNumber = req.swagger.params['referenceNumber'].value;
  logger.info("referenceNumber========>",referenceNumber);
  artWorkService.getTransactionByReferenceNum(req.auth,referenceNumber).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_TRANSACTION_BY_REFNUM, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_TRANSACTION_BY_REFNUM);
    utils.writeJson(res, response,constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
  };

  /**
 *
 * This method will get details by transaction id.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function getDetailsByTransactionId(req, res, next) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID);
  var transactionId = req.swagger.params['transactionId'].value;
  logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID, constants.REQUEST +"Fabric Token - "+req.auth.fabricToken);
  artWorkService.getTransactionByTransactionId(req.auth,transactionId).then(function (response) {
    logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID);
    utils.writeJson(res, response, constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response, constants.ERROR_CODE);
  });
}


/**
 * This method will send options method call as a success.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function addArtWorkInfoOptions(req, res, next) {
  logHelper.logMethodEntry(logger, constants.ART_WORK_CONTROLLER_FILE, constants.ADD_ARTWORKINFO_OPTIONS);
  logHelper.logDebug(logger, constants.ART_WORK_CONTROLLER_FILE, constants.OPTIONS_METHOD, constants.REQUEST+"Req Method - "+req.method);
  logHelper.logMethodExit(logger, constants.ART_WORK_CONTROLLER_FILE, constants.ADD_ARTWORKINFO_OPTIONS);
  res.sendStatus(200);
  next();
}