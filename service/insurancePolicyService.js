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
const getAllIpNoticeDay = 5;
var moment = require('moment');
var json2xls = require('json2xls');

module.exports = {
  readDatafromLoanJson: readDatafromLoanJson,
  getIPNoticeRecvdSummary: getIPNoticeRecvdSummary,
  addBankLoanInfo: addBankLoanInfo,
  getIpLetterCountByBankNNoticeDate: getIpLetterCountByBankNNoticeDate,
  processIpLetters: processIpLetters,
  getIpLetterDetailsByBankNDate: getIpLetterDetailsByBankNDate,
  getExpiringIpLetterCountOfNdaysByInsurerNDate: getExpiringIpLetterCountOfNdaysByInsurerNDate,
  getExpiredIPLetterByBankNDate: getExpiredIPLetterByBankNDate,
  listBankIPLettersByBankNlimit: listBankIPLettersByBankNlimit,
  searchIPNoticesByBank: searchIPNoticesByBank,
  uploadIpLetters: uploadIpLetters,
  updateUnmatchIPNotices: updateUnmatchIPNotices,
  listUnmatchedNotices: listUnmatchedNotices,
  ipNoticesSummary: ipNoticesSummary,
  searchIPNoticesByInsurer: searchIPNoticesByInsurer,
  searchIPNotices: searchIPNotices,
  getExpiredIpCountOfLastNDaysByBankNDate: getExpiredIpCountOfLastNDaysByBankNDate,
  getAuditorIpCountByNoticeDate: getAuditorIpCountByNoticeDate,
  getIpNoticeByBankAndNoticeDate: getIpNoticeByBankAndNoticeDate,
  getAuditorPoliciesExpiringCount: getAuditorPoliciesExpiringCount,
  getAuditorExpiringPoliciesByBank: getAuditorExpiringPoliciesByBank,
  getExpiredIpNoticeCountByDate: getExpiredIpNoticeCountByDate,
  getExpiredIpNoticeByBankAndDate: getExpiredIpNoticeByBankAndDate,
  getExpiringIpLetterDetailsByDateRange: getExpiringIpLetterDetailsByDateRange,
  downloadUnmatchedNotices: downloadUnmatchedNotices
  

}

function readDatafromLoanJson(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.READ_DATA_FROM_LOAN_JSON);
  logHelper.logDebug(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.READ_DATA_FROM_LOAN_JSON, constants.REQUEST, req);
  try {
    var requestBody = req.body.loanDataJson;
    logger.info("requestBody===Json data========>", requestBody);
    const loanJson = JSON.parse(requestBody);
    var transactionId = util.generateId(constants.TRANSACTION_ID);
    //var mortgageNumber="m-"+util.generateId(constants.MORTGAGE_NUMBER);
    var uniqueLoanId = "L-"+loanJson.bankName + "-" + loanJson.mortgageNumber;
    loanJson["uniqueLoanId"] = uniqueLoanId;
    loanJson["schemaName"] = "Loan";
    loanJson["transaction"] = [{
      "transactionId": transactionId,
      "transactionTimeStamp": new Date(),
      "transactionType": "Loan",
      "actor": req.auth.orgName,
      "actorReference": loanJson.insuranceProvider,

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
 * This method will get ip notice received summary.
 * @param {*} req 
 * @param {*} res 
 */

async function addBankLoanInfo(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.ADD_LOAN_INFO);
  try {
    var loanJson = await readDatafromLoanJson(req, res);
    if (loanJson) {
      let loanData = JSON.stringify(loanJson);
      //var mortgageNumber=loanData.mortgageNumber;
      var bankName = req.auth.orgName;
      logger.info('bank name : ', bankName, loanJson.bankName);
      if (loanJson.bankName == bankName.trim()) {
        var peerName = util.getPeerName(req.auth.orgName);
        console.log("peerName=============>",peerName);
        var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.addLoanInfo;
        var getLoanResp = await chaincodeService.invokeChainCode(req.auth.fabricToken, loanData, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
        logger.info("getLoanResp=============", getLoanResp);
        if (getLoanResp) {
          var blockData = await chaincodeService.queryBlockByTransactionId(req.auth.fabricToken, getLoanResp, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
          var timestamp = blockData.data.data[0].payload.header.channel_header.timestamp;
          var blockNumber = blockData.header.number.toString();
          var reqTransactionData = {
            transactionId: getLoanResp,
            dateTime: timestamp,
            transactionType: 'addLoan',
            blockno: blockNumber,
            actor: req.auth.persona,
            actorReference: loanJson["mortgageNumber"],
            createdBy: req.auth.sub
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
            result: constants.MESSAGE_500
          });

        }
      } else {
        return ({
          code: constants.INTERNAL_SERVER_ERROR,
          message: "invalid org name."
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
 * This method will get ip notice count of bank by notice date range.
 * @param {*} req 
 * @param {*} res 
 */

async function getIpLetterCountByBankNNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY);
  try {
    var noOfDays = req.swagger.params['days'].value;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterCountByNoticeDateAndBankId;
    var result = [];
    var awaitResults = [];
    var authOwnerId = req.auth.orgName;
    //var authOwnerId="bank";
    for (var i = 0; i < noOfDays; i++) {
      var noticeDate1 = moment().subtract(i, 'days').format('YYYY-MM-DD');
      var noticeDate = noticeDate1 + " 00:00:00"
      logger.info("noticeDate=========>", noticeDate);
      result[i] = chaincodeService.queryChainCodeTwoArgs(req.auth.fabricToken, noticeDate.toString().trim(), authOwnerId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
      console.log("result[i]=======>", result[i]);
      awaitResults[i] = result[i];
    }
    var finalJson = await Promise.all(awaitResults).then((res) => {
      console.log("final res=>", res);
      return res;
    });
    logger.info("finalJson========>", finalJson);
    if (finalJson) {
      return ({
        statusCode: constants.SUCCESS,
        result: "Success",
        transactionId: finalJson
      });
    } else {
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_500
      });

    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}



/**
 * This method will get ip notice received summary.
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiredIpCountOfLastNDaysByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY);
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpPoliciesExpiringByDateRangeAndBankId;
    var authOwnerId = req.auth.sub;
    var noOfDays = req.swagger.params['days'].value;
    var fromExpiredDate1 = moment().subtract(noOfDays, 'days').format('YYYY-MM-DD');
    var fromExpiredDate = fromExpiredDate1 + " 23:59:59";
    var toExpiredDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var toExpiredDate = toExpiredDate1 + " 23:59:59";
    logger.info("fromExpiredDate=========>", fromExpiredDate);
    logger.info("toExpiredDate=========>", toExpiredDate);
    var schemaName = "IpLetter";
    var bankId = req.auth.orgName;
    var getExpiredPolicyResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, fromExpiredDate.toString().trim(), toExpiredDate.toString().trim(), schemaName, bankId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    console.log("getExpiredPolicyResp===============>", getExpiredPolicyResp);
    var myObject = {};
    for (var i = 0; i < getExpiredPolicyResp.length; i++) {
      var key = getExpiredPolicyResp[i].Record.policyExpiringDate;
      console.log('key........', key);
      console.log(getExpiredPolicyResp[i].Record.policyExpiringDate);
      console.log('---', myObject.hasOwnProperty(key));
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
        result: myObject
      });
    } else {
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_500
      });

    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}



/**
 * This method will get ip notice received summary.
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiredIpNoticeCountByDate(req, res) {

  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY);
  if(req.auth.orgName==constants.AUDITOR){
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpPoliciesExpiringByDateRange;
    var authOwnerId = req.auth.sub;
    var noOfDays = req.swagger.params['days'].value;
    var fromExpiredDate1 = moment().subtract(noOfDays, 'days').format('YYYY-MM-DD');
    var fromExpiredDate = fromExpiredDate1 + " 23:59:59";
    var toExpiredDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var toExpiredDate = toExpiredDate1 + " 23:59:59";
    logger.info("fromExpiredDate=========>", fromExpiredDate);
    logger.info("toExpiredDate=========>", toExpiredDate);
    var schemaName = "IpLetter";
    // var bankId=req.auth.persona;
    var getExpiredPolicyResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken, fromExpiredDate.toString(), toExpiredDate.toString(), schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info("getExpiredPolicyResp===============>", getExpiredPolicyResp);
    var myObject = {};
    for (var i = 0; i < getExpiredPolicyResp.length; i++) {
      var key = getExpiredPolicyResp[i].Record.bankId;
      logger.info('key........', key);
      logger.info(getExpiredPolicyResp[i].Record.bankId);
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
        result: myObject
      });
    } else {
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_500
      });

    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}else
return ({
  statusCode: constants.SUCCESS,
  result: "Invalid Org name"
});
}



/**
 * This method will get ip notice received summary.
 * @param {*} req 
 * @param {*} res 
 */

async function getAuditorIpCountByNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
  console.log("req.auth.orgName=constants.Auditor",req.auth.orgName);
  if(req.auth.orgName=constants.AUDITOR){
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByNoticeDateRangeAndSchemaName;
    var authOwnerId = req.auth.sub;
    var noOfDays = getAllIpNoticeDay;
    var fromNoticeDate1 = moment().subtract(noOfDays, 'days').format('YYYY-MM-DD');
    var fromNoticeDate = fromNoticeDate1 + " 00:00:00";
    var toNoticeDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var toNoticeDate = toNoticeDate1 + " 00:00:00";
    var schemaName = "IpLetter";
    var getIpNoticeResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken, fromNoticeDate.toString(), toNoticeDate.toString(), schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info("getIpNoticeResp===>", getIpNoticeResp);
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
        result: myObject
      });
    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}else
return ({
  statusCode: constants.SUCCESS,
  result: "Invalid Org Name"
});
}



/**
 * This method will get ip notice received summary.
 * @param {*} req 
 * @param {*} res 
 */

/*async function getExpiredIpNoticeCountByDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getExpiredIpNoticeCountByDate;
    var jsonDatewiseCount={};
    var dateArray = [];
    let finalResult ="";
    var result = [];
    var awaitResults=[];
    let finalObj = {};
    var authOwnerId = req.auth.sub;
    //var expiredStartDate= new Date(moment().subtract(getAllIpNoticeDay, 'days').format('YYYY-MM-DD')).getTime();
   // var expiredEndDate= new Date(moment().subtract(1, 'days').format('YYYY-MM-DD')).getTime();
    var today=new Date(); //Today's Date
   var fromDate=new Date(today.getFullYear(), today.getMonth(), today.getDate()-getAllIpNoticeDay);
   var toDate=new Date(today.getFullYear(), today.getMonth(), today.getDate());
   var fromDateValue= fromDate.getFullYear()+"-"+(fromDate.getMonth()+1)+"-"+fromDate.getDate();
   var toDateValue= toDate.getFullYear()+"-"+(toDate.getMonth()+1)+"-"+toDate.getDate();
   var dateFrom = new Date(fromDateValue).getTime();
   var dateTo = new Date(toDateValue).getTime();
   console.log("dateFrom=========>",dateFrom);
   console.log("dateTo=========>",dateTo);
   var schemaName="addIpLetter";
   var getIpNoticeResp= await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken,dateFrom.toString(),dateTo.toString(),schemaName,chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName) ; 
   var myObject = { };
   for(var i=0 ; i<getIpNoticeResp.length ; i++)
   {
  var key =getIpNoticeResp[i].Record.bankId
  console.log(getIpNoticeResp[i].Record.bankId);
  console.log('---',myObject.hasOwnProperty(key));
  if(myObject.hasOwnProperty(key)){
    myObject[key] += 1;
  } else{
    myObject[key] = 1;
   }
   }
   if (myObject) {
    return ({
      statusCode: constants.SUCCESS,
      result: "Success",
      transactionId: myObject
    });
  } 
    } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}*/



/**
 * This method will get Ip details by policy Number.
 * @param {*} req 
 * @param {*} res 
 */

async function getIPNoticeRecvdSummary(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY);
  try {
    var policyNumber = req.swagger.params['policyNumber'].value;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByPolicyNumber;
    var schemaName = "IpLetter";
    var getIpNoticeResp = await chaincodeService.queryChainCodeTwoArgs(req.auth.fabricToken, policyNumber, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    console.log("getIpNoticeResp============>", getIpNoticeResp.length);
    if (getIpNoticeResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

/**
 * This method will get Ip details by policy Number.
 * @param {*} req 
 * @param {*} res 
 */

async function getIpNoticeByBankAndNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY);
  if(req.auth.orgName==constants.AUDITOR){
  try {
    var fromExpiredDate1 = moment().subtract(getAllIpNoticeDay, 'days').format('YYYY-MM-DD');
    var fromExpiredDate = fromExpiredDate1 + " 00:00:00";
    var toExpiredDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var toExpiredDate = toExpiredDate1 + " 00:00:00"
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpNoticeByBankIdAndNoticeDate;
    var schemaName = "IpLetter";
    var bankId = req.auth.orgName;
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, fromExpiredDate.toString().trim(), toExpiredDate.toString().trim(), bankId, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    console.log("getIpNoticeResp============>", getIpNoticeResp);
    if (getIpNoticeResp)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}
else
return ({
  statusCode: constants.SUCCESS,
  result: "Invalid Org Name"
});
}

async function getExpiredIpNoticeByBankAndDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY);
  if(req.auth.orgName==constants.AUDITOR){
  try {
    var fromExpiredDate1 = moment().subtract(getAllIpNoticeDay, 'days').format('YYYY-MM-DD');
    var fromExpiredDate = fromExpiredDate1 + " 23:59:59";
    var toExpiredDate1 = moment().subtract(1, 'days').format('YYYY-MM-DD');
    var toExpiredDate = toExpiredDate1 + " 23:59:59";
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpNoticeByBankIdAndExpireDate;
    var schemaName = "IpLetter";
    var bankId = req.auth.orgName;
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, fromExpiredDate.toString(), toExpiredDate.toString(), bankId, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info("getIpNoticeResp---->", getIpNoticeResp.length);
    if (getIpNoticeResp.length > 0)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}
else
return ({
  statusCode: constants.SUCCESS,
  result: "Invalid Org Name"
});
}

/**
 * This method will get Ip notice by date.
 * @param {*} req 
 * @param {*} res 
 */

async function getIpLetterDetailsByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICES_BY_DATE);
  try {
    // var n=7;
    var noticeDate1 = req.swagger.params['noticeDate'].value;
    var noticeDate = noticeDate1 + " 00:00:00";
    var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var fabricToken = req.auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpNoticeByNoticeDate;
    logger.info('chaincodeFunctionName:::', chaincodeFunctionName);
    var schemaName = "IpLetter";
    var bankId = req.auth.orgName;
    var getIpLetterNoticeDateResp = await chaincodeService.queryChainCodeThreeArgs(fabricToken, noticeDate.toString().trim(), bankId, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info('getIpLetterNoticeDateResp: ', getIpLetterNoticeDateResp);
    return ({
      statusCode: constants.SUCCESS,
      result: util.getResultArrayfromBlockChainResult(getIpLetterNoticeDateResp)
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICES_BY_DATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}


/**
 * This method will get Ip notice by date.
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiringIpLetterDetailsByDateRange(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICES_BY_DATE);
  try {
    var insurerName = req.swagger.params['insurerName'].value;
    var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var fabricToken = req.auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpnoticebyExpireDateRangeAndInsurer;
    logger.info('chaincodeFunctionName-->', chaincodeFunctionName);
    var dateFrom1 = moment().format('YYYY-MM-DD');
    var dateFrom = dateFrom1 + " 00:00:00";
    var dateTo1 = moment().add(getAllIpNoticeDay, 'days').format('YYYY-MM-DD');
    var dateTo = dateTo1 + " 00:00:00";
    var schemaName = "IpLetter";
    var bankId = req.auth.orgName;
    var getIpLetterNoticeDateResp = await chaincodeService.queryChainCodeFiveArgs(fabricToken, dateFrom.toString().trim(), dateTo.toString().trim(), insurerName.trim(), bankId, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    console.log('getIpLetterNoticeDateResp: ', getIpLetterNoticeDateResp);
    return ({
      statusCode: constants.SUCCESS,
      result: util.getResultArrayfromBlockChainResult(getIpLetterNoticeDateResp)
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_IP_NOTICES_BY_DATE, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}



/**
 * This method will acknowledge Ip notice.
 * @param {*} req 
 * @param {*} res 
 */

async function processIpLetters(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.ACKNOWLEDGE_IP_NOTICE);
  try {
    var reqIdWithComma = req.swagger.params['requestId'].value;
    logger.info('reqIdWithComma ...', reqIdWithComma);
    var reqIdArray = reqIdWithComma.split(',');
    logger.info('reqIdArray ...', reqIdArray, reqIdArray.length);
    for (var i = 0; i < reqIdArray.length; i++) {
      var requestId = reqIdArray[i];   //mortgageNumber
      logger.info('requestId ...', requestId);
      var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
      var peerName = util.getPeerName(req.auth.orgName);
      var fabricToken = req.auth.fabricToken;
      //getLoanByMortgageNumberByBankId
      // var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLoanByMortgageNumber;
      var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getLoanByMortgageNumberByBankId;
    // var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByRequestIdAndSchemaAndBankId;
      logger.info('chaincodeFunctionName:::------>>>', chaincodeFunctionName);
      var schemaName = "Loan";
      var bankId = req.auth.orgName;

      var chaincodeFunctionNameIpLetter = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByRequestIdAndSchemaAndBankId;
      var schemaNameIp = "IpLetter";
     // find mortgageNumber from ipletter
      var getIPletterMortgageNumberResp = await chaincodeService.queryChainCodeThreeArgs(fabricToken, requestId.trim(), bankId, schemaNameIp, chaincodeName, chaincodeFunctionNameIpLetter, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
     console.log('getIPletterMortgageNumberResp------------>', getIPletterMortgageNumberResp  , getIPletterMortgageNumberResp.length);
      if (getIPletterMortgageNumberResp != 0) {
        var mortgageNumber = getIPletterMortgageNumberResp[0].Record.mortgageNumber;
        logger.info('mortgageNumber---> ', mortgageNumber);
        logger.info('bankId: , getIPletterMortgageNumberResp[0].Record.bankId : ', bankId, getIPletterMortgageNumberResp[0].Record.bankId)
        if (bankId == getIPletterMortgageNumberResp[0].Record.bankId) {
          logger.info('getIPletterMortgageNumberResp-from ipletter--------->', getIPletterMortgageNumberResp);
          logger.info('getIPletterMortgageNumberResp[0].Record.requestStatus---------->', getIPletterMortgageNumberResp[0].Record.requestStatus);
          // find mortgageNumber from loan
          var getMortgageNumberResp = await chaincodeService.queryChainCodeThreeArgs(fabricToken, mortgageNumber.toString().trim(), bankId, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
          logger.info("getMortgageNumberResp.from loan...............", getMortgageNumberResp, getMortgageNumberResp.length);

          if (getMortgageNumberResp != 0) {
            logger.info('getMortgageNumberResp:----->> ', getMortgageNumberResp);
            // update requestStatus in ipletter match   --> getIpLetterByMortgageNumberAndSchemaAndBankId
            // var chaincodeFunctionNameIpLetter = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByMortgageNumber;
            getIPletterMortgageNumberResp[0].Record.requestStatus = "Matched";
            var transactionId = util.generateId(constants.TRANSACTION_ID);
            getIPletterMortgageNumberResp[0].Record.transaction.push({
              "transactionId": transactionId,
              "transactionTimeStamp": new Date(),
              "transactionType": "MatchIpLetter",
              "actor": req.auth.orgName,
              "actorReference": getIPletterMortgageNumberResp[0].Record.insuranceProvider,
              "additionalTags": ""
            });

            logger.info('getIPletterMortgageNumberResp0---------->', JSON.stringify(getIPletterMortgageNumberResp[0].Record));
            var chaincodeFunctionNameip = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
            var ipletterupdateResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getIPletterMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
            logger.info('ipletterupdateResp', ipletterupdateResp);

            // update policyno in loan from policyno from ipletter
            logger.info('getMortgageNumberResp[0].Record.mortgageNumber', getMortgageNumberResp[0].Record.mortgageNumber);
            logger.info('getIPletterMortgageNumberResp[0].Record.mortgageNumber', getIPletterMortgageNumberResp[0].Record.mortgageNumber);
            if (getMortgageNumberResp[0].Record.mortgageNumber == getIPletterMortgageNumberResp[0].Record.mortgageNumber) {
              getMortgageNumberResp[0].Record.policyNumber = getIPletterMortgageNumberResp[0].Record.policyNumber;
              logger.info('getPolicyNumberResp[0].Record---->', getMortgageNumberResp[0].Record);
              var chaincodeFunctionNameAddLoan = configData.chaincodes.canadianInsuranceInfo.functions.addLoan;
              var loanupdateResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameAddLoan, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
              logger.info('loanupdateResp---------------->>>>', loanupdateResp);
              if (loanupdateResp != 0) {
                // update requestStatus in ipletter  Processed
                getIPletterMortgageNumberResp[0].Record.requestStatus = "Processed";
                var transactionId = util.generateId(constants.TRANSACTION_ID);
                getIPletterMortgageNumberResp[0].Record.transaction.push({
                  "transactionId": transactionId,
                  "transactionTimeStamp": new Date(),
                  "transactionType": "ProcessedIpLetter",
                  "actor": req.auth.orgName,
                  "actorReference": getIPletterMortgageNumberResp[0].Record.insuranceProvider,
                  "additionalTags": ""
                });
                logger.info('getIPletterMortgageNumberResp01---------->', JSON.stringify(getIPletterMortgageNumberResp[0].Record));
                var ipletterupdateResp1 = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getIPletterMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
                logger.info('ipletterupdateResp1 :', ipletterupdateResp1);
              }
            }
          } else {
            // for unmatch 
            getIPletterMortgageNumberResp[0].Record.requestStatus = "Unmatched";
            var transactionId = util.generateId(constants.TRANSACTION_ID);
            getIPletterMortgageNumberResp[0].Record.transaction.push({
              "transactionId": transactionId,
              "transactionTimeStamp": new Date(),
              "transactionType": "Unmatched",
              "actor": req.auth.orgName,
              "actorReference": getIPletterMortgageNumberResp[0].Record.insuranceProvider,
              "additionalTags": ""
            });
            logger.info('getIPletterPolicyNumberResp0---------->', JSON.stringify(getIPletterMortgageNumberResp[0].Record));
            var chaincodeFunctionNameip = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
            var ipletterupdateResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getIPletterMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
            logger.info('ipletterupdateResp unmatch : -> ', ipletterupdateResp);

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
            "transactionType": "Unmatched",
            "actor": req.auth.orgName,
            "actorReference": getIPletterMortgageNumberResp[0].Record.insuranceProvider,
            "additionalTags": ""
          });
          logger.info('getIPletterPolicyNumberResp0---------->', JSON.stringify(getIPletterMortgageNumberResp[0].Record));
          var chaincodeFunctionNameip = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
          var ipletterupdateResp = await chaincodeService.invokeChainCode(fabricToken, JSON.stringify(getIPletterMortgageNumberResp[0].Record), chaincodeName, chaincodeFunctionNameip, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
          logger.info('ipletterupdateResp unmatch : -> ', ipletterupdateResp);
        }
      } else {
        return ({
          statusCode: constants.SUCCESS,
          result: "invalid org name"
        });
      }
    }
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.ACKNOWLEDGE_IP_NOTICE, error);
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

async function getExpiringIpLetterCountOfNdaysByInsurerNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_POLICIES_EXPIRING);
  try {

    var daysValue = req.swagger.params['days'].value;
    var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var fabricToken = req.auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpPoliciesExpiringByDateRangeAndBankId;
    logger.info('chaincodeFunctionName:::', chaincodeFunctionName);
    var n = parseInt(daysValue); //number of days to add. 
    var dateFrom1 = moment().format('YYYY-MM-DD');
    var dateFrom = dateFrom1 + " 23:59:59";
    var dateTo1 = moment().add(n, 'days').format('YYYY-MM-DD');
    var dateTo = dateTo1 + " 23:59:59";
    logger.info('dateFrom : ,dateTo :  -----> ', dateFrom, dateTo);
    var schemaName = "IpLetter";
    var bankId = req.auth.orgName;
    var getIpLetterExpiredPoliciesByDateResp = await chaincodeService.queryChainCodeFourArgs(fabricToken, dateFrom.toString().trim(), dateTo.toString().trim(), schemaName, bankId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info('getIpLetterExpiredPoliciesByDateResp--->', getIpLetterExpiredPoliciesByDateResp);
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
    logger.info('myObject---->', myObject);
    logger.info("ttttttttttttttttttttttttt",convertData(getIpLetterExpiredPoliciesByDateResp, "insuranceProvider"));
    return ({
      statusCode: constants.SUCCESS,
      //result: myObject
      result: convertData(getIpLetterExpiredPoliciesByDateResp, "insuranceProvider")
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_POLICIES_EXPIRING, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}

function convertData(data, keyName) {
    let objArry = [];
    let keyArr = [];
    for(let index=0; index < data.length; index++) {
      const key = data[index].Record[keyName];
      if(key) {
        if (keyArr.indexOf(key) === -1) {
          keyArr.push(key);
          objArry.push({
            insurer: key,
            count: 1
          });
        } else {
          const keyIndex = keyArr.indexOf(key);
          objArry[keyIndex] = {
            insurer: objArry[keyIndex].insurer,
            count: objArry[keyIndex].count + 1 
          }
        }
      }
    }
  return objArry;    
}

/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function getExpiredIPLetterByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRED_POLICIES_BY_DATE);
  try {

    var dateValue1 = req.swagger.params['date'].value;
    var dateValue = dateValue1 + " 23:59:59";
    logger.info('dateValue.....', dateValue);
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpExpiredPoliciesByDateAndBankId;
    logger.info('chaincodeFunctionName:::', chaincodeFunctionName);
    var schemaName = "IpLetter";
    var bankId = req.auth.orgName;
    // find mortgageNumber from loan
    var getIpLetterExpiredPoliciesByDateResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, dateValue.toString().trim(), schemaName, bankId, "", chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info('getIpLetterExpiredPoliciesByDateResp: ', getIpLetterExpiredPoliciesByDateResp);
    return ({
      statusCode: constants.SUCCESS,
      result: getIpLetterExpiredPoliciesByDateResp
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_EXPIRED_POLICIES_BY_DATE, error);
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
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_IP_NOTICES);
  try {
    var count = req.swagger.params['count'].value;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.listIPNotices;
    var schemaName = "IpLetter";
    var getIpNoticeResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken,schemaName, count.toString(),"" , chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpNoticeResp)
      return ({
        statusCode: constants.SUCCESS,
        result: getIpNoticeResp
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_IP_NOTICES, error);
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

async function searchIPNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IP_NOTICES);
  if(req.auth.orgName==constants.IRM){
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var attributeName = req.swagger.params['attributeName'].value;
    var attributeValue = req.swagger.params['attributeValue'].value;
    logger.info("attributeName==attributeValue==", attributeName, "=attributeValue=", attributeValue);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.searchIPNotices;
    var schemaName = "IpLetter";
    var getIpNoticeResp = await chaincodeService.queryChainCodeThreeArgs(req.auth.fabricToken, attributeName, attributeValue, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpNoticeResp)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IP_NOTICES, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}else
return ({
  statusCode: constants.SUCCESS,
  result: "Invalid Org Name"
});
}



/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function searchIPNoticesByBank(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IP_NOTICES);
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var attributeName = req.swagger.params['attributeName'].value;
    var attributeValue = req.swagger.params['attributeValue'].value;
    //var bankId=req.auth.sub;
    var bankId = req.auth.orgName;
    logger.info("attributeName==attributeValue==", attributeName, "=attributeValue=", attributeValue);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.searchIPNoticesByBank;
    var schemaName = "IpLetter";
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, attributeName, attributeValue, schemaName, bankId, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpNoticeResp)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IP_NOTICES, error);
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

async function searchIPNoticesByInsurer(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IP_NOTICES);
  try {
    var peerName = util.getPeerName(req.auth.orgName);
    var attributeName = req.swagger.params['attributeName'].value;
    var attributeValue = req.swagger.params['attributeValue'].value;
    var insurerName = req.swagger.params['insurerName'].value;
    logger.info("attributeName==attributeValue==", attributeName, "=attributeValue=", attributeValue);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.searchIPNoticeByInsurer;
    var schemaName = "IpLetter";
    var getIpNoticeResp = await chaincodeService.queryChainCodeFourArgs(req.auth.fabricToken, attributeName, attributeValue, schemaName, insurerName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    if (getIpNoticeResp)
      return ({
        statusCode: constants.SUCCESS,
        result: util.getResultArrayfromBlockChainResult(getIpNoticeResp)
      });
    else
      return ({
        statusCode: constants.SUCCESS,
        result: constants.MESSAGE_204
      });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.SEARCH_IP_NOTICES, error);
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

async function 
uploadIpLetters(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPLOAD_IP_NOTICES);
  console.log(req.auth.orgName ,constants.IRM );
  if(req.auth.orgName==constants.IRM){
  try {
    var accessControlId = util.generateId(constants.ACCESSCONTROL);
    var uploadFilePath = await getUploadZipFilePath(req, res);
    console.log('uploadFilePath---->', uploadFilePath);
    var jsonDataFromXML = await readZipFile(uploadFilePath, req, res);
    console.log('jsonDataFromXML2---> ', jsonDataFromXML);
    return ({
      statusCode: constants.SUCCESS,
      result: constants.SUCCESS
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPLOAD_IP_NOTICES, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}
else{
  return ({
    statusCode: constants.SUCCESS,
    result: "Invalid Org Name"
  });
}
}



async function getUploadZipFilePath(req, res) {

  const uploadIPNotices = req.files.uploadIPNotices;
  console.log('uploadIPNotices-->', uploadIPNotices);
  var fileName = uuidV1();
  var filePath = '';
  let path = configData.CANADIAN_INSURANCE_FILE_LOCATION + fileName;
  logger.info('path: ', path);
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  uploadIPNotices.forEach(function (file) {
    console.log('getUploadZipFilePath : file--->', file);
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
    console.log('filePath....jszip--->', path);

  });

  return filePath;
}

async function readZipFile(filePath, req, res) {
  console.log('read fPath--> ', filePath);
  var arrayData = [];
  // var jsonFromXML ='';
  fs.readFile(filePath, function (err, data) {
    if (err) throw err;
    JSZip.loadAsync(data).then(function (zip) {
      var files = Object.keys(zip.files);
      console.log('files---------->', files);
      files.forEach(function (file) {
        zip.file(file).async("string").then(function (data) {
          // data is "Hello World!"
          // console.log('data ---->', data);
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
          // console.log('--------------------', arrayData);
          console.log('------jsonFromXML--------------', jsonFromXML);
          chainCodeCall(jsonFromXML, req, res);

        });
      });
    });

  });

  return arrayData;
}


async function chainCodeCall(jsonFromXML, req, res) {
  var authOwnerId = req.auth.sub;
  var transactionId = util.generateId(constants.TRANSACTION_ID);
  //  for chain code 
  var requestBody1 = JSON.parse(jsonFromXML).ipletter;
  logger.info("req.auth.orgName : , requestBody1.bankId :   ", req.auth.orgName, requestBody1.bankId);
  //if (req.auth.orgName == requestBody1.bankId.trim()) {
    requestBody1["requestId"] =  requestBody1.bankId + "-" + requestBody1.mortgageNumber;
    requestBody1["schemaName"] = "IpLetter";
    requestBody1["transaction"] = [{
      "transactionId": transactionId,
      "transactionTimeStamp": new Date(),
      "transactionType": "addIPNotices",
      "actor": req.auth.orgName,
      "actorReference": requestBody1.insuranceProvider,
      "additionalTags": ""
    }]
    logger.info('requestBody1:  ', requestBody1);
    var requestBody = JSON.stringify(requestBody1);
    logger.info('requestBody:  ', requestBody);
    var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.addIpLetter;
    logger.info('chaincodeFunctionName:   ', chaincodeFunctionName);
    var insuranceFileResp = await chaincodeService.invokeChainCode(req.auth.fabricToken, requestBody, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info("insuranceFileResp---->", insuranceFileResp);
    if (insuranceFileResp == "") {
      return ({
        statusCode: constants.NO_CONTENT,
        result: constants.MESSAGE_500
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
        createdBy: req.auth.sub
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
 * 
 * 
 */

async function updateUnmatchIPNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPLOAD_IP_NOTICES);
  if(req.auth.orgName==constants.IRM){
  try {
    var accessControlId = util.generateId(constants.ACCESSCONTROL);
    var uploadFilePath = await getUpdateZipFilePath(req, res);
    logger.info('uploadFilePath---->', uploadFilePath);
    var jsonDataFromXML = await updateReadZipFile(uploadFilePath, req, res);
    logger.info('jsonDataFromXML2---> ', jsonDataFromXML);
    return ({
      statusCode: constants.SUCCESS,
      result: constants.SUCCESS
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.UPLOAD_IP_NOTICES, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}else{
  return ({
    statusCode: constants.SUCCESS,
    result: "Invalid Org Name"
  });
}
}


async function getUpdateZipFilePath(req, res) {

  const uploadIPNotices = req.files.updateUnmatchIPNotices;
  console.log('uploadIPNotices-->', uploadIPNotices);
  var fileName = uuidV1();
  var filePath = '';
  let path = configData.CANADIAN_INSURANCE_FILE_LOCATION + fileName;
  logger.info('path: ', path);
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  uploadIPNotices.forEach(function (file) {
    console.log('getUploadZipFilePath : file--->', file);
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
    console.log('filePath....jszip--->', path);

  });

  return filePath;
}


async function updateReadZipFile(filePath, req, res) {
  console.log('read fPath--> ', filePath);
  var arrayData = [];
  // var jsonFromXML ='';
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


async function updateChainCodeCall(jsonFromXML, req, res) {
  var authOwnerId = req.auth.sub;
  var transactionId = util.generateId(constants.TRANSACTION_ID);
  //  for chain code 
  var requestBody1 = JSON.parse(jsonFromXML).ipletter;
  // requestBody1["requestId"] = util.generateId('requestId');
  requestBody1["schemaName"] = "IpLetter";
  requestBody1["transaction"] = [{
    "transactionId": transactionId,
    "transactionTimeStamp": new Date(),
    "transactionType": "updateIPNotices",
    "actor": req.auth.orgName,
    "actorReference": requestBody1.insuranceProvider,
    "additionalTags": ""
  }]

  var requestId = requestBody1["requestId"];
  logger.info('requestId--->', requestId);
  logger.info('requestBody1:  ', requestBody1);
  var requestBody = JSON.stringify(requestBody1);
  logger.info('requestBody:  ', requestBody);
  var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
  logger.info('chaincodeName: ', chaincodeName);
  var peerName = util.getPeerName(req.auth.orgName);
  logger.info('peerName: ', peerName);
  var schemaName = "IpLetter";
  //find req id 
  var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpLetterByRequestId;
  logger.info('chaincodeFunctionName:   ', chaincodeFunctionName);
  var getIpLetterReqIdResp = await chaincodeService.queryChainCodeTwoArgs(req.auth.fabricToken, requestId.trim(), schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
  logger.info("getIpLetterReqIdResp................", getIpLetterReqIdResp);
  if (getIpLetterReqIdResp != 0) {
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
        transactionType: 'updateIPLetter',
        blockno: blockNumber,
        actor: req.auth.persona,
        actorReference: requestId,
        createdBy: req.auth.sub
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
      result: ipletterupdateResp
    });

  }

  if (getIpLetterReqIdResp == "") {
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
  if(req.auth.orgName=constants.IRM){
  try {
    var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var fabricToken = req.auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getListUnmatchedNotices;
    var schemaName = "IpLetter";
    var getUnmatchedResp = await chaincodeService.queryChainCodeTwoArgs(fabricToken, "", schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    console.log('getUnmatchedResp----> ', getUnmatchedResp);
    return ({
      statusCode: constants.SUCCESS,
      result: util.getResultArrayfromBlockChainResult(getUnmatchedResp)
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_UNMATCHED_NOTICES, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}
else 
return ({
statusCode: constants.SUCCESS,
      result: "Invalid Org name"
    });

}



/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function downloadUnmatchedNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_UNMATCHED_NOTICES);
  if(req.auth.orgName=constants.IRM){
  try {
    var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var fabricToken = req.auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getListUnmatchedNotices;
    var schemaName = "IpLetter";
    var getUnmatchedResp = await chaincodeService.queryChainCodeTwoArgs(fabricToken, "", schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    console.log('getUnmatchedResp----> ', getUnmatchedResp);
    var xls = json2xls(util.getResultArrayfromBlockChainResult(getUnmatchedResp));
    var fileName = uuidV1();
    var filePath = configData.CANADIAN_INSURANCE_FILE_LOCATION + fileName + ".xlsx";
    console.log("filePath===========>", filePath);
    fs.writeFileSync(filePath, xls, 'binary');
    return ({
      statusCode: constants.SUCCESS,
      result: filePath,
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.LIST_UNMATCHED_NOTICES, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}
else 
return ({
  statusCode: constants.SUCCESS,
  result: "Invalid Org Name",
});
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

/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function getAuditorPoliciesExpiringCount(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_POLICIES_EXPIRING);
  if(req.auth.orgName==constants.AUDITOR){
  try {

    var daysValue = req.swagger.params['days'].value;
    var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var fabricToken = req.auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpnoticebyExpirngDateRangeAndSchemaName;
    logger.info('chaincodeFunctionName:::', chaincodeFunctionName);
    var n = parseInt(daysValue); //number of days to add. 
    var dateFrom1 = moment().format('YYYY-MM-DD');
    var dateFrom = dateFrom1 + " 23:59:59";
    var dateTo1 = moment().add(n, 'days').format('YYYY-MM-DD');
    var dateTo = dateTo1 + " 23:59:59";
    logger.info(' time stamp dateFrom-----> ', dateFrom);
    logger.info('time stamp dateTo-----> ', dateTo);
    var schemaName = "IpLetter";
    var getIpLetterExpiredPoliciesByDateResp = await chaincodeService.queryChainCodeThreeArgs(fabricToken, dateFrom.toString(), dateTo.toString(), schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    logger.info('getIpLetterExpiredPoliciesByDateResp--->', getIpLetterExpiredPoliciesByDateResp);
    var myObject = {};
    for (var i = 0; i < getIpLetterExpiredPoliciesByDateResp.length; i++) {
      var key = getIpLetterExpiredPoliciesByDateResp[i].Record.bankId
      logger.info(getIpLetterExpiredPoliciesByDateResp[i].Record.bankId);
      if (myObject.hasOwnProperty(key)) {
        myObject[key] += 1;
      } else {
        myObject[key] = 1;
      }
    }
    console.log('myObject---->', myObject);
    return ({
      statusCode: constants.SUCCESS,
      result: myObject
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_POLICIES_EXPIRING, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}else{
  return ({
    statusCode: constants.SUCCESS,
    result: "Invalid Org Name"
  });
}
}


/**
 * This method will get expired policy
 * @param {*} req 
 * @param {*} res 
 */

async function getAuditorExpiringPoliciesByBank(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_POLICIES_EXPIRING);
  if(req.auth.orgName==constants.AUDITOR){
  try {
    var bankName = req.swagger.params['bank'].value;
    var chaincodeName = configData.chaincodes.canadianInsuranceInfo.name;
    var peerName = util.getPeerName(req.auth.orgName);
    var fabricToken = req.auth.fabricToken;
    var chaincodeFunctionName = configData.chaincodes.canadianInsuranceInfo.functions.getIpNoticeByBankIdAndExpireDate;
    logger.info('chaincodeFunctionName:::', chaincodeFunctionName);
    var schemaName = "IpLetter";
    var n = 7;
    var dateFrom1 = moment().format('YYYY-MM-DD');
    var dateFrom = dateFrom1 + " 23:59:59";
    var dateTo1 = moment().add(n, 'days').format('YYYY-MM-DD');
    var dateTo = dateTo1 + " 23:59:59";
    var getIpLetterExpiredPoliciesByDateResp = await chaincodeService.queryChainCodeFourArgs(fabricToken, dateFrom.toString(), dateTo.toString(), bankName, schemaName, chaincodeName, chaincodeFunctionName, peerName, req.auth.persona.toLowerCase(), req.auth.orgName);
    console.log('getIpLetterExpiredPoliciesByDateResp--->', getIpLetterExpiredPoliciesByDateResp);
    /*var  obj =  getIpLetterExpiredPoliciesByDateResp;
    var myObject = { };
    for(var i=0 ; i< getIpLetterExpiredPoliciesByDateResp.length ; i++){
     var key =  getIpLetterExpiredPoliciesByDateResp[i].Record.bankId
     console.log(getIpLetterExpiredPoliciesByDateResp[i].Record.bankId);
    console.log('---',myObject.hasOwnProperty(key));
       if(myObject.hasOwnProperty(key)){
          myObject[key] += 1;
       } else{
          myObject[key] = 1;
       }
    }
     console.log('myObject---->', myObject);*/
    return ({
      statusCode: constants.SUCCESS,
      result: getIpLetterExpiredPoliciesByDateResp
    });
  } catch (error) {
    logHelper.logError(logger, constants.INSURANCE_POLICY_SERVICE_FILE, constants.GET_POLICIES_EXPIRING, error);
    return ({
      code: constants.INTERNAL_SERVER_ERROR,
      message: constants.MESSAGE_500
    })
  }
}
else
return ({
      statusCode: constants.SUCCESS,
      result: "Invalid Org Name"
    });
}