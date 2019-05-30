"use strict";
var db = require('../../api/helpers/CouchDBCommon.js');
var constants = require('../../config/constants.js');
var chaincodeService = require('../../service/chaincodeService');
var fs = require('fs');
var jwt = require("jsonwebtoken");
var crypto = require('crypto');
var config = require('config');
var logHelper = require('../../utils/logging.js');
var logger = logHelper.getLogger(config.processname);
var configDetails = fs.readFileSync('config/config.json','utf8');
var configData = JSON.parse(configDetails);


//Here we setup the security checks for the endpoints
//that need it (in our case, only /protected). This
//function will be called every time a request to a protected
//endpoint is received
//Here we setup the security checks for the endpoints
//that need it (in our case, only /protected). This
//function will be called every time a request to a protected
//endpoint is received


module.exports = {
  validateToken: validateToken,
  generateToken: generateToken
}

/**
 * This method is use to validate the token
 * @param {*} tokenString 
 * @param {*} callback 
 */
function validateToken(tokenString, callback) {
  logHelper.logMethodEntry(logger, constants.AUTH_FILE, constants.VALIDATE_TOKEN);
  function sendError() {
    return { code: 405, message: constants.INPUT_TOKEN};
  }
  function sendSuccess(decodedToken) {
    return { code: 200, message: constants.VALID_TOKEN, decodedToken: decodedToken };
  }

  if (tokenString && tokenString.length > 0) {
    jwt.verify(tokenString, constants.SHARED_SECRET, function (
      verificationError,
      decodedToken
    ) {
      if (verificationError == null && decodedToken && decodedToken.persona && decodedToken.fabricToken) {
        var issuerMatch = decodedToken.iss == constants.ISSUER;
        if (issuerMatch) {
          logHelper.logMethodExit(logger, constants.AUTH_FILE, constants.VALIDATE_TOKEN);
          return callback(sendSuccess(decodedToken));
        } else {
          return callback(sendError());
        }
      } else {
        //return the error in the callback if the JWT was not verified
        return callback(sendError());
      }
    });
  } else {
    return callback(sendError());
  }
}

function isSubscriptionKeyValid(subKey){
  if(subKey && (subKey===configData.SUB_KEY || subKey==='subscriptionKey')){
    return true;
  }
  return false;
}

/**
 * This method is use to generate the token
 * @param {*} userDetails 
 * @param {*} res 
 */
async function generateToken(userDetails, res) {
  logHelper.logMethodEntry(logger, constants.AUTH_FILE, constants.GENERATE_TOKEN);
  logHelper.logDebug(logger, constants.AUTH_FILE, constants.GENERATE_TOKEN, constants.REQUEST, userDetails);
  var fabricToken;
  var userName
  var persona;
  var orgName;
  var enrollUserResp;
  var enrollUserbodyvalue;
  var responseValueJson;
  var hashpassword = crypto.createHash('sha256').update(userDetails.password).digest('hex');

  if(!isSubscriptionKeyValid(userDetails.subscriptionKey)){
      var errorData = {code: constants.UNAUTHORIZED, message: constants.WRONG_SUB_KEY};
      logHelper.logError(logger, constants.AUTH_FILE, constants.GENERATE_TOKEN, errorData);
      return errorData;
  }
  try {
    var result = await db.find({ "userId": userDetails.userId, "password": hashpassword });
    if (result.length > 0) {
        userName = result[0].userName;
        persona = result[0].persona;
        orgName = result[0].orgName;
      try {
        enrollUserResp = await chaincodeService.enrollUser(userDetails.userId, orgName, persona.toLowerCase());
        enrollUserbodyvalue = JSON.parse(enrollUserResp.body);
        if (enrollUserbodyvalue.success == true) {
            fabricToken = enrollUserbodyvalue.token;
        }
      } catch (error) {
          logHelper.logError(logger, constants.AUTH_FILE, constants.GENERATE_TOKEN, error);
        return error;
      }
      var token = jwt.sign(
        {
          sub: userDetails.userId,
          iss: constants.ISSUER,
          persona: persona,
          name: userName,
          orgName:orgName,
          fabricToken: fabricToken
        },
        constants.SHARED_SECRET
      );
      var responseValueJson =
      {
        token: token,
        persona: persona,
        name: userName,
        fabricToken: fabricToken,
        code: constants.SUCCESS
      }
    }
  }catch (error) {
    logHelper.logError(logger, constants.AUTH_FILE, constants.GENERATE_TOKEN, error);
    return error;
  }
  logHelper.logDebug(logger, constants.AUTH_FILE, constants.GENERATE_TOKEN, constants.RESPONSE, responseValueJson);
  logHelper.logMethodExit(logger, constants.AUTH_FILE, constants.GENERATE_TOKEN);
  return responseValueJson;
};

