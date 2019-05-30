'use strict';

var utils = require('../utils/writer.js');
var transactionService = require('../service/transactionService');
var constants = require('../config/constants.js');
var config = require('config');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);

module.exports = {
  
  getTransactionsByLcn: getTransactionsByLcn,
  getCurrentBlock: getCurrentBlock,
  getDetailsByTransactionId:getDetailsByTransactionId,
  optionsMethodTransactionFindByLCN: optionsMethodTransaction,
  optionsMethodTransactionFindByTRSId: optionsMethodTransaction,
  optionsMethodFindBlockNo: optionsMethodTransaction
}
 
/**
 *
 * This method will get Transactions by parentId.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function getTransactionsByLcn(req, res, next) {
  logHelper.logMethodEntry(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_TRANSACTION_BY_LCN);
    var loanControlNumber = req.swagger.params['loanControlNumber'].value;
    logHelper.logDebug(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_TRANSACTION_BY_LCN, constants.REQUEST);
    transactionService.getTransactionsByLcn(loanControlNumber).then(function (response) {
      logHelper.logDebug(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_TRANSACTION_BY_LCN, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_TRANSACTION_BY_LCN);
      utils.writeJson(res, response, constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response, constants.ERROR_CODE);
    });
}

/**
 *
 * This method will get current block number.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function getCurrentBlock(req, res, next) {
  logHelper.logMethodEntry(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_CURRENT_BLOCK);
  logHelper.logDebug(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_CURRENT_BLOCK, constants.REQUEST +"Fabric Token - "+req.auth.fabricToken);
  transactionService.getCurrentBlock(req.auth).then(function (response) {
    logHelper.logDebug(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_CURRENT_BLOCK, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_CURRENT_BLOCK);
    utils.writeJson(res, response, constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response, constants.ERROR_CODE);
  });
}
/**
 *
 * This method will get details by transaction id.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function getDetailsByTransactionId(req, res, next) {
  logHelper.logMethodEntry(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID);
  var transactionId = req.swagger.params['transactionId'].value;
  logHelper.logDebug(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID, constants.REQUEST +"Fabric Token - "+req.auth.fabricToken);
  transactionService.getDetailsByTransactionId(req.auth,transactionId).then(function (response) {
    logHelper.logDebug(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.TRANSACTION_CONTROLLER_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID);
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
function optionsMethodTransaction(req, res, next) {
  logHelper.logMethodEntry(logger, constants.NOTIFICATION_CONTROLLER_FILE, constants.OPTIONS_METHOD);
  logHelper.logDebug(logger, constants.NOTIFICATION_CONTROLLER_FILE, constants.OPTIONS_METHOD, constants.REQUEST+"Req Method - "+req.method);
  res.sendStatus(200);
}