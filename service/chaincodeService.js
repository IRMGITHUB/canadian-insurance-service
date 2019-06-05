'use strict';

var Client = require('node-rest-client').Client;
var config = require('config');
var client = new Client();
var fs = require('fs');
var configDetails = fs.readFileSync('config/config.json', 'utf8');
var configData = JSON.parse(configDetails);
var request = require('async-request');
var request2 = require('request-promise');
var constants = require('../config/constants.js');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);
var util = require('../utils/util.js');

module.exports = {
    enrollUser: enrollUser,
    invokeChainCode: invokeChainCode,
    queryChainCode: queryChainCode,
    queryBlockByTransactionId: queryBlockByTransactionId,
    listChannelInfo: listChannelInfo,
    queryChainCodeTwoArgs: queryChainCodeTwoArgs,
    queryChainCodeThreeArgs: queryChainCodeThreeArgs,
    queryChainCodeFourArgs: queryChainCodeFourArgs,
    queryChainCodeFiveArgs: queryChainCodeFiveArgs
}

/**
 * This method is used to enroll the user.
 * @param {*} userId 
 */
async function enrollUser(userId, orgName, persona) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.ENROLL_USER);
    var hostname = configData.ENROLL_USER_SERVICE_URL_HOST_FIRST;
    /*if(orgName.trim().toLowerCase() == constants.SERVICER){
        orgName = "Originator";
    }*/
    var response;
    try {
        var bodyParam = {
            username: userId,
            orgName: orgName
        };
        var response = await request(hostname, {
            method: constants.REQUEST_POST,
            data: bodyParam,
            headers: {
                "Content-Type": constants["CONTENT-TYPE"]
            },
        });
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.ENROLL_USER, error);
        return error;
    }
    logHelper.logDebug(logger, constants.CHAINCODE_SERVICE_FILE, constants.ENROLL_USER, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.ENROLL_USER);
    return response;
}

/**
 * This method is used to invoke the data
 * @param {*} fabricToken 
 * @param {*} reqBodyData 
 * @param {*} chainName 
 * @param {*} functionname 
 */
async function invokeChainCode(fabricToken, reqBodyData, chainName, functionname, peerName, persona, orgName) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.INVOKE_CHAINCODE);
    try {
        var url = configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST + configData.channelName + "/chaincodes/" + chainName;
        logger.info('url====>' + url);
        var options = {
            method: constants.REQUEST_POST,
            uri: url,
            body: {
                peers: [peerName],
                fcn: functionname,
                args: [reqBodyData]
            },
            headers: {
                "Content-Type": constants["CONTENT-TYPE"],
                "authorization": "Bearer " + fabricToken
            },
            json: true
        };
        try {
            var response = await request2(options);
            logger.info("response==============", response);
            logHelper.logDebug(logger, constants.CHAINCODE_SERVICE_FILE, constants.INVOKE_CHAINCODE, constants.RESPONSE, response);
            logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.INVOKE_CHAINCODE);
            return Promise.resolve(response);
        } catch (error) {
            logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.INVOKE_CHAINCODE, error);
            Promise.reject(error);
        }
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.INVOKE_CHAINCODE, error);
        return error;
    }
}

/**
 * This method is used to query the data
 * @param {*} fabricToken 
 * @param {*} Id 
 * @param {*} chainCodeName 
 * @param {*} functionname 
 */
async function queryChainCode(fabricToken, Id, chainCodeName, functionname, custodianPeer, persona, orgName) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
    var url;
    var hostname = configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST;
    try {
        if (Id != "") {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + Id + "%22%5D";
            logger.info("url with id ================>", url);
        } else {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22%22%5D";
            logger.info("url without id ================>", url);
        }
        logger.info("url================>", url);
        var options = {
            method: constants.REQUEST_GET,
            uri: url,
            headers: {
                "Content-Type": constants["CONTENT-TYPE"],
                "authorization": "Bearer " + fabricToken
            },
            json: true
        };
        try {
            var response = await request2(options);
            logHelper.logDebug(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, constants.RESPONSE, response);
            logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
            return Promise.resolve(response);
        } catch (error) {
            logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
            Promise.reject(error);
        }
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
        return error;
    }
}

/**
 * This method is used to get the block by transaction Id
 * @param {*} fabricToken 
 * @param {*} transactionId 
 */
async function queryBlockByTransactionId(fabricToken, transactionId, peer, persona, orgName) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_BLOCK_BY_TRANSACTION_ID);
    try {
        var hostname = configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST;
        var url = hostname + configData.channelName + "/block/" + transactionId + "?peer=" + peer;
        var options = {
            method: constants.REQUEST_GET,
            uri: url,
            headers: {
                "Content-Type": constants["CONTENT-TYPE"],
                "authorization": "Bearer " + fabricToken
            },
            json: true
        };
        try {
            var response = await request2(options);
            logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_BLOCK_BY_TRANSACTION_ID);
            return Promise.resolve(response);
        } catch (error) {
            logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_BLOCK_BY_TRANSACTION_ID, error);
            Promise.reject(error);
        }
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_BLOCK_BY_TRANSACTION_ID, error);
        return error;
    }
}


/**
 * This method is used to get the channel info
 * @param {*} fabricToken 
 */
async function listChannelInfo(fabricToken, channelName, peer, persona, orgName) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.LIST_CHANNEL_INFO);
    try {
        //var hostname = await util.getUrl(persona);
        var hostname = configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST;
        var url = hostname + channelName + "?peer=" + peer;
        var options = {
            method: constants.REQUEST_GET,
            uri: url,
            headers: {
                "Content-Type": constants["CONTENT-TYPE"],
                "authorization": "Bearer " + fabricToken
            },
            json: true
        };
        try {
            var response = await request2(options);
            logHelper.logDebug(logger, constants.CHAINCODE_SERVICE_FILE, constants.LIST_CHANNEL_INFO, constants.RESPONSE, response);
            return Promise.resolve(response);
        } catch (error) {
            logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.LIST_CHANNEL_INFO, error);
            Promise.reject(error);
        }
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.LIST_CHANNEL_INFO, error);
        return error;
    }
    logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.LIST_CHANNEL_INFO);
}

/**
 *
 *
 * @param {*} fabricToken
 * @param {*} Id
 * @param {*} schemaName
 * @param {*} chainCodeName
 * @param {*} functionname
 * @param {*} custodianPeer
 * @param {*} persona
 * @param {*} orgName
 * @returns
 */
async function queryChainCodeTwoArgs(fabricToken, Id, schemaName, chainCodeName, functionname, custodianPeer, persona, orgName) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
    console.log('queryChainCode two args...............', Id, schemaName)
    var url;
    var hostname = configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST;
    try {
        if (Id != "") {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + Id + "%22%2C%22" + schemaName + "%22%5D";
            console.log("url with id two args ================>", url);
        } else {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + schemaName + "%22%5D";
            logger.info("url without id ================>", url);
        }
        logger.info("url================>", url);
        var options = {
            method: constants.REQUEST_GET,
            uri: url,
            headers: {
                "Content-Type": constants["CONTENT-TYPE"],
                "authorization": "Bearer " + fabricToken
            },
            json: true
        };
        try {
            var response = await request2(options);
            logHelper.logDebug(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, constants.RESPONSE, response);
            logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
            return Promise.resolve(response);
        } catch (error) {
            logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
            Promise.reject(error);
        }
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
        return error;
    }
}
/**
 *
 *
 * @param {*} fabricToken
 * @param {*} attributeName
 * @param {*} attributeVal
 * @param {*} schemaName
 * @param {*} chainCodeName
 * @param {*} functionname
 * @param {*} custodianPeer
 * @param {*} persona
 * @param {*} orgName
 * @returns
 */
async function queryChainCodeThreeArgs(fabricToken, attributeName, attributeVal, schemaName, chainCodeName, functionname, custodianPeer, persona, orgName) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
    console.log('queryChainCode three args...............', attributeName, attributeVal, schemaName)
    var url;
    var hostname = configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST;
    try {
        if (attributeName != "") {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + attributeName + "%22%2C%22" + attributeVal + "%22%2C%22" + schemaName + "%22%5D";
            console.log("url with id three  args ================>", url);
        } else {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + schemaName + "%22%5D";
            logger.info("url without id ================>", url);
        }
        logger.info("url================>", url);
        var options = {
            method: constants.REQUEST_GET,
            uri: url,
            headers: {
                "Content-Type": constants["CONTENT-TYPE"],
                "authorization": "Bearer " + fabricToken
            },
            json: true
        };
        try {
            var response = await request2(options);
            logHelper.logDebug(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, constants.RESPONSE, response);
            logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
            return Promise.resolve(response);
        } catch (error) {
            logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
            Promise.reject(error);
        }
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
        return error;
    }
}
/**
 *
 *
 * @param {*} fabricToken
 * @param {*} attributeName
 * @param {*} attributeVal
 * @param {*} schemaName
 * @param {*} userType
 * @param {*} chainCodeName
 * @param {*} functionname
 * @param {*} custodianPeer
 * @param {*} persona
 * @param {*} orgName
 * @returns
 */
async function queryChainCodeFourArgs(fabricToken, attributeName, attributeVal, schemaName, userType, chainCodeName, functionname, custodianPeer, persona, orgName) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
    console.log('queryChainCode  args...............', attributeName, attributeVal, schemaName, userType)
    var url;
    var hostname = configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST;
    try {
        if (attributeName != "") {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + attributeName + "%22%2C%22" + attributeVal + "%22%2C%22" + schemaName + "%22%2C%22" + userType + "%22%5D";
            console.log("url with id four args ================>", url);
        } else {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + schemaName + "%22%5D";
            logger.info("url without id ================>", url);
        }
        logger.info("url================>", url);
        var options = {
            method: constants.REQUEST_GET,
            uri: url,
            headers: {
                "Content-Type": constants["CONTENT-TYPE"],
                "authorization": "Bearer " + fabricToken
            },
            json: true
        };
        try {
            var response = await request2(options);
            logHelper.logDebug(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, constants.RESPONSE, response);
            logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
            return Promise.resolve(response);
        } catch (error) {
            logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
            Promise.reject(error);
        }
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
        return error;
    }
}
/**
 *
 *
 * @param {*} fabricToken
 * @param {*} attributeName
 * @param {*} attributeVal
 * @param {*} schemaName
 * @param {*} insurerName
 * @param {*} userType
 * @param {*} chainCodeName
 * @param {*} functionname
 * @param {*} custodianPeer
 * @param {*} persona
 * @param {*} orgName
 * @returns
 */
async function queryChainCodeFiveArgs(fabricToken, attributeName, attributeVal, schemaName, insurerName, userType, chainCodeName, functionname, custodianPeer, persona, orgName) {
    logHelper.logMethodEntry(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
    console.log('queryChainCode  args...............', attributeName, attributeVal, schemaName, userType)
    var url;
    var hostname = configData.CHAINCODE_API_SERVICE_URL_HOST_FIRST;
    try {
        if (attributeName != "") {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + attributeName + "%22%2C%22" + attributeVal + "%22%2C%22" + schemaName + "%22%2C%22" + insurerName + "%22%2C%22" + userType + "%22%5D";
            console.log("url with id two args ================>", url);
        } else {
            var url = hostname + configData.channelName + "/chaincodes/" + chainCodeName + "?peer=" + custodianPeer + "&fcn=" + functionname + "&args=%5B%22" + schemaName + "%22%5D";
            logger.info("url without id ================>", url);
        }
        logger.info("url================>", url);
        var options = {
            method: constants.REQUEST_GET,
            uri: url,
            headers: {
                "Content-Type": constants["CONTENT-TYPE"],
                "authorization": "Bearer " + fabricToken
            },
            json: true
        };
        try {
            var response = await request2(options);
            logHelper.logDebug(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, constants.RESPONSE, response);
            logHelper.logMethodExit(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE);
            return Promise.resolve(response);
        } catch (error) {
            logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
            Promise.reject(error);
        }
    } catch (error) {
        logHelper.logError(logger, constants.CHAINCODE_SERVICE_FILE, constants.QUERY_CHAINCODE, error);
        return error;
    }
}