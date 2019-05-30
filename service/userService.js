'use strict';
const auth = require('../api/helpers/auth');
var chaincodeService = require('../service/chaincodeService');
var constants = require('../config/constants.js');
var config = require('config');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);
var db = require('../api/helpers/CouchDBCommon.js');

module.exports = {
  authenticateUser: authenticateUser,
  validateToken: validateToken,
  findByUserId: findByUserId,
  findByPersona: findByPersona,
  updateUserId: updateUserId
}

/**
 * This method is used to authenticate the user
 * @param {*} userpassworddetails 
 * @param {*} res 
 */
async function authenticateUser(userpassworddetails, res) {
  logHelper.logMethodEntry(logger, constants.USER_SERVICE_FILE, constants.AUTHENTICATE_USER);
  logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.AUTHENTICATE_USER, constants.REQUEST, userpassworddetails);
  var userpassworddetails;
  var result = {};
  try {
    var tokenDetails = await auth.generateToken(userpassworddetails, res);
    result = {
      userId: userpassworddetails.userName,
      persona: tokenDetails.persona,
      name: tokenDetails.name,
      token: tokenDetails.token,
      message: tokenDetails.message,
      fabricToken: tokenDetails.fabricToken,
      code: tokenDetails.code
    }
    if (Object.keys(result).length > 0) {
      logHelper.logMethodExit(logger, constants.USER_SERVICE_FILE, constants.AUTHENTICATE_USER);
      logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.AUTHENTICATE_USER, constants.RESPONSE, result);
      return result;
    }
  }catch (error) {
    console.log("error==================",error);
    logHelper.logError(logger, constants.USER_SERVICE_FILE, constants.AUTHENTICATE_USER, error);
    return ({code: constants.WORNG_USER_NAME_PASSWORD, message: constants.INVALID_USERID_PASSWORD});
  }
}

/**
 * This method is used to validate the token
 * @param {*} token 
 */
function validateToken(token) {
  logHelper.logMethodEntry(logger, constants.USER_SERVICE_FILE, constants.VALIDATE_TOKEN);
  logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.VALIDATE_TOKEN, constants.REQUEST, token);
  return new Promise(function (resolve, reject) {
    auth.validateToken(token, function (response) {
      if (response && response.code) {
        var result = {};
        result['application/json'] = {
          "code": response.code,
          "message": response.message,
          "decodedToken": response.decodedToken,
          "success": (response.code === constants.SUCCESS ? constants.TRUE : constants.FALSE)
        }
        logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.VALIDATE_TOKEN, constants.RESPONSE, result);
        logHelper.logMethodExit(logger, constants.USER_SERVICE_FILE, constants.VALIDATE_TOKEN);
        resolve(result[Object.keys(result)[0]]);
      }
    });
  }).catch(function (error) {
    logHelper.logError(logger, constants.USER_SERVICE_FILE, constants.VALIDATE_TOKEN, error);
    return resolve({ code: constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500});
  });
}

/**
 * This method is used to find user by the userid
 * @param {*} userId 
 */
async function findByUserId(userId) {
  logHelper.logMethodEntry(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_USER_ID);
  logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_USER_ID, constants.REQUEST +"UserId - "+ userId);
  try{
    var result = await db.find({"userId": userId.toString()}); 
    var res = [];
      if (result.length > 0) {
        logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_USER_ID, constants.RESPONSE, result);
        logHelper.logMethodExit(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_USER_ID);
        return ({statusCode:constants.SUCCESS, result:result});
      } else {
        return ({statusCode:constants.NO_CONTENT, result:res});
      } 
  } catch(error){
    logHelper.logError(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_USER_ID, error);
    return ({code: constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500});
  }
}

/**
 * This method is used to find user by the persona
 * @param {*} persona 
 */
async function findByPersona(persona) {
  logHelper.logMethodEntry(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_PERSONA);
  logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_PERSONA, constants.REQUEST +"Persona - "+ persona);
  try{
    var result = await db.find({"persona": persona.toString()}); 
    var res = [];
      if (result.length > 0) {
        logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_PERSONA, constants.RESPONSE, result);
        logHelper.logMethodExit(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_PERSONA);
	for(var i = 0; i < result.length; i++) {
        delete result[i]['_rev'];
        delete result[i]['_id'];
        res.push(result[i]);
        }
        return ({statusCode:constants.SUCCESS, result:result});
      } else {
        return ({statusCode:constants.NO_CONTENT, result:[]});
      } 
  } catch(error){
    logHelper.logError(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_PERSONA, error);
    return ({code: constants.INTERNAL_SERVER_ERROR, message: constants.MESSAGE_500});
  }
}

async function updateUserId(userId, persona) {
  var reqBody = await db.find({"persona": persona});
  // console.log(reqBody)
  // const newBody = JSON.parse(reqBody);
  reqBody[0].userId = userId;
  logHelper.logMethodEntry(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_USER_ID);
  logHelper.logDebug(logger, constants.USER_SERVICE_FILE, constants.FIND_BY_USER_ID, constants.REQUEST +"UserId - "+ userId);
  var result = await db.update(reqBody[0]);
    if (Object.keys(result).length > 0) {
      logHelper.logDebug(logger, constants.NOTIFICATION_SERVICE_FILE, constants.UPDATE_NOTIFICATION, constants.RESPONSE, result);
      logHelper.logMethodExit(logger, constants.NOTIFICATION_SERVICE_FILE, constants.UPDATE_NOTIFICATION);
      return (result);
    } else {
      return ({code:constants.ERROR_CODE, message: constants.UPDATION_FAILED});
    }
}