'use strict';
var chaincodeService = require('../service/chaincodeService');
var config = require('config');
var fs = require('fs');
var configDetails = fs.readFileSync('config/config.json','utf8');
var configData = JSON.parse(configDetails);
var constants = require('../config/constants.js');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);
var db = require('../api/helpers/CouchDBCommon.js');
var util = require('../utils/util.js'); 
module.exports = {
  addTransaction: addTransaction,
  getTransactionsByReferenceNumber:getTransactionsByReferenceNumber,
  getCurrentBlock:getCurrentBlock,
  getDetailsByTransactionId:getDetailsByTransactionId,
  getTransactionsByTransactionType:getTransactionsByTransactionType,
  getTransactionByReferenceNum:getTransactionByReferenceNum,
  getTransactionByTransactionId:getTransactionByTransactionId
 
}

/**
 *
 * This method will get current block number.
 * @param {*} fabricToken
 * @returns
 */
async function getCurrentBlock(auth) {
  logHelper.logMethodEntry(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_CURRENT_BLOCK);
  logHelper.logDebug(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_CURRENT_BLOCK, constants.REQUEST +"Fabric Token - "+auth.fabricToken);
  try{
    //var originator = configData.chaincodes.peers.Originator;

    var peerName = util.getPeerName(auth.orgName);
    var resp = await chaincodeService.listChannelInfo(auth.fabricToken, configData.channelName, peerName, auth.persona.toLowerCase(), auth.orgName);
    console.log("resp***** ",resp);
    var height = 0;
    if(resp.height.low != "" && resp.height.low != undefined){
      height = (resp.height.low)-1;
      logHelper.logDebug(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_CURRENT_BLOCK, constants.RESPONSE +"Block No. - "+height);
      logHelper.logMethodExit(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_CURRENT_BLOCK);
      return {"blockNo":height};
    } else {
      logHelper.logMethodExit(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_CURRENT_BLOCK);
      return {"blockNo":height};
    }
  } catch(error){
    logHelper.logError(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_CURRENT_BLOCK, error);
    return ({code:constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500})
  } 
}

/**
 *
 * This method will add transaction.
 * @param {*} reqBody
 * @returns
 */
async function addTransaction(reqBody) {
  logHelper.logMethodEntry(logger, constants.TRANSACTION_SERVICE_FILE, constants.ADD_TRANSACTION);
  logHelper.logDebug(logger, constants.TRANSACTION_SERVICE_FILE, constants.ADD_TRANSACTION, constants.REQUEST, reqBody);
    var result = await db.save(reqBody);
      if (Object.keys(result).length > 0) {
        logHelper.logDebug(logger, constants.TRANSACTION_SERVICE_FILE, constants.ADD_TRANSACTION, constants.RESPONSE, result);
        logHelper.logMethodExit(logger, constants.TRANSACTION_SERVICE_FILE, constants.ADD_TRANSACTION);
        return (result[Object.keys(result)[0]]);
      } else {
        return ({code:constants.ERROR_CODE, message: constants.DATA_NOT_ADDED});
      }
}
/**
 *
 * This method will get Transactions by loanControlNumber.
 * @param {*} loanControlNumber
 * @returns
 */
async function getTransactionsByReferenceNumber(referenceNumber)   {
  logHelper.logMethodEntry(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_TRANSACTION_BY_LCN);
  logHelper.logDebug(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_TRANSACTION_BY_LCN, constants.REQUEST );
  try{
    var result = await db.find({"loanControlNumber": referenceNumber.toString(),"transactionId": {"$gte": null}}); 
    var resp = [];
      if (result.length > 0) {
        for(var i = 0; i < result.length; i++) {
          delete result[i]['_rev'];
          delete result[i]['_id'];
          resp.push(result[i]);
        }
        logHelper.logDebug(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_TRANSACTION_BY_LCN, constants.RESPONSE, result);
        logHelper.logMethodExit(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_TRANSACTION_BY_LCN);
        return ({statusCode:constants.SUCCESS, result:resp});
      } else {
        return ({statusCode:constants.NO_CONTENT, result:resp});
      } 
  } catch(error){
    logHelper.logError(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_TRANSACTION_BY_LCN, error);
    return ({code: constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500});
  }
}

/**
 *  This method will get details by transaction id.
 * @param {*} auth 
 * @param {*} requestBody 
 */
async function getDetailsByTransactionId(auth,transactionId ) {
  logHelper.logMethodEntry(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID);
  logHelper.logDebug(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID, constants.REQUEST, transactionId);
  try{
    var loanDetails = [];
    var peerName = await util.getPeerName(auth.orgName);
    var blockData = await chaincodeService.queryBlockByTransactionId(auth.fabricToken, transactionId, peerName, auth.persona.toLowerCase(), auth.orgName);
    console.log("blockData.data.data[0]====>",blockData.data.data[0]);
    if(blockData instanceof Object){
    var blockInfo = {"blockNo":blockData.header.number,
    "timeStamp":blockData.data.data[0].payload.header.channel_header.timestamp
  };
    loanDetails=JSON.parse(blockData.data.data[0].payload.data.actions[0].payload.action.proposal_response_payload.extension.results.ns_rwset[0].rwset.writes[0].value);
     return ({statusCode:constants.SUCCESS, result:{loanDetails,blockInfo}});
    }
    else {
     return ({statusCode:constants.NO_CONTENT, result:blockData});
    } 
    } catch(error){
     
      logHelper.logError(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_DETAILS_BY_TRANSACTION_ID, error);
      return ({code:constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500})
    }
}

/**
 *
 * This method will get Transactions by transactionType.
 * @param {*} loanControlNumber
 * @returns
 */
async function getTransactionsByTransactionType(transactionType)   {
  try{
    var result = await db.find({"transactionType": transactionType.toString(),"transactionId": {"$gte": null}}); 
    var resp = [];
      if (result.length > 0) {
        for(var i = 0; i < result.length; i++) {
          delete result[i]['_rev'];
          delete result[i]['_id'];
          resp.push(result[i]);
        }
        //return ({statusCode:constants.SUCCESS, result:resp});
        return (resp);
      } else {
        return ({statusCode:constants.NO_CONTENT, result:resp});
      } 
  } catch(error){
    logHelper.logError(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_TRANSACTION_BY_LCN, error);
    return ({code: constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500});
  }
}


/**
 *
 * This method will get Transactions by referenceNumber.
 * @param {*} loanControlNumber
 * @returns
 */
async function getTransactionByReferenceNum(referenceNumber)   {
  logger.info("referenceNumber==============>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",referenceNumber);
  try{
    var result = await db.find({"referenceNumber": referenceNumber.toString(),"transactionId": {"$gte": null}}); 
    var resp = [];
      if (result.length > 0) {
        for(var i = 0; i < result.length; i++) {
          delete result[i]['_rev'];
          delete result[i]['_id'];
          resp.push(result[i]);
        }
        //return ({statusCode:constants.SUCCESS, result:resp});
        return (resp);
      } else {
        return ({statusCode:constants.NO_CONTENT, result:resp});
      } 
  } catch(error){
    logHelper.logError(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_TRANSACTION_BY_LCN, error);
    return ({code: constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500});
  }
}

/**
 *
 * This method will get Transactions by loanControlNumber.
 * @param {*} loanControlNumber
 * @returns
 */
async function getTransactionByTransactionId(transactionId)   {
  logger.info("transactionId==============>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",transactionId);
  try{
    var result = await db.find({"transactionId": transactionId.toString()}); 
    var resp = [];
      if (result.length > 0) {
        for(var i = 0; i < result.length; i++) {
          delete result[i]['_rev'];
          delete result[i]['_id'];
          resp.push(result[i]);
        }
        //return ({statusCode:constants.SUCCESS, result:resp});
        return (resp);
      } else {
        return ({statusCode:constants.NO_CONTENT, result:resp});
      } 
  } catch(error){
    logHelper.logError(logger, constants.TRANSACTION_SERVICE_FILE, constants.GET_TRANSACTION_BY_LCN, error);
    return ({code: constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500});
  }
}

