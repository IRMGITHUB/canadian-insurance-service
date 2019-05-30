'use strict';

var fs = require('fs'); 
var configDetails = fs.readFileSync('config/config.json','utf8');
var configData = JSON.parse(configDetails);
var config = require('config');
var constants = require('../config/constants.js');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);
var validation = require('../utils/validation_helper');


module.exports = {
    generateId: generateId,
    validatePoolId:validatePoolId,
    getPeerName:getPeerName,
    checkMandatoryData:checkMandatoryData,
    getUrl:getUrl,
    getEnrollUrl:getEnrollUrl,
    getResultArrayfromBlockChainResult:getResultArrayfromBlockChainResult,
    getpreviousdate : getpreviousdate
}

function generateId(assetType){
    return new Date().valueOf().toString();
}

function validatePoolId(poolId){
    if(poolId != null || poolId != "" || poolId != 0 || poolId != undefined){
        return true;
      } else {
        return false;
      }
}

function getPeerName(orgName){
    if(orgName != null || orgName != undefined){
        return configData.chaincodes.peers[orgName];
      } else {
        return "Org name does not exist.";
      }
}
function checkMandatoryData(requestBody){
    if((requestBody.MERSNumber != "" && requestBody.MERSNumber != "null" && requestBody.MERSNumber != undefined) || (requestBody.OriginatorLoanNumber != "" && requestBody.OriginatorLoanNumber != "null" && requestBody.OriginatorLoanNumber != undefined) || (requestBody.AgencyLoanNumber != "" && requestBody.AgencyLoanNumber != "null" && requestBody.AgencyLoanNumber != undefined) || (requestBody.ServicerLoanNumber != "" && requestBody.ServicerLoanNumber != "null" && requestBody.ServicerLoanNumber != undefined)){
        return true;
    } else {
        return false;
    }
}

function getUrl(persona){
    if(persona == constants.INSURER){
        return configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST;
    }  else if(persona == constants.BANK){
        return configData.CHAINCODE_API_SERVICE_URL_HOST_SECOND
    } else if(persona == constants.SERVICE_PROVIDER){
        return configData.CHAINCODE_API_SERVICE_URL_HOST_SECOND
    }else if(persona == constants.Auditor){
        return configData.CHAINCODE_API_SERVICE_URL_HOST_SECOND
    }
}

function getEnrollUrl(persona){
    if(persona == constants.INSURER){
        return configData.ENROLL_USER_SERVICE_URL_HOST_FIRST;
    } else if(persona == constants.BANK){
        return configData.ENROLL_USER_SERVICE_URL_HOST_SECOND
    } else if(persona == constants.SERVICE_PROVIDER){
        return configData.ENROLL_USER_SERVICE_URL_HOST_SECOND
    }else if(persona == constants.Auditor){
        return configData.ENROLL_USER_SERVICE_URL_HOST_SECOND
    }
}

function getResultArrayfromBlockChainResult(data){
    var dataArray=[];
    data.forEach(function(element) {
        dataArray.push(element.Record);
    });
    return dataArray;
}

function getpreviousdate(day)
{
var today=new Date(); //Today's Date
var requiredDate=new Date(today.getFullYear(), today.getMonth(), today.getDate()-day);
var dateTo= requiredDate.getDate()+"/"+(requiredDate.getMonth()+1)+"/"+requiredDate.getFullYear(); 
logger.info('dateTo-----> ',dateTo); 
return dateTo;
}





