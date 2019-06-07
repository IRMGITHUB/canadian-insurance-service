'use strict';
var fs = require('fs');
var configDetails = fs.readFileSync('config/config.json', 'utf8');
var configData = JSON.parse(configDetails);
var config = require('config');
var constants = require('../config/constants.js');
var util = require('../utils/util.js');
var chaincodeService = require('./chaincodeService');
var transactionService = require('./transactionService');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);
const chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
var JSZip = require("jszip");
var convert = require('xml-js');
const uuidV1 = require('uuid/v1');
const getAllIpNoticeDay = constants.NO_OF_DAYS;
var moment = require('moment');
var json2xls = require('json2xls');
const testMode = configData.TEST_MODE;
const ipLetterSchemaName = "IpLetter";
const loanSchemaName = "Loan";
const unMatchedVal = "Unmatched";

module.exports = {
  readDatafromLoanJson: readDatafromLoanJson,
  addBankLoanInfo: addBankLoanInfo,
  processIpLetters: processIpLetters,
  getIpLetterCountByBankNNoticeDate: getIpLetterCountByBankNNoticeDate,
  getIpLetterDetailsByBankNDate: getIpLetterDetailsByBankNDate,
  getExpiringPoliciesCountOfNdaysByInsurerNDate: getExpiringPoliciesCountOfNdaysByInsurerNDate,
  getExpiringPoliciesDetailsByDateRange: getExpiringPoliciesDetailsByDateRange,
  getExpiredPoliciesCountOfLastNDaysByBankNDate: getExpiredPoliciesCountOfLastNDaysByBankNDate,
  getExpiredPoliciesByBankNDate: getExpiredPoliciesByBankNDate,
  listBankIPLettersByBankNlimit: listBankIPLettersByBankNlimit,
  searchIPNoticesByBank: searchIPNoticesByBank,
  downloadIpLettersByBank : downloadIpLettersByBank,
  uploadIpLetters: uploadIpLetters,
  updateUnmatchIPNotices: updateUnmatchIPNotices,
  listUnmatchedNotices: listUnmatchedNotices,
  downloadUnmatchedNotices: downloadUnmatchedNotices,
  searchIPNotices: searchIPNotices,
  searchIPNoticesByInsurer: searchIPNoticesByInsurer,
  listIPNoticesByInsurer: listIPNoticesByInsurer,
  getAuditorIpCountByNoticeDate: getAuditorIpCountByNoticeDate,
  getIpNoticeByBankAndNoticeDate: getIpNoticeByBankAndNoticeDate,
  getAuditorPoliciesExpiringCount: getAuditorPoliciesExpiringCount,
  getAuditorExpiringPoliciesByBank: getAuditorExpiringPoliciesByBank,
  getExpiredPoliciesCountByDate: getExpiredPoliciesCountByDate,
  getExpiredPoliciesByBankAndDate: getExpiredPoliciesByBankAndDate,
  auditorSearchIpLetterByBank : auditorSearchIpLetterByBank




}

/**
 * This method will read loan json data.
 * @param {*} req 
 * @param {*} res 
 */

function readDatafromLoanJson(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.READ_DATA_FROM_LOAN_JSON);
  logHelper.logDebug(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.READ_DATA_FROM_LOAN_JSON, constants.REQUEST, req);
  try {
    //  var requestBody = req.swagger.params['loanDataJson'].value;;//req.body.loanDataJson;
    logger.info("req.body=========>", req.body);
    const loanJson = req.body;
    var transactionId = util.generateId(constants.TRANSACTION_ID);
    //var uniqueLoanId = "L-" + loanJson.bankName + "-" + loanJson.mortgageNumber;
    var uniqueLoanId = "L-" + util.generateId(constants.LOAN);
    loanJson["uniqueLoanId"] = uniqueLoanId;
    loanJson["schemaName"] = "Loan";
    loanJson["transaction"] = [{
      "transactionId": transactionId,
      "transactionTimeStamp": new Date(),
      "transactionType": "addLoan",
      "actor": req.auth.orgName,
      "createdBy": req.auth.sub
      // "actorReference": loanJson.insuranceProvider,

    }]

    logger.info("loanJson==============>", loanJson);
    logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.READ_DATA_FROM_LOAN_JSON);
    return loanJson;
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.READ_DATA_FROM_LOAN_JSON, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    });
  }
}
/**
 * This method will add bank loan info.
 * @param {*} req 
 * @param {*} res 
 */

async function addBankLoanInfo(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.ADD_LOAN_INFO);
  try {
    var loanJson = await readDatafromLoanJson(req, res);
    if (loanJson) {
      let loanData = JSON.stringify(loanJson);
      var bankName = req.auth.orgName;
      logger.info('bank name : ', bankName, loanJson['bankName']);
      logger.info("testmode=====>", testMode);
      if (loanJson.bankName == bankName.trim() || testMode) {
        var peerName = util.getPeerName(req.auth.orgName);
        var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.addLoanInfo;
        var getLoanResp = await chaincodeService.invokeChainCode(req.auth.fabricToken, loanData, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
        logger.info("getLoanResp=============", getLoanResp);
        if (getLoanResp) {
          var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, getLoanResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
          var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
          var blockNumber = blockData.header.number.toString();
          var reqTransactionData = {
            transactionId: getLoanResp,
            blockchainTimeStamp: timestamp,
            transactionType: 'addLoan',
            blockNo: blockNumber,
            actor: req.auth.orgName,
            // actorReference: loanJson.insuranceProvider,
            createdBy: req.auth.sub,
            referenceNumber: loanJson.uniqueLoanId
          }
          console.log("reqTransactionData=========>", reqTransactionData);
          var transData = await transactionService.addTransaction(reqTransactionData);
          logger.info("transData=============", transData);
          return ({
            statusCode: constants.SUCCESS,
            result: "Success",
            transactionId: getLoanResp
          });
        } else {
          return ({
            statusCode: constants.NO_CONTENT,
            result: constants.MESSAGE_204
          });

        }
      } else {
        return ({
          statusCode: constants.INVALID_INPUT,
          message: constants.INVALID_ORG
        });
      }
    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.ADD_LOAN_INFO, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    });
  }
}

/**
 * This method will process Ip letters.
 * @param {*} req 
 * @param {*} res 
 */

async function processIpLetters(req, res) {

  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.ACKNOWLEDGE_IP_NOTICE);
  try {

    var reqIdWithComma = req.body;
    logger.info('reqIdWithComma ...', reqIdWithComma);
    var reqIdArray = reqIdWithComma.split(',');
    logger.info('reqIdArray ...', reqIdArray, reqIdArray.length);
    for (var i = 0; i < reqIdArray.length; i++) {
      var requestId = reqIdArray[i];
      logger.info('requestId ...', requestId);
      var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
      var peerName = util.getPeerName(req.auth.orgName);
      var fabricToken = req.auth.fabricToken;
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLoanByMortgageNumberByBankId;
      logger.info('chaincodeFunctionName:::------>>>', chaincodeFunctionName);
      var schemaName = "Loan";
      var bankId = req.auth.orgName;
      var chaincodeFunctionNameIpLetter = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByRequestIdAndSchemaAndBankId;
      var schemaNameIp = "IpLetter";
      // find mortgageNumber from ipletter
      var getIPletterMortgageNumberResp = await chaincodeService.queryChainCodeThreeArgs(fabricToken, requestId.trim(), bankId, schemaNameIp, chaincodeName, chaincodeFunctionNameIpLetter, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      console.log('getIPletterMortgageNumberResp------------>', getIPletterMortgageNumberResp, getIPletterMortgageNumberResp.length);
      if (getIPletterMortgageNumberResp.length > 0) {
        var mortgageNumber = getIPletterMortgageNumberResp[0].Record.mortgageNumber;
        logger.info('mortgageNumber---> ', mortgageNumber);
        logger.info('bankId: , getIPletterMortgageNumberResp[0].Record.bankId : ', bankId, getIPletterMortgageNumberResp[0].Record.bankId)
        //=====Shweta1
        var getMortgageNumberResp = await chaincodeService.queryChainCodeThreeArgs(fabricToken, mortgageNumber.toString().trim(), bankId, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
        logger.info("getMortgageNumberResp.from loan...............", getMortgageNumberResp, getMortgageNumberResp.length);
        
        if(getMortgageNumberResp.length>0)
          getIPletterMortgageNumberResp[0].Record.requestStatus = "Matched";
        else
          getIPletterMortgageNumberResp[0].Record.requestStatus = "UnMatched";

        var transactionId = util.generateId(constants.TRANSACTION_ID);
            getIPletterMortgageNumberResp[0].Record.transaction.push({
              "transactionId": transactionId,
              "transactionTimeStamp": new Date(),
              "transactionType": "processingIpLetter",
              "actor": req.auth.orgName,
              "actorReference": getIPletterMortgageNumberResp[0].Record.insuranceProvider,
              "additionalTags": "",
              "createdBy": req.auth.sub
            });

            logger.info('getIPletterMortgageNumberResp0---------->', JSON.stringify(getIPletterMortgageNumberResp[0].Record));
            var chaincodeFunctionNameip = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
            var ipletterupdateResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getIPletterMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
            logger.info('ipletterupdateResp', ipletterupdateResp);
            if (ipletterupdateResp) {
              var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, ipletterupdateResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
              var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
              var blockNumber = blockData.header.number.toString();
              var reqTransactionData = {
                transactionId: ipletterupdateResp,
                blockchainTimeStamp: timestamp,
                transactionType: 'processingIpLetter',
                blockNo: blockNumber,
                actor: req.auth.orgName,
                actorReference: getIPletterMortgageNumberResp[0].Record.insuranceProvider, //loanJson.insuranceProvider,
                createdBy: req.auth.sub,
                referenceNumber: getIPletterMortgageNumberResp[0].Record.requestId
              }
              console.log("reqTransactionData=========>", reqTransactionData);
              var transData = await transactionService.addTransaction(reqTransactionData);
              logger.info("transData=============", transData);
        //=====Shweta2
       // if (bankId == getIPletterMortgageNumberResp[0].Record.bankId) {
        if (getMortgageNumberResp.length>0) {
          logger.info('getIPletterMortgageNumberResp-from ipletter--------->', getIPletterMortgageNumberResp);
          logger.info('getIPletterMortgageNumberResp[0].Record.requestStatus---------->', getIPletterMortgageNumberResp[0].Record.requestStatus);
          // find mortgageNumber from loan
          
          //if (getMortgageNumberResp.length>0) {
            logger.info('getMortgageNumberResp:----->> ', getMortgageNumberResp);
            // update requestStatus in ipletter match   --> getIpLetterByMortgageNumberAndSchemaAndBankId
            // var chaincodeFunctionNameIpLetter = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByMortgageNumber;
            //getIPletterMortgageNumberResp[0].Record.requestStatus = "Matched"; //Shweta3
            
           // }
            // update policyno in loan from policyno from ipletter
            logger.info('getMortgageNumberResp[0].Record.mortgageNumber', getMortgageNumberResp[0].Record.mortgageNumber);
            logger.info('getIPletterMortgageNumberResp[0].Record.mortgageNumber', getIPletterMortgageNumberResp[0].Record.mortgageNumber);
            if (getMortgageNumberResp[0].Record.mortgageNumber == getIPletterMortgageNumberResp[0].Record.mortgageNumber) {
              //update loan 
              getMortgageNumberResp[0].Record.policyNumber = getIPletterMortgageNumberResp[0].Record.policyNumber;
              getMortgageNumberResp[0].Record.policyStatus = getIPletterMortgageNumberResp[0].Record.policyStatus;
              getMortgageNumberResp[0].Record.policyExpiringdate = getIPletterMortgageNumberResp[0].Record.policyExpiringdate;
              getMortgageNumberResp[0].Record.loanAmount = getIPletterMortgageNumberResp[0].Record.loanAmount;
              getMortgageNumberResp[0].Record.insuredvalue = getIPletterMortgageNumberResp[0].Record.insuredvalue;
              getMortgageNumberResp[0].Record.propertyID = getIPletterMortgageNumberResp[0].Record.propertyID;
              var transactionId = util.generateId(constants.TRANSACTION_ID);

              getMortgageNumberResp[0].Record.transaction.push({
                "transactionId": transactionId,
                "transactionTimeStamp": new Date(),
                "transactionType": "updatePolicydetails",
                "actor": req.auth.orgName,
                "createdBy": req.auth.sub
                // "actorReference": getMortgageNumberResp[0].Record.insuranceProvider
              });

              logger.info('getPolicyNumberResp[0].Record---->', getMortgageNumberResp[0].Record);
              var chaincodeFunctionNameAddLoan = configData.chaincodes.canadianInsuranceInfo.functions.addLoan;
              var loanupdateResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameAddLoan, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
              logger.info('loanupdateResp---------------->>>>', loanupdateResp);
              if (loanupdateResp != 0) {
                //add loan transaction in offchain
                var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, loanupdateResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
                var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
                var blockNumber = blockData.header.number.toString();
                var reqTransactionData = {
                  transactionId: ipletterupdateResp1,
                  blockchainTimeStamp: timestamp,
                  transactionType: 'updatePolicydetails',
                  blockNo: blockNumber,
                  actor: req.auth.orgName,
                  // actorReference: getIPletterMortgageNumberResp[0].Record.insuranceProvider,     //loanJson.insuranceProvider,
                  createdBy: req.auth.sub,
                  referenceNumber: getMortgageNumberResp[0].Record.uniqueLoanId
                }
                console.log("reqTransactionData=========>", reqTransactionData);
                var transData = await transactionService.addTransaction(reqTransactionData);
                logger.info("transData=============", transData);
                // update requestStatus in ipletter  Processed
                getIPletterMortgageNumberResp[0].Record.requestStatus = "Processed";
                var transactionId = util.generateId(constants.TRANSACTION_ID);
                getIPletterMortgageNumberResp[0].Record.transaction.push({
                  "transactionId": transactionId,
                  "transactionTimeStamp": new Date(),
                  "transactionType": "processedIpLetter",
                  "actor": req.auth.orgName,
                  "actorReference": getIPletterMortgageNumberResp[0].Record.insuranceProvider,
                  "additionalTags": "",
                  "createdBy": req.auth.sub
                });
                logger.info('getIPletterMortgageNumberResp01---------->', JSON.stringify(getIPletterMortgageNumberResp[0].Record));
                var ipletterupdateResp1 = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getIPletterMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
                logger.info('ipletterupdateResp1 :', ipletterupdateResp1);
                if (ipletterupdateResp1) {
                  var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, ipletterupdateResp1, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
                  var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
                  var blockNumber = blockData.header.number.toString();
                  var reqTransactionData = {
                    transactionId: ipletterupdateResp1,
                    blockchainTimeStamp: timestamp,
                    transactionType: 'processedIpLetter',
                    blockNo: blockNumber,
                    actor: req.auth.orgName,
                    actorReference: getIPletterMortgageNumberResp[0].Record.insuranceProvider, //loanJson.insuranceProvider,
                    createdBy: req.auth.sub,
                    referenceNumber: getIPletterMortgageNumberResp[0].Record.requestId
                  }
                  console.log("reqTransactionData=========>", reqTransactionData);
                  var transData = await transactionService.addTransaction(reqTransactionData);
                  logger.info("transData=============", transData);
                }
              }
            }
          } else {
            // for unmatch 
           // getIPletterMortgageNumberResp[0].Record.requestStatus = "Unmatched";
            var transactionId = util.generateId(constants.TRANSACTION_ID);
            getIPletterMortgageNumberResp[0].Record.transaction.push({
              "transactionId": transactionId,
              "transactionTimeStamp": new Date(),
              "transactionType": "ProcessedfFailIpLetter",
              "actor": req.auth.orgName,
              "actorReference": getIPletterMortgageNumberResp[0].Record.insuranceProvider,
              "additionalTags": "",
              "createdBy": req.auth.sub
            });
            logger.info('getIPletterPolicyNumberResp0---------->', JSON.stringify(getIPletterMortgageNumberResp[0].Record));
            var chaincodeFunctionNameip = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
            var ipletterupdateResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getIPletterMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
            logger.info('ipletterupdateResp unmatch : -> ', ipletterupdateResp);
            if (ipletterupdateResp) {
              var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, ipletterupdateResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
              var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
              var blockNumber = blockData.header.number.toString();
              var reqTransactionData = {
                transactionId: ipletterupdateResp,
                blockchainTimeStamp: timestamp,
                transactionType: 'ProcessedFailIpLetter',
                blockNo: blockNumber,
                actor: req.auth.orgName,
                actorReference: getIPletterMortgageNumberResp[0].Record.insuranceProvider, //loanJson.insuranceProvider,
                createdBy: req.auth.sub,
                referenceNumber: getIPletterMortgageNumberResp[0].Record.requestId
              }
              console.log("reqTransactionData=========>", reqTransactionData);
              var transData = await transactionService.addTransaction(reqTransactionData);
              logger.info("transData=============", transData);
            }

          }

        } else {
          console.log("else part ....");
          var chaincodeFunctionNameIpLetter = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByMortgageNumber;
          var schemaNameIp = "IpLetter";
          var getIPletterMortgageNumberResp = await chaincodeService.queryChainCodeTwoArgs(fabricToken, mortgageNumber.trim(), schemaNameIp, chaincodeName, chaincodeFunctionNameIpLetter, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
          getIPletterMortgageNumberResp[0].Record.requestStatus = "Unmatched";
          var transactionId = util.generateId(constants.TRANSACTION_ID);
          getIPletterMortgageNumberResp[0].Record.transaction.push({
            "transactionId": transactionId,
            "transactionTimeStamp": new Date(),
            "transactionType": "ProcessedfFailIpLetter",
            "actor": req.auth.orgName,
            "actorReference": getIPletterMortgageNumberResp[0].Record.insuranceProvider,
            "additionalTags": "",
            "createdBy": req.auth.sub
          });
          logger.info('getIPletterPolicyNumberResp0---------->', JSON.stringify(getIPletterMortgageNumberResp[0].Record));
          var chaincodeFunctionNameip = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
          var ipletterupdateResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getIPletterMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
          logger.info('ipletterupdateResp unmatch : -> ', ipletterupdateResp);
          if (ipletterupdateResp) {
            var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, ipletterupdateResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
            var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
            var blockNumber = blockData.header.number.toString();
            var reqTransactionData = {
              transactionId: ipletterupdateResp,
              blockchainTimeStamp: timestamp,
              transactionType: 'ProcessedFailIpLetter',
              blockNo: blockNumber,
              actor: req.auth.orgName,
              actorReference: getIPletterMortgageNumberResp[0].Record.insuranceProvider, //loanJson.insuranceProvider,
              createdBy: req.auth.sub,
              referenceNumber: getIPletterMortgageNumberResp[0].Record.requestId
            }
            console.log("reqTransactionData=========>", reqTransactionData);
            var transData = await transactionService.addTransaction(reqTransactionData);
            logger.info("transData=============", transData);
          }
        }
      }
      /*else {
             return ({
               statusCode: constants.SUCCESS,
               result: "invalid org name"
             });
           }*/
    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.ACKNOWLEDGE_IP_NOTICE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  } finally {
    return ({
      statusCode: constants.SUCCESS,
      result: "IP letter Processed Successfully!!!"
    });
  }
}


/**
 * This method will get ip notice count of bank by notice date range.
 * @param {*} req 
 * @param {*} res 
 */

async function getIpLetterCountByBankNNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IPLETTER_COUNT_BY_BANKNNOTICEDATE);
  try {
    var noOfDays = req.swagger.params['days'].value;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterCountByNoticeDateAndBankId;
    var result = [];
    var awaitResults = [];
    var authOwnerId = req.auth.orgName;
    for (var i = 0; i < noOfDays; i++) {
      var noticeDate1 = moment().subtract(i, 'days').format('YYYY-MM-DD');
      var noticeDate = noticeDate1 + " 00:00:00"
      logger.info("noticeDate=========>", noticeDate);
      result[i] = chaincodeService.queryChainCodeTwoArgs(req.auth.fabricToken, noticeDate.toString().trim(), authOwnerId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      awaitResults[i] = result[i];
    }
    var finalJson = await Promise.all(awaitResults).then((res) => {
      logger.info("final res=>", res);
      return res;
    });
    if (finalJson) {
      return ({
        statusCode: constants.SUCCESS,
        result: "Success",
        transactionId: finalJson
      });
    } else {
      return ({
        statusCode: constants.INTERNAL_SERVER_ERROR,
        result: constants.MESSAGE_500
      });

    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IPLETTER_COUNT_BY_BANKNNOTICEDATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will get Ip Letter details by Bank And notice date.
 * @param {*} req 
 * @param {*} res 
 */

async function getIpLetterDetailsByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IPLETTER_DETAILS_BY_BANKNDATE);
  try {
    var noticeDate = req.swagger.params['noticeDate'].value + " 00:00:00";
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpNoticeByNoticeDate;
    var schemaName = "IpLetter";
    var bankId = req.auth.orgName;
    var getIpLetterNoticeDateResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken, noticeDate.toString().trim(), bankId, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpLetterNoticeDateResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpLetterNoticeDateResp)
      });
    else
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IPLETTER_DETAILS_BY_BANKNDATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}


/**
 * This method will get expiring IP letter count of next n days by insurer
 *  and expire date range.
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiringPoliciesCountOfNdaysByInsurerNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRING_IPLETTER_COUNT_OFNDAYS_BY_INSURERNDATE);
  try {

    var daysValue = req.swagger.params['days'].value;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLoanExpiringByDateRangeAndBankId;
    var dateFrom1 = moment().format('YYYY-MM-DD');
    var dateFrom = dateFrom1 + " 23:59:59";
    var dateTo1 = moment().add(parseInt(daysValue), 'days').format('YYYY-MM-DD');
    var dateTo = dateTo1 + " 23:59:59";
    logger.info('dateFrom : ,dateTo :  -----> ', dateFrom, dateTo);
    var bankId = req.auth.orgName;
    var getIpLetterExpiredPoliciesByDateResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, dateFrom.toString().trim(), dateTo.toString().trim(), loanSchemaName, bankId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    var myObject = {};
    for (var i = 0; i < getIpLetterExpiredPoliciesByDateResp.length; i++) {
      var key = getIpLetterExpiredPoliciesByDateResp[i].Record.insuranceProvider
      logger.info(getIpLetterExpiredPoliciesByDateResp[i].Record.insuranceProvider);
      if (myObject.hasOwnProperty(key)) {
        myObject[key] += 1;
      } else {
        myObject[key] = 1;
      }
    }
    return ({
      statusCode: constants.SUCCESS,
      result: util.convertData(getIpLetterExpiredPoliciesByDateResp, constants.INSURANCE_PROVIDER)
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRING_IPLETTER_COUNT_OFNDAYS_BY_INSURERNDATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will get expiring IP leter details of next n days
 * by expringdate range.
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiringPoliciesDetailsByDateRange(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRING_IPLETTER_DETAILS_BY_DATERANGE);
  try {
    var insurerName = req.swagger.params['insurerName'].value;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLoanByExpireDateRangeAndInsurer;
    var dateFrom1 = moment().format('YYYY-MM-DD');
    var dateFrom = dateFrom1 + " 00:00:00";
    var dateTo1 = moment().add(getAllIpNoticeDay, 'days').format('YYYY-MM-DD');
    var dateTo = dateTo1 + " 00:00:00";
    var bankId = req.auth.orgName;
    var getIpLetterNoticeDateResp = await chaincodeService.queryChainCodeFiveArgs(req.auth.fabricToken, dateFrom.toString().trim(), dateTo.toString().trim(), insurerName.trim(), bankId, loanSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpLetterNoticeDateResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpLetterNoticeDateResp)
      });
    else
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_204
      });

  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRING_IPLETTER_DETAILS_BY_DATERANGE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}



/**
 * This method will get expired  ip letter count of last n days by bank and 
 * expring date range.
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiredPoliciesCountOfLastNDaysByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRED_IP_COUNT_OF_LAST_NDAYS_BY_BANKNDATE);
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLaonByExpiringByDateRangeAndBankId;
    var noOfDays = req.swagger.params['days'].value;
    var fromExpiredDate1 = moment().subtract(noOfDays, 'days').format('YYYY-MM-DD');
    var fromExpiredDate = fromExpiredDate1 + " 23:59:59";
    var toExpiredDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var toExpiredDate = toExpiredDate1 + " 23:59:59";
    logger.info("fromExpiredDate=========>", fromExpiredDate);
    logger.info("toExpiredDate=========>", toExpiredDate);
    var bankId = req.auth.orgName;
    var getExpiredPolicyResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, fromExpiredDate.toString().trim(), toExpiredDate.toString().trim(), loanSchemaName, bankId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    var myObject = {};
    for (var i = 0; i < getExpiredPolicyResp.length; i++) {
      var key = getExpiredPolicyResp[i].Record.policyExpiringDate;
      if (myObject.hasOwnProperty(key)) {
        myObject[key] += 1;
      } else {
        myObject[key] = 1;
      }
    }
    if (myObject) {
      return ({
        statusCode: constants.SUCCESS,
        result: "Success",
        result: util.convertData(getExpiredPolicyResp, constants.POLICY_EXPIRING_DATE)
      });
    } else {
      return ({
        statusCode: constants.INTERNAL_SERVER_ERROR,
        result: constants.MESSAGE_500
      });

    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRED_IP_COUNT_OF_LAST_NDAYS_BY_BANKNDATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will get expired IP lettter by bank 
 * and expire date.
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiredPoliciesByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRED_IPLETTER_BY_BANK_N_DATE);
  try {

    var dateValue1 = req.swagger.params['date'].value;
    var dateValue = dateValue1 + " 23:59:59";
    logger.info('dateValue.....', dateValue);
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLoanExpiredPoliciesDetailsByDateAndBankId;
    var bankId = req.auth.orgName;
    var getIpLetterExpiredPoliciesByDateResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, dateValue.toString().trim(), loanSchemaName, bankId, "", chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpLetterExpiredPoliciesByDateResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpLetterExpiredPoliciesByDateResp)
      });
    else
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRED_IPLETTER_BY_BANK_N_DATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function listBankIPLettersByBankNlimit(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_BANK_IPLETTERS_BY_BANK_N_LIMIT);
  try {
    var count = req.swagger.params['count'].value;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.listIPNotices;
    var bankId = req.auth.orgName;
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, ipLetterSchemaName, bankId, count.toString(), "", chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpNoticeResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromlimitQueryResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_BANK_IPLETTERS_BY_BANK_N_LIMIT, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will Search ip notices by bank.
 * @param {*} req 
 * @param {*} res 
 */

async function searchIPNoticesByBank(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IPNOTICES_BY_BANK);
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var attributeName = req.swagger.params['attributeName'].value;
    var attributeValue = req.swagger.params['attributeValue'].value;
    var bankId = req.auth.orgName;
    logger.info("attributeName==attributeValue==", attributeName, "=attributeValue=", attributeValue);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.searchIPNoticesByBank;
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, attributeName, attributeValue, ipLetterSchemaName, bankId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpNoticeResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IPNOTICES_BY_BANK, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}
/**
 * This method will download Unmatched Ip Letters
 * @param {*} req 
 * @param {*} res 
 */

async function downloadIpLettersByBank(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.DOWNLOAD_UNMATCHED_NOTICES);
    try {
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.downloadIpLettersByBank;
      var bankId = req.auth.orgName;
      var getIpLettersResp = await chaincodeService.queryChainCodeTwoArgs(req.auth.fabricToken, ipLetterSchemaName,bankId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      logger.info("getIpLettersResp========>",getIpLettersResp);
      if (getIpLettersResp.length > 0) {
        var xls = json2xls(util.getResultArrayfromBlockChainResult(getIpLettersResp));
        var fileName = uuidV1();
        var filePath = configData.CANADIAN_INSURANCE_FILE_LOCATION + fileName + ".xlsx";
        logger.info("filePath===========>", filePath);
        fs.writeFileSync(filePath, xls, 'binary');
        return ({
          statusCode: constants.SUCCESS,
          result: filePath,
        });
      } else
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_204
        });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.DOWNLOAD_UNMATCHED_NOTICES, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  }

/**
 * This method will upload IP letters by service provider IRM.
 * @param {*} req 
 * @param {*} res 
 */

async function uploadIpLetters(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPLOAD_IP_LETTERS);
  if (req.auth.orgName == constants.IRM || testMode) {
    try {
      var uploadFilePath = await getUploadZipFilePath(req, res);
      logger.info('uploadFilePath---->', uploadFilePath);
      var jsonDataFromXML = await readZipFile(uploadFilePath, req, res);
      logger.info('jsonDataFromXML2---> ', jsonDataFromXML);
      return ({
        statusCode: constants.SUCCESS,
        result: "Files uploaded Successully"
      });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPLOAD_IP_LETTERS, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else {
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
  }
}

/**
 * This method will upload zip file
 * @param {*} req 
 * @param {*} res 
 */

async function getUploadZipFilePath(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_UPLOAD_ZIP_FILE_PATH);
  const uploadIPNotices = req.files.uploadIPNotices;
  logger.info('uploadIPNotices-->', uploadIPNotices);
  var fileName = uuidV1();
  var filePath = '';
  let path = configData.CANADIAN_INSURANCE_FILE_LOCATION + fileName;
  logger.info('path: ', path);
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  uploadIPNotices.forEach(function (file) {
    logger.info('getUploadZipFilePath : file--->', file);
    var datetimestamp = Date.now();
    var inputString = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];
    fs.writeFile(path + '/' + inputString, file.buffer, function (err) {
      if (err) {
        debug(err);
        var err = {
          message: constants.File_Not_Uploaded
        };
      }
    });
    filePath = path + '/' + inputString;
    logger.info('filePath....jszip--->', path);

  });

  return filePath;
}

/**
 * This method will read IP letter xml file
 * from zip folder.
 * @param {*} filePath 
 * @param {*} req 
 * @param {*} res 
 */

async function readZipFile(filePath, req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.READ_ZIP_FILE);
  logger.info('read fPath--> ', filePath);
  var arrayData = [];
  fs.readFile(filePath, function (err, data) {
    if (err) throw err;
    JSZip.loadAsync(data).then(function (zip) {
      var files = Object.keys(zip.files);
      logger.info('files---------->', files);
      files.forEach(function (file) {
        zip.file(file).async("string").then(function (data) {
          var jsonFromXML = convert.xml2json(data, {
            compact: true,
            trim: true,
            ignoreDeclaration: true,
            ignoreInstruction: true,
            ignoreAttributes: true,
            ignoreComment: true,
            ignoreCdata: true,
            ignoreDoctype: true,
            textFn: removeJsonTextAttribute
          }); //JSON.parse(parser.toJson(data, {reversible: true}));
          arrayData.push(jsonFromXML);
          logger.info('------jsonFromXML--------------', jsonFromXML);
          chainCodeCall(jsonFromXML, req, res);

        });
      });
    });

  });

  return arrayData;
}

/**
 * This method will call chain code.
 * from zip folder.
 * @param {*} jsonFromXML 
 * @param {*} req 
 * @param {*} res 
 */


async function chainCodeCall(jsonFromXML, req, res) {
  var transactionId = util.generateId(constants.TRANSACTION_ID);
  //  for chain code 
  var requestBody1 = JSON.parse(jsonFromXML).ipletter;
  logger.info("req.auth.orgName : , requestBody1.bankId :   ", req.auth.orgName, requestBody1.bankId);
  //if (req.auth.orgName == requestBody1.bankId.trim()) {
  //requestBody1["requestId"] = requestBody1.bankId + "-" + requestBody1.mortgageNumber;
  requestBody1["requestId"] = "IP-"+util.generateId(constants.REQUEST_ID);
  requestBody1["schemaName"] = "IpLetter";
  requestBody1["transaction"] = [{
    "transactionId": transactionId,
    "transactionTimeStamp": new Date(),
    "transactionType": "addIpLetter",
    "actor": req.auth.orgName,
    "actorReference": requestBody1.insuranceProvider,
    "additionalTags": "",
    "createdBy": req.auth.sub
  }]
  logger.info('requestBody1:  ', requestBody1);
  var requestBody = JSON.stringify(requestBody1);
  logger.info('requestBody:  ', requestBody);
  // var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
  var peerName = util.getPeerName(req.auth.orgName);
  var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
  var insuranceFileResp = await chaincodeService.invokeChainCode(req.auth.fabricToken, requestBody, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
  if (insuranceFileResp.length <= 0) {
    return ({
      statusCode: constants.NO_CONTENT,
      result: constants.MESSAGE_204
    });
  } else {
    var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, insuranceFileResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
    var blockNumber = blockData.header.number.toString();
    var reqTransactionData = {
      transactionId: insuranceFileResp,
      dateTime: timestamp,
      transactionType: 'addIPLetter',
      blockno: blockNumber,
      actor: req.auth.orgName,
      actorReference: requestBody1.insuranceProvider,
      createdBy: req.auth.sub,
      referenceNumber: requestBody1.requestId
    }
    logger.info("reqTransactionData=========>", reqTransactionData);
    var transData = await transactionService.addTransaction(reqTransactionData);
    logger.info("transData=============", transData);
  }
  // }

}

function nativeType(value) {
  var nValue = Number(value);
  if (!isNaN(nValue)) {
    return nValue.toString();
  }
  var bValue = value.toLowerCase();
  if (bValue === 'true') {
    return true;
  } else if (bValue === 'false') {
    return false;
  }
  return value.toString();
}

var removeJsonTextAttribute = function (value, parentElement) {
  try {
    var keyNo = Object.keys(parentElement._parent).length;
    var keyName = Object.keys(parentElement._parent)[keyNo - 1];
    parentElement._parent[keyName] = nativeType(value);
  } catch (e) {}
}

/**
 * This method will update unmatch notices
 * @param {*} req 
 * @param {*} res 
 */


async function updateUnmatchIPNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPDATE_UNMATCH_IPNOTICES);
  if (req.auth.orgName == constants.IRM || testMode) {
    try {
      var uploadFilePath = await getUpdateZipFilePath(req, res);
      logger.info('uploadFilePath---->', uploadFilePath);
      var jsonDataFromXML = await updateReadZipFile(uploadFilePath, req, res);
      logger.info('jsonDataFromXML2---> ', jsonDataFromXML);
      return ({
        statusCode: constants.SUCCESS,
        result: "file uploaded successfully"
      });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPDATE_UNMATCH_IPNOTICES, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else {
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
  }
}

/**
 * This method will Zip file path
 * @param {*} req 
 * @param {*} res 
 */

async function getUpdateZipFilePath(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_UPDATE_ZIP_FILE_PATH);
  const uploadIPNotices = req.files.updateUnmatchIPNotices;
  logger.info('uploadIPNotices-->', uploadIPNotices);
  var fileName = uuidV1();
  var filePath = '';
  let path = configData.CANADIAN_INSURANCE_FILE_LOCATION + fileName;
  logger.info('path: ', path);
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  uploadIPNotices.forEach(function (file) {
    logger.info('getUploadZipFilePath : file--->', file);
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
    filePath = path + '/' + inputString;
    logger.info('filePath....jszip--->', path);

  });

  return filePath;
}

/**
 * This method will  read files under  Zip file
 * @param {*} req 
 * @param {*} res 
 */

async function updateReadZipFile(filePath, req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPDATE_READ_ZIP_FILE);
  logger.info('read fPath--> ', filePath);
  var arrayData = [];
  fs.readFile(filePath, function (err, data) {
    if (err) throw err;
    JSZip.loadAsync(data).then(function (zip) {
      var files = Object.keys(zip.files);
      logger.info('files---------->', files);
      files.forEach(function (file) {
        zip.file(file).async("string").then(function (data) {
          var jsonFromXML = convert.xml2json(data, {
            compact: true,
            trim: true,
            ignoreDeclaration: true,
            ignoreInstruction: true,
            ignoreAttributes: true,
            ignoreComment: true,
            ignoreCdata: true,
            ignoreDoctype: true,
            textFn: removeJsonTextAttribute
          });
          arrayData.push(jsonFromXML);
          logger.info('------jsonFromXML--------------', jsonFromXML);
          updateChainCodeCall(jsonFromXML, req, res);

        });
      });
    });

  });
  return arrayData;
}

/**
 * This method will  will update Ip letter
 * @param {*} req 
 * @param {*} res 
 */


async function updateChainCodeCall(jsonFromXML, req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPDATE_CHAINCODE_CALL);
  var transactionId = util.generateId(constants.TRANSACTION_ID);
  //  for chain code 
  var requestBody1 = JSON.parse(jsonFromXML).ipletter;
  // requestBody1["requestId"] = util.generateId('requestId');
  requestBody1["schemaName"] = "IpLetter";
  requestBody1["transaction"] = [{
    "transactionId": transactionId,
    "transactionTimeStamp": new Date(),
    "transactionType": "re-addIpLetter",
    "actor": req.auth.orgName,
    "actorReference": requestBody1.insuranceProvider,
    "additionalTags": "",
    "createdBy": req.auth.sub
  }]

  var requestId = requestBody1["requestId"];
  logger.info('requestId--->', requestId);
  logger.info('requestBody1:  ', requestBody1);
  var requestBody = JSON.stringify(requestBody1);
  logger.info('requestBody:  ', requestBody);
  var peerName = util.getPeerName(req.auth.orgName);
  var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByRequestId;
  var getIpLetterReqIdResp = await chaincodeService.queryChainCodeTwoArgs(req.auth.fabricToken, requestId.trim(), ipLetterSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
  console.log("getIpLetterReqIdResp--->", getIpLetterReqIdResp);
  if (getIpLetterReqIdResp.length > 0) {
    //  getIpLetterReqIdResp[0].Record.requestId =  requestBody1["requestId"];
    getIpLetterReqIdResp[0].Record.mortgageNumber = requestBody1["mortgageNumber"];
    getIpLetterReqIdResp[0].Record.insuranceProvider = requestBody1["insuranceProvider"];
    getIpLetterReqIdResp[0].Record.policyNumber = requestBody1["policyNumber"];
    getIpLetterReqIdResp[0].Record.policyExpiringDate = requestBody1["policyExpiringDate"];
    getIpLetterReqIdResp[0].Record.insuredValue = requestBody1["insuredValue"];
    getIpLetterReqIdResp[0].Record.policyStatus = requestBody1["policyStatus"];
    getIpLetterReqIdResp[0].Record.lotBatchNumber = requestBody1["lotBatchNumber"];
    getIpLetterReqIdResp[0].Record.noticeDate = requestBody1["noticeDate"];
    getIpLetterReqIdResp[0].Record.requestStatus = "New";
    getIpLetterReqIdResp[0].Record.transaction.push({
    "transactionId": transactionId,
    "transactionTimeStamp": new Date(),
    "transactionType": "re-addIpLetter",
    "actor": req.auth.orgName,
    "actorReference": requestBody1.insuranceProvider,
    "additionalTags": "",
    "createdBy": req.auth.sub
    });
    
    logger.info('getIpLetterReqIdResp---------->', JSON.stringify(getIpLetterReqIdResp[0].Record));
    var chaincodeFunctionNameip = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
    var ipletterupdateResp = await chaincodeService.invokeChainCode(req.auth.fabricToken, JSON.stringify(getIpLetterReqIdResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info('ipletterupdateResp unmatch : -> ', ipletterupdateResp);
    if (ipletterupdateResp) {
      var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, ipletterupdateResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
      var blockNumber = blockData.header.number.toString();
      var reqTransactionData = {
        transactionId: ipletterupdateResp,
        dateTime: timestamp,
        transactionType: 're-addIpLetter',
        blockno: blockNumber,
        actor: req.auth.persona,
        actorReference: requestId,
        createdBy: req.auth.sub,
        referenceNumber: requestId
      }
      logger.info("reqTransactionData=========>", reqTransactionData);
      var transData = await transactionService.addTransaction(reqTransactionData);
      logger.info("transData=============", transData);
      return ({
        statusCode: constants.SUCCESS,
        result: "Success",
        transactionId: ipletterupdateResp
      });
    }
    return ({
      statusCode: constants.NO_CONTENT,
      result: constants.MESSAGE_204
    });

  }

  if (getIpLetterReqIdResp.length <= 0) {
    return ({
      statusCode: constants.NO_CONTENT,
      result: constants.MESSAGE_500
    });
  }

}

/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function listUnmatchedNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_UNMATCHED_NOTICES);
  if (req.auth.orgName = constants.IRM || testMode) {
    try {
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getListUnmatchedNotices;
      var getUnmatchedResp = await chaincodeService.queryChainCodeTwoArgs(req.auth.fabricToken, unMatchedVal, ipLetterSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      if (getUnmatchedResp.length > 0)
        return ({
          statusCode: constants.SUCCESS,
          result: util.getResultArrayfromBlockChainResult(getUnmatchedResp)
        });
      else
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_204
        });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_UNMATCHED_NOTICES, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });

}

/**
 * This method will download Unmatched Ip Letters
 * @param {*} req 
 * @param {*} res 
 */

async function downloadUnmatchedNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.DOWNLOAD_UNMATCHED_NOTICES);
  if (req.auth.orgName = constants.IRM || testMode) {
    try {
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getListUnmatchedNotices;
      var getUnmatchedResp = await chaincodeService.queryChainCodeTwoArgs(req.auth.fabricToken, "", ipLetterSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      if (getUnmatchedResp.length > 0) {
        var xls = json2xls(util.getResultArrayfromBlockChainResult(getUnmatchedResp));
        var fileName = uuidV1();
        var filePath = configData.CANADIAN_INSURANCE_FILE_LOCATION + fileName + ".xlsx";
        logger.info("filePath===========>", filePath);
        fs.writeFileSync(filePath, xls, 'binary');
        return ({
          statusCode: constants.SUCCESS,
          result: filePath,
        });
      } else
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_204
        });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.DOWNLOAD_UNMATCHED_NOTICES, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
}

/**
 * This method will search Ip letters by IRM.
 * @param {*} req 
 * @param {*} res 
 */

async function searchIPNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IP_NOTICES);
  if (req.auth.orgName == constants.IRM || testMode) {
    try {
      var peerName = util.getPeerName(req.auth.orgName);
      var attributeName = req.swagger.params['attributeName'].value;
      var attributeValue = req.swagger.params['attributeValue'].value;
      logger.info("attributeName==attributeValue==", attributeName, "=attributeValue=", attributeValue);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.searchIPNotices;
      var getIpNoticeResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken, attributeName, attributeValue, ipLetterSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      if (getIpNoticeResp.length > 0)
        return ({
          statusCode: constants.SUCCESS,
          result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
        });
      else
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_204
        });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IP_NOTICES, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
}

/**
 * This method will search Ip notices by Insurer.
 * @param {*} req 
 * @param {*} res 
 */

async function searchIPNoticesByInsurer(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IPNOTICES_BY_INSURER);
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var attributeName = req.swagger.params['attributeName'].value;
    var attributeValue = req.swagger.params['attributeValue'].value;
    var insurerName = req.swagger.params['insurerName'].value;
    logger.info("attributeName==attributeValue==", attributeName, "=attributeValue=", attributeValue);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.searchIPNoticeByInsurer;
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, attributeName, attributeValue, ipLetterSchemaName, insurerName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpNoticeResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IPNOTICES_BY_INSURER, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}
/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function listIPNoticesByInsurer(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_IPNOTICES_BY_INSURER);
  try {
    var count = req.swagger.params['count'].value;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.listIPNoticesByInsurer;
    var insuerId = req.auth.orgName;
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, insuerId, ipLetterSchemaName, count.toString(), "", chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    console.log(getIpNoticeResp);
    if (getIpNoticeResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromlimitQueryResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_BANK_IPLETTERS_BY_BANK_N_LIMIT, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}


/**
 * This method will get ip letter count by notice date used by auditor.
 * @param {*} req 
 * @param {*} res 
 */

async function getAuditorIpCountByNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
  var noOfdays = req.swagger.params['days'].value; 
  if (req.auth.orgName = constants.AUDITOR || testMode) {
    try {
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByNoticeDateRangeAndSchemaName;
      var fromNoticeDate1 = moment().subtract(noOfdays, 'days').format('YYYY-MM-DD');
      var fromNoticeDate = fromNoticeDate1 + " 00:00:00";
      var toNoticeDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
      var toNoticeDate = toNoticeDate1 + " 00:00:00";
      var getIpNoticeResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken, fromNoticeDate.toString(), toNoticeDate.toString(), ipLetterSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      var myObject = {};
      for (var i = 0; i < getIpNoticeResp.length; i++) {
        var key = getIpNoticeResp[i].Record.bankId;
        logger.info(getIpNoticeResp[i].Record.bankId);
        if (myObject.hasOwnProperty(key)) {
          myObject[key] += 1;
        } else {
          myObject[key] = 1;
        }
      }
      if (myObject) {
        return ({
          statusCode: constants.SUCCESS,
          result: util.convertData(getIpNoticeResp, constants.BANK_ID)
        });
      }
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
}

/**
 * This method will get Ip letter details by Bank 
 * and notice date use by auditor.
 * @param {*} req 
 * @param {*} res 
 */

async function getIpNoticeByBankAndNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IPNOTICE_BY_BANK_AND_NOTICEDATE);
  if (req.auth.orgName == constants.AUDITOR || testMode) {
    try {
      var fromExpiredDate1 = moment().subtract(getAllIpNoticeDay, 'days').format('YYYY-MM-DD');
      var fromExpiredDate = fromExpiredDate1 + " 00:00:00";
      var toExpiredDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
      var toExpiredDate = toExpiredDate1 + " 00:00:00"
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpNoticeByBankIdAndNoticeDate;
      var bankId = req.swagger.params['bankId'].value; //req.auth.orgName;
      var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, fromExpiredDate.toString().trim(), toExpiredDate.toString().trim(), bankId.trim(), ipLetterSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      if (getIpNoticeResp.length > 0)
        return ({
          statusCode: constants.SUCCESS,
          result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
        });
      else
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_204
        });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IPNOTICE_BY_BANK_AND_NOTICEDATE, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
}

/**
 * This method will get Ip letter expiring use by auditor.
 * @param {*} req 
 * @param {*} res 
 */

async function getAuditorPoliciesExpiringCount(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_POLICIES_EXPIRING_COUNT);
  if (req.auth.orgName == constants.AUDITOR || testMode) {
    try {
      var daysValue = req.swagger.params['days'].value;
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpnoticebyExpirngDateRangeAndSchemaName;
      var n = parseInt(daysValue); //number of days to add. 
      var dateFrom1 = moment().format('YYYY-MM-DD');
      var dateFrom = dateFrom1 + " 23:59:59";
      var dateTo1 = moment().add(n, 'days').format('YYYY-MM-DD');
      var dateTo = dateTo1 + " 23:59:59";
      logger.info(' time stamp dateFrom-----> ', dateFrom);
      logger.info('time stamp dateTo-----> ', dateTo);
      var getIpLetterExpiredPoliciesByDateResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken, dateFrom.toString(), dateTo.toString(), loanSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      var myObject = {};
      for (var i = 0; i < getIpLetterExpiredPoliciesByDateResp.length; i++) {
        var key = getIpLetterExpiredPoliciesByDateResp[i].Record.bankName
        logger.info(getIpLetterExpiredPoliciesByDateResp[i].Record.bankName);
        if (myObject.hasOwnProperty(key)) {
          myObject[key] += 1;
        } else {
          myObject[key] = 1;
        }
      }
      return ({
        statusCode: constants.SUCCESS,
        result: util.convertData(getIpLetterExpiredPoliciesByDateResp, constants.BANK_NAME)
      });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_POLICIES_EXPIRING_COUNT, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else {
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
  }
}

/**
 * This method will get expring policy by bank use by auditor.
 * @param {*} req 
 * @param {*} res 
 */

async function getAuditorExpiringPoliciesByBank(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_EXPIRING_POLICIES_BY_BANK);
  if (req.auth.orgName == constants.AUDITOR || testMode) {
    try {
      var bankName = req.swagger.params['bank'].value;
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLoanByBankIdAndExpireDate;
      var schemaName = "IpLetter";
      var n = constants.NO_OF_DAYS;
      var dateFrom1 = moment().format('YYYY-MM-DD');
      var dateFrom = dateFrom1 + " 23:59:59";
      var dateTo1 = moment().add(n, 'days').format('YYYY-MM-DD');
      var dateTo = dateTo1 + " 23:59:59";
      var getIpLetterExpiredPoliciesByDateResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, dateFrom.toString(), dateTo.toString(), bankName, loanSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      if (getIpLetterExpiredPoliciesByDateResp.length > 0)
        return ({
          statusCode: constants.SUCCESS,
          result: getIpLetterExpiredPoliciesByDateResp
        });
      else
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_204
        });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_EXPIRING_POLICIES_BY_BANK, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
}


/**
 * This method will get ip notice count by notice date use by auditor.
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiredPoliciesCountByDate(req, res) {

  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRED_IPNOTICE_COUNT_BY_DATE);
  if (req.auth.orgName == constants.AUDITOR || testMode) {
    try {
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpPoliciesExpiringByDateRange;
      var noOfDays = req.swagger.params['days'].value;
      var fromExpiredDate1 = moment().subtract(noOfDays, 'days').format('YYYY-MM-DD');
      var fromExpiredDate = fromExpiredDate1 + " 23:59:59";
      var toExpiredDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
      var toExpiredDate = toExpiredDate1 + " 23:59:59";
      logger.info("fromExpiredDate=========>", fromExpiredDate);
      logger.info("toExpiredDate=========>", toExpiredDate);
      var getExpiredPolicyResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken, fromExpiredDate.toString().trim(), toExpiredDate.toString().trim(), loanSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      console.log('getExpiredPolicyResp-->', getExpiredPolicyResp);
      var myObject = {};
      for (var i = 0; i < getExpiredPolicyResp.length; i++) {
        var key = getExpiredPolicyResp[i].Record.bankName;
        if (myObject.hasOwnProperty(key)) {
          myObject[key] += 1;
        } else {
          myObject[key] = 1;
        }
      }
      if (myObject) {
        return ({
          statusCode: constants.SUCCESS,
          result: "Success",
          result: util.convertData(getExpiredPolicyResp, constants.BANK_NAME)
        });
      } else {
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_204
        });

      }
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRED_IPNOTICE_COUNT_BY_DATE, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
}

/**
 * This method will get  expired ip notice  by bank and expired date use by audiotr
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiredPoliciesByBankAndDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY);
  if (req.auth.orgName == constants.AUDITOR || testMode) {
    try {
      //  var fromExpiredDate1 = moment().subtract(getAllIpNoticeDay, 'days').format('YYYY-MM-DD');
      var fromExpiredDate1 = moment().subtract(7, 'days').format('YYYY-MM-DD');
      var fromExpiredDate = fromExpiredDate1 + " 23:59:59";
      var toExpiredDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
      var toExpiredDate = toExpiredDate1 + " 23:59:59";
      console.log('fromExpiredDate : toExpiredDate: ', fromExpiredDate, toExpiredDate);
      var peerName = util.getPeerName(req.auth.orgName);
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLaonByBankIdAndExpireDate;
      var bankId = req.swagger.params['bankId'].value; //req.auth.orgName;
      console.log('bankId--->', bankId);
      var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, fromExpiredDate.toString(), toExpiredDate.toString(), bankId.trim(), loanSchemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      console.log('getIpNoticeResp--->', getIpNoticeResp);
      if (getIpNoticeResp.length > 0)
        return ({
          statusCode: constants.SUCCESS,
          result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
        });
      else
        return ({
          statusCode: constants.NO_CONTENT,
          result: constants.MESSAGE_204
        });
    } catch (error) {
      logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY, error);
      return ({
        code: constants.INTERNAL_SERVER_ERROR,
        message: constants.MESSAGE_500
      })
    }
  } else
    return ({
      statusCode: constants.INVALID_INPUT,
      message: constants.INVALID_ORG
    });
}

/**
 * This method will Search ip notices by bank.
 * @param {*} req 
 * @param {*} res 
 */

async function auditorSearchIpLetterByBank(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.AUDITOR_SEARCH_IPLETTER_BY_BANK);
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var attributeName = req.swagger.params['attributeName'].value;
    var attributeValue = req.swagger.params['attributeValue'].value;
    var bankId = req.swagger.params['bankId'].value;
    logger.info("attributeName==attributeValue==", attributeName, "=attributeValue=", attributeValue);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.searchIPNoticesByBank;
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, attributeName, attributeValue, ipLetterSchemaName, bankId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpNoticeResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.AUDITOR_SEARCH_IPLETTER_BY_BANK, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}




































/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function ipNoticesSummary(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.IP_NOTICES_SUMMARY);
  try {
    return ({
      statusCode: constants.SUCCESS,
      result: constants.SUCCESS
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.IP_NOTICES_SUMMARY, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}