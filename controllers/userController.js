'use strict';
const jwt = require('jsonwebtoken');
var utils = require('../utils/writer.js');
var userService = require('../service/userService');
var auth = require('../api/helpers/auth');
var config = require('config');
var constants = require('../config/constants.js');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);

module.exports = {
  authenticateUser: authenticateUser,
  validateTokenInternally: validateTokenInternally,
  validateToken:validateToken,
  findByUserId:findByUserId,
  findByPersona:findByPersona,
  updatePersona: updatePersona,
  // Options method success call

  optionsMethodAuth: optionsMethodAuth,
  optionsMethodFindPersona: optionsMethodAuth,
  optionsMethodValidateToken: optionsMethodAuth,
  optionsMethodFindByUserId: optionsMethodAuth
}

/**
 * This method is used to authenticate user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function authenticateUser (req, res, next) {
  logHelper.logMethodEntry(logger, constants.USER_CONTROLLER_FILE, constants.AUTHENTICATE_USER);
  var userpassworddetails;
  try{
   userpassworddetails = req.swagger.params['body'].value;
   logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.AUTHENTICATE_USER, constants.REQUEST +userpassworddetails);
    userService.authenticateUser(userpassworddetails).then(function (response) {
      delete response.decodedToken;
      logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.AUTHENTICATE_USER, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.USER_CONTROLLER_FILE, constants.AUTHENTICATE_USER);
      utils.writeJson(res, response,constants.SUCCESS);
    })   
  }catch (error) {
    logHelper.logError(logger, constants.USER_CONTROLLER_FILE, constants.AUTHENTICATE_USER, error);
    utils.writeJson(res, response,constants.ERROR_CODE);
  }
}

/**
 * This method is used to validate token internally
 * @param {*} req 
 * @param {*} authOrSecDef 
 * @param {*} token 
 * @param {*} callback 
 */
function validateTokenInternally(req, authOrSecDef, token, callback) {
  logHelper.logMethodEntry(logger, constants.USER_CONTROLLER_FILE, constants.VALIDATE_TOKEN_INTERNALLY);
    var tokenData = req.get('token');
    if(token && token.length>0){
      tokenData=token;
    }
    if(tokenData.indexOf("Bearer ") == 0){
      token = tokenData.split(" ")[1];
    }
    else{
      token=tokenData;
    }
    logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.VALIDATE_TOKEN_INTERNALLY, constants.REQUEST +"Token - "+token);
    userService.validateToken(token).then(function (response) {
      if(response && response.decodedToken){
        logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.VALIDATE_TOKEN_INTERNALLY, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.USER_CONTROLLER_FILE, constants.VALIDATE_TOKEN_INTERNALLY);
        req.auth=response.decodedToken;
      }
      else{
        return req.res.status(response.code).json({ message: response.message });
      }
      callback(null);
    }).catch(function (response) {
      callback(response);
    });
}

/**
 * This method is used to validate token
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function validateToken (req, res, next) {
  logHelper.logMethodEntry(logger, constants.USER_CONTROLLER_FILE, constants.VALIDATE_TOKEN);
  var tokenBody=req.swagger.params['body'].value;
  var token = tokenBody.token;
  logger.info('Enter validateToken function');
  if(token.indexOf("Bearer ") == 0){
    token = token.split(" ")[1];
  }
  logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.VALIDATE_TOKEN, constants.REQUEST +"Token - "+token);
  userService.validateToken(token).then(function (response) {
      delete response.decodedToken;
      logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.VALIDATE_TOKEN, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.USER_CONTROLLER_FILE, constants.VALIDATE_TOKEN);
      utils.writeJson(res, response, response.code);  
    }).catch(function (response) {
        utils.writeJson(res, response,constants.ERROR_CODE);
    });
}

/**
 * This method is used to find user by Id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function findByUserId (req, res, next) {
  logHelper.logMethodEntry(logger, constants.USER_CONTROLLER_FILE, constants.FIND_BY_USER_ID);
  var userId = req.swagger.params['userId'].value;
  logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.FIND_BY_USER_ID, constants.REQUEST + "UserId - "+userId);
  userService.findByUserId(userId).then(function (response) {
      logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.FIND_BY_USER_ID, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.USER_CONTROLLER_FILE, constants.FIND_BY_USER_ID);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
}
  
/**
 * This method is used to find Persona
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function findByPersona (req, res, next) {
  logHelper.logMethodEntry(logger, constants.USER_CONTROLLER_FILE, constants.FIND_BY_PERSONA);
  var persona = req.swagger.params['persona'].value;
  logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.FIND_BY_PERSONA, constants.REQUEST+ "Persona - "+persona);
  userService.findByPersona(persona).then(function (response) {
    logHelper.logDebug(logger, constants.USER_CONTROLLER_FILE, constants.FIND_BY_PERSONA, constants.RESPONSE, response);
    logHelper.logMethodExit(logger, constants.USER_CONTROLLER_FILE, constants.FIND_BY_PERSONA);
    utils.writeJson(res, response,constants.SUCCESS);
  }).catch(function (response) {
    utils.writeJson(res, response,constants.ERROR_CODE);
  });
}

/**
 * This method will send options method call as a success.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function optionsMethodAuth(req, res, next) {
  logHelper.logMethodEntry(logger, constants.NOTIFICATION_CONTROLLER_FILE, constants.OPTIONS_METHOD);
  logHelper.logDebug(logger, constants.NOTIFICATION_CONTROLLER_FILE, constants.OPTIONS_METHOD, constants.REQUEST+"Req Method - "+req.method);
  res.sendStatus(200);
}


function updatePersona(req, res, next) {
  var persona = req.swagger.params['persona'].value;
  var userId = req.swagger.params['userId'].value;
  userService.updateUserId(userId, persona).then(function (response) {
      logHelper.logDebug(logger, constants.LOAN_ASSET_CONTROLLER_FILE, constants.UPDATE_LOAN_STATUS_LCN, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.LOAN_ASSET_CONTROLLER_FILE, constants.UPDATE_LOAN_STATUS_LCN);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
}  