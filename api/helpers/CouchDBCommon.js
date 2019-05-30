/**
 * 
Copyright 2018 HCL Technologies

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 * 
 * 
 */

/**
@author: Munesh
@version: 1.0
@date: 
**/


var logHelper = require('../../utils/logging.js');
var request = require('async-request');
var request2 = require('request-promise');
var logger = logHelper.getLogger('CouchDBCommon');
var fs = require('fs');
var couchDBConfigData = fs.readFileSync('config/couchdb.json', 'utf8');
var couchDBConfig = JSON.parse(couchDBConfigData);
console.log("Couch DB URL :: ", (couchDBConfig.protocol + '://' + couchDBConfig.hostname + ':' + couchDBConfig.port + "/" + couchDBConfig.db))
const couchdb = require('nano')(couchDBConfig.protocol + '://' + couchDBConfig.hostname + ':' + couchDBConfig.port + "/" + couchDBConfig.db);

module.exports = {
    readByKey: readByKey,
    saveByKeyValue: saveByKeyValue,
    deleteByKey: deleteByKey,
    save: save,
    find: find,
    updatePoolSummaryForNewLoan:updatePoolSummaryForNewLoan,
    updatePoolSummaryForUpdatePoolStatus:updatePoolSummaryForUpdatePoolStatus,
    updatePoolSummaryForLastPoolId:updatePoolSummaryForLastPoolId,
    updatePoolSummaryForUpdatedPoolId:updatePoolSummaryForUpdatedPoolId,
    update: update,
    findByQuery: findByQuery
}
async function readByKey(key) {
    var response;
    logger.info('Enter readByKey ');
    try {
        response = await couchdb.get(key);

    } catch (e) {
        logger.error(' readByKey error: ', e);
        return e;
    }
    logger.info('Exit readByKey ');
    return response;
}

async function saveByKeyValue(key, value) {
    var savedata;
    logger.info('Enter saveByKeyValue');
    try {
        savedata = await couchdb.insert(value, key);
    }
    catch (e) {
        logger.error('Exception', e);
        return e;
    }
    logger.info('Exit saveByKeyValue');
    return savedata;
}
async function save(value) {
    var data;
    logger.info('Enter save');
    try {
        data = await couchdb.insert(value);
    }
    catch (e) {
        logger.error('Save error occurred: ', e);
        return e;
    }
    logger.info('Exit save');
    return data;
}
async function update(value) {
    var data;
    logger.info('Enter update');
    try {
        data = await couchdb.insert(value);
    }
    catch (e) {
        logger.error('Update error occurred: ', e);
        return e;
    }
    logger.info('Exit update');
    return data;
}
async function findByQuery(query) {
    let notificationsDocs = await couchdb.find(query);
    if (notificationsDocs.docs.length < 1) {
        logger.info(`No new Notifications for User`);
        return [];
    } else {
        return notificationsDocs.docs;
    }
}

async function find(selector) {
    var result;
    var response = [];
    logger.info('Enter find');
    try {
        result = await couchdb.find({ selector: selector })
        logger.info('Found ' + result.docs.length + ' documents ');
        for (var i = 0; i < result.docs.length; i++) {
            //console.log('  Doc :: ', result.docs[i]);
            response.push(result.docs[i])
        }
    }
    catch (e) {
        logger.error(' find error:', e);
        return e;
    }
    return response;
}

async function deleteByKey(key) {
    var doc;
    var response;
    try {
        logger.info('Enter deleteByKey');
        doc = await couchdb.get(key);
    }
    catch (e) {
        logger.error(' find error:', e);
        return e;
    }
    try {
        response = couchdb.destroy(doc._id, doc._rev);
    }
    catch (e) {
        logger.error('deleteByKey:', e);
        return e;
    }
    logger.info('Exit deleteByKey');
    return response;
}

async function updatePoolSummaryForNewLoan(dbRes){
    var response = await updatePoolSummaryForUpdatedPoolId(dbRes);
    return response;
}

async function updatePoolSummaryForUpdatePoolStatus(dbRes, attribute, value){
    var revId = dbRes['_rev'];
    var Id = dbRes['_id'];
    delete dbRes['_rev'];
    delete dbRes['_id'];
    try{
    var response = await couchdb.destroy(Id, revId);
    if(response.ok){
        dbRes[attribute] = value;
        var res = await save(dbRes);
        return res;
    }
    } catch(error){
        logger.error(' find error in updatePoolSummaryForUpdatePoolStatus function:', error);
    }
}

async function updatePoolSummaryForLastPoolId(dbRes){
    var revId = dbRes['_rev'];
    var Id = dbRes['_id'];
    var numberOfLoans = dbRes['numberOfLoans'];
    delete dbRes['_rev'];
    delete dbRes['_id'];
    try{
    var response = await couchdb.destroy(Id, revId);
    if(response.ok){
        dbRes['numberOfLoans'] = numberOfLoans -1;
        var res = await save(dbRes);
        return res;
    }
    } catch(error){
        logger.error(' find error in updatePoolSummaryForLastPoolId function:', error);
    }
}

async function updatePoolSummaryForUpdatedPoolId(dbRes){
    var revId = dbRes['_rev'];
    var Id = dbRes['_id'];
    var numberOfLoans = dbRes['numberOfLoans'];
    delete dbRes['_rev'];
    delete dbRes['_id'];
    try{
    var response = await couchdb.destroy(Id, revId);
    if(response.ok){
        dbRes['numberOfLoans'] = numberOfLoans +1;
        var res = await save(dbRes);
        return res;
    }
    } catch(error){
        logger.error(' find error in updatePoolSummaryForAddLoan function:', error);
    }
}


