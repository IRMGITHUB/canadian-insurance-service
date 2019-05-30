/**
@author: Munesh Rawat
@version: 1.0
@date: 06/01/2019
@Description: Logger file
**/

var log4js  = require('log4js');
var Dict = require("collections/dict");
var util = require("util");

var validate = require('../utils/validation_helper.js')
var isInitialized = false;
var loggers = Dict();
var fileName;


/**
 * Set up logging for processName in environment (prod, staging, qa1, ...)
 * Logging is set up from the log4js config file in ./config/log4js.config.json.
 * Logs go in the ./logs dir, created by this function if they do not exist.
 * Logs are rolling by date; a new log file is created each day. eg: eecymanager-2018-09-11.log
 * See eecymanager for usage.
 * @param {String} processName (eecymain, eecyconsole, ...)
 * @param {String} environment (prod, staging, qa1, ...)
 * @returns {Logger} logger with category processName
 * @public
 */
/*This defines two appenders named ‘out’ and ‘app’. ‘out’ uses the stdout appender which writes to standard out. 
    ‘app’ uses the file appender, configured to write to ‘application.log’.
    levels :
    trace : highest, show all kind of logs
    debug : print all level except trace
    info : print all level except trace & debug
    warn : print all level except trace & debug & Info
    error : print only error and fatal
    fatal : print only fatal
    */
function initialize(processName, environment, config, level) {
    var fs      = require('fs');
    var path    = require('path');
    var logpath = path.join('logs');
    if(isInitialized){
        return;
    }
    var logger;
 
    log4js.configure(config);
    logger = log4js.getLogger(processName);

    logger.info();
    logger.info("-----------------------------------------------------------------------------");
    logger.info(">>> %s env %s, started %s <<<", processName, environment, new Date());
    logger.info("-----------------------------------------------------------------------------");
    logger.info('Node started via(process.argv): %s', process.argv);
    logger.info('Node version: %s', process.version);
    logger.info('Node and its dependency versions: %j', process.versions);
    logger.info();

    var envString = environment.toLowerCase();
    if (envString !== "local" && envString !== "development") {
        // don't catch exceptions for local dev environment as it causes Mocha issues
        process.on('exit', function(code) {
            //logger.fatal('About to exit with code:', code);
            console.log('About to exit with code:', code);
          });

        process.on('uncaughtException', function(error) {
            var exLogger = log4js.getLogger('exceptions');
            exLogger.setLevel('ERROR');
            // handle the error safely
            exLogger.fatal(error);
            logger.fatal('Node server exiting due to exception: ' + error); // NodeJS guideline for uncaught exceptions
            logger.info();
            logger.info("-------------------------------------------------------------------------------");
            logger.info("!!! %s env %s, exited due to uncaughtException %s !!!", processName, environment, new Date());
            logger.info("-------------------------------------------------------------------------------");
            logger.info();
            //NodeJS guideline for uncaught exceptions
            log4js.shutdown(function() { process.exit(1); });  // get full logs on disk before exiting
        });
    }
     isInitialized = true;
     return logger;
}

/**
 * This is a proxy for the log4js `getLogger()` method.
 * All modules requiring a logger should make the request through this proxy
 * so that we can track all of the loggers being used across the application.
 * This makes it much easier to change logging levels on the fly without an
 * application restart.
 * @param String name of the logger to be used
 */
function getLogger(name,file_Name) {
    var logger = loggers.get(name);
    fileName = file_Name;
    if (!validate.isValid(logger)) {
        logger = log4js.getLogger(name);
        
        if (!logger.level) {
            logger.setLevel(log4js.getDefaultLogger().level);
        }        
        
        loggers.set(name, logger);
        
        if(logger){
            logger.info('Created logger for %s at level %s', name, logger.level);
        }
    } 
    return logger;
}

/**
 * Returns an object of all registered loggers
 * @returns {___anonymous_loggers}
 */
function getLoggers() {
    return loggers;
}
/**
TODO: Format log messages to json objects that can be consumed by elk
**/

function logMethodEntry(logger, className, method){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method)){
        logger.trace('%s --> %s : entry',className, method);
    }
}

function logMethodExit(logger, className, method){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method)){
        logger.trace('%s --> %s : exit',className, method);
    }
}
function logTrace(logger, className, method, msg, json){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method) && validate.isValid(msg)){
        if(typeof json === 'undefined'){
            json = {};
        }
        if(validate.isValidJson(json)){
            logger.trace('%s --> %s : %s - %j',className, method, msg, json);
        }
        else{           
            logger.trace('%s --> %s : %s',className, method, msg);
        }
    }
}
function logDebug(logger, className, method, msg, json){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method) && validate.isValid(msg)){
        if(typeof json === 'undefined'){
            json = {};
        }
        if(validate.isValidJson(json)){
            logger.debug('%s --> %s : %s - %j',className, method, msg, json);
        }
        else{           
            logger.debug('%s --> %s : %s',className, method, msg);
        }
    }
}
function logInfo(logger, className, method, msg, json){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method) && validate.isValid(msg)){
        if(typeof json === 'undefined'){
            json = {};
        }
        if(validate.isValidJson(json)){
            logger.info('%s --> %s : %s - %j',className, method, msg, json);
        }
        else{           
            logger.info('%s --> %s : %s',className, method, msg);
        }
    }
}
function logWarn(logger, className, method, msg, json){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method) && validate.isValid(msg)){
        if(typeof json === 'undefined'){
            json = {};
        }
        if(validate.isValidJson(json)){
            logger.warn('%s --> %s : %s - %j',className, method, msg, json);
        }
        else{           
            logger.warn('%s --> %s : %s',className, method, msg);
        }
    }
}
function logError(logger, className, method, msg, json){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method) && validate.isValid(msg)){
        if(typeof json === 'undefined'){
            json = {};
        }
        if(validate.isValidJson(json)){
            logger.error('%s --> %s : %s - %j',className, method, msg, json);
        }
        else{           
            logger.error('%s --> %s : %s',className, method, msg);
        }
    }
}
function logFatal(logger, className, method, msg, json){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method) && validate.isValid(msg)){
        if(typeof json === 'undefined'){
            json = {};
        }
        if(validate.isValidJson(json)){
            logger.fatal('%s --> %s : %s - %j',className, method, msg, json);
        }
        else{           
            logger.fatal('%s --> %s : %s',className, method, msg);
        }
    }
}

function logJson(logger, className, method, json){
    if(validate.isValid(logger) && validate.isValid(className) && validate.isValid(method) && validate.isValid(json)){
        if(validate.isValidJson(json)){
            logger.trace('%s --> %s : %j',className, method, json);
        }
        else{
            logger.trace('%s --> %s : %s',className, method);
        }
    }
}

module.exports = {
        initialize : initialize,
        getLogger: getLogger,
        getLoggers: getLoggers,
        logMethodEntry: logMethodEntry,
        logMethodExit: logMethodExit,
        logTrace: logTrace,
        logDebug: logDebug,
        logInfo: logInfo,
        logWarn: logWarn,
        logError: logError,
        logFatal: logFatal,
        logJson: logJson
        
};