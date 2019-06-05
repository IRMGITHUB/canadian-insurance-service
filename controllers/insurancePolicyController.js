'use strict';
var utils = require('../utils/writer.js');
var insurancePolicyService = require('../service/insurancePolicyService');
var config = require('config');
var constants = require('../config/constants.js');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);


module.exports = {
    
    addBankLoanInfo : addBankLoanInfo,
    processIpLetters : processIpLetters,
    getIpLetterCountByBankNNoticeDate : getIpLetterCountByBankNNoticeDate,
    getIpLetterDetailsByBankNDate : getIpLetterDetailsByBankNDate,
    getExpiringIpLetterCountOfNdaysByInsurerNDate : getExpiringIpLetterCountOfNdaysByInsurerNDate,
    getExpiringIpLetterDetailsByDateRange : getExpiringIpLetterDetailsByDateRange,
    getExpiredIpCountOfLastNDaysByBankNDate : getExpiredIpCountOfLastNDaysByBankNDate,
    getExpiredIPLetterByBankNDate : getExpiredIPLetterByBankNDate,
    listBankIPLettersByBankNlimit : listBankIPLettersByBankNlimit,
    searchIPNoticesByBank : searchIPNoticesByBank,
    uploadIpLetters : uploadIpLetters,
    updateUnmatchIPNotices: updateUnmatchIPNotices,
    listUnmatchedNotices : listUnmatchedNotices,
    downloadUnmatchedNotices : downloadUnmatchedNotices,
    searchIPNotices : searchIPNotices,
    searchIPNoticesByInsurer : searchIPNoticesByInsurer,
    listIPNoticesByInsurer : listIPNoticesByInsurer,
    getAuditorIpCountByNoticeDate: getAuditorIpCountByNoticeDate,
    getIpNoticeByBankAndNoticeDate : getIpNoticeByBankAndNoticeDate,
    getAuditorPoliciesExpiringCount : getAuditorPoliciesExpiringCount,
    getAuditorExpiringPoliciesByBank : getAuditorExpiringPoliciesByBank,
    getExpiredIpNoticeCountByDate : getExpiredIpNoticeCountByDate,
    getExpiredIpNoticeByBankAndDate : getExpiredIpNoticeByBankAndDate,
    addBankLoanInfoOptions:ipNoticesRecvdSummaryOptions,
    getExpiredPoliciesByDateOptions : ipNoticesRecvdSummaryOptions,
    getExpiringIpLetterCountOfNdaysByInsurerNDateOptions : ipNoticesRecvdSummaryOptions,
    getIpLetterDetailsByBankNDateOptions: ipNoticesRecvdSummaryOptions,
    processIpLettersOptions:ipNoticesRecvdSummaryOptions,
    getIpLetterCountByBankNNoticeDateOptions:ipNoticesRecvdSummaryOptions,
    getIPNoticeRecvdSummaryOption : ipNoticesRecvdSummaryOptions,
    listBankIPLettersByBankNlimitOptions : ipNoticesRecvdSummaryOptions,
    searchIPNoticesOptions : ipNoticesRecvdSummaryOptions,
    searchIPNoticesByBankOptions : ipNoticesRecvdSummaryOptions,
    listIPNoticesByInsurerOptions : ipNoticesRecvdSummaryOptions,
    uploadIpLettersOptions : ipNoticesRecvdSummaryOptions,
    listUnmatchedNoticesOptions : ipNoticesRecvdSummaryOptions,
    ipNoticesSummaryOptions : ipNoticesRecvdSummaryOptions,
    searchIPNoticesByInsurerOptions : ipNoticesRecvdSummaryOptions,
    getAuditorIpCountByNoticeDateOptions : ipNoticesRecvdSummaryOptions,
    getIpNoticeByBankAndNoticeDateOptions : ipNoticesRecvdSummaryOptions,
    getExpiredIpNoticeCountByDateOptions : ipNoticesRecvdSummaryOptions,
    getExpiredIpCountOfLastNDaysByBankNDateOptions : ipNoticesRecvdSummaryOptions,
    getAuditorPoliciesExpiringCountOptions : ipNoticesRecvdSummaryOptions,
    getAuditorExpiringPoliciesByBankOptions : ipNoticesRecvdSummaryOptions,
    updateUnmatchIPNoticesOptions: ipNoticesRecvdSummaryOptions,
    getExpiringIpLetterDetailsByDateRangeOptions : ipNoticesRecvdSummaryOptions
}

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function addBankLoanInfo(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.ADD_LOAN_INFO);
  insurancePolicyService.addBankLoanInfo(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.ADD_LOAN_INFO, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.ADD_LOAN_INFO);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

  /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function processIpLetters(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.PROCESS_IP_LETTERS);
  insurancePolicyService.processIpLetters(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.PROCESS_IP_LETTERS, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.PROCESS_IP_LETTERS);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getIpLetterCountByBankNNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPLETTER_COUNT_BY_BANKNNOTICEDATE);
  insurancePolicyService.getIpLetterCountByBankNNoticeDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPLETTER_COUNT_BY_BANKNNOTICEDATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPLETTER_COUNT_BY_BANKNNOTICEDATE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getIpLetterDetailsByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPLETTER_DETAILS_BY_BANKNDATE);
  insurancePolicyService.getIpLetterDetailsByBankNDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPLETTER_DETAILS_BY_BANKNDATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPLETTER_DETAILS_BY_BANKNDATE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };


  /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getExpiringIpLetterCountOfNdaysByInsurerNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRING_IPLETTER_COUNT_OFNDAYS_BY_INSURERNDATE);
  insurancePolicyService.getExpiringIpLetterCountOfNdaysByInsurerNDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRING_IPLETTER_COUNT_OFNDAYS_BY_INSURERNDATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRING_IPLETTER_COUNT_OFNDAYS_BY_INSURERNDATE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

 /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getExpiringIpLetterDetailsByDateRange(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRING_IPLETTER_DETAILS_BY_DATERANGE);
  insurancePolicyService.getExpiringIpLetterDetailsByDateRange(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRING_IPLETTER_DETAILS_BY_DATERANGE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRING_IPLETTER_DETAILS_BY_DATERANGE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getExpiredIpCountOfLastNDaysByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IP_COUNT_OF_LAST_NDAYS_BY_BANKNDATE);
  insurancePolicyService.getExpiredIpCountOfLastNDaysByBankNDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IP_COUNT_OF_LAST_NDAYS_BY_BANKNDATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IP_COUNT_OF_LAST_NDAYS_BY_BANKNDATE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getExpiredIPLetterByBankNDate(req, res) {
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPLETTER_BY_BANK_N_DATE);
    insurancePolicyService.getExpiredIPLetterByBankNDate(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPLETTER_BY_BANK_N_DATE, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPLETTER_BY_BANK_N_DATE);
        utils.writeJson(res, response,constants.SUCCESS);
      }).catch(function (response) {
        utils.writeJson(res, response,constants.ERROR_CODE);
      });
    };

  /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function listBankIPLettersByBankNlimit(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_BANK_IPLETTERS_BY_BANK_N_LIMIT);
  insurancePolicyService.listBankIPLettersByBankNlimit(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_BANK_IPLETTERS_BY_BANK_N_LIMIT, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_BANK_IPLETTERS_BY_BANK_N_LIMIT);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function searchIPNoticesByBank(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IPNOTICES_BY_BANK);
  insurancePolicyService.searchIPNoticesByBank(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IPNOTICES_BY_BANK, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IPNOTICES_BY_BANK);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function uploadIpLetters(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_LETTERS);
  insurancePolicyService.uploadIpLetters(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_LETTERS, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_LETTERS);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

   /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function updateUnmatchIPNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPDATE_UNMATCH_IPNOTICES);
  insurancePolicyService.updateUnmatchIPNotices(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPDATE_UNMATCH_IPNOTICES, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPDATE_UNMATCH_IPNOTICES);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function listUnmatchedNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_UNMATCHED_NOTICES);
  insurancePolicyService.listUnmatchedNotices(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_UNMATCHED_NOTICES, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_UNMATCHED_NOTICES);
      utils.writeJson(res, response,constants.SUCCESS);
       }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

   /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function downloadUnmatchedNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.DOWNLOAD_UNMATCHED_NOTICES);
  insurancePolicyService.downloadUnmatchedNotices(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.DOWNLOAD_UNMATCHED_NOTICES, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.DOWNLOAD_UNMATCHED_NOTICES);
      res.download(response.result.toString());
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

  /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function searchIPNotices(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES);
  insurancePolicyService.searchIPNotices(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function searchIPNoticesByInsurer(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES_BY_INSURER);
  insurancePolicyService.searchIPNoticesByInsurer(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES_BY_INSURER, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES_BY_INSURER);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

  /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function listIPNoticesByInsurer(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES_BY_INSURER);
  insurancePolicyService.listIPNoticesByInsurer(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES_BY_INSURER, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES_BY_INSURER);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };



   /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getAuditorIpCountByNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
  insurancePolicyService.getAuditorIpCountByNoticeDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

   /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getIpNoticeByBankAndNoticeDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPNOTICE_BY_BANK_AND_NOTICEDATE);
  insurancePolicyService.getIpNoticeByBankAndNoticeDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPNOTICE_BY_BANK_AND_NOTICEDATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IPNOTICE_BY_BANK_AND_NOTICEDATE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

  /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getAuditorPoliciesExpiringCount(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_POLICIES_EXPIRING_COUNT);
  insurancePolicyService.getAuditorPoliciesExpiringCount(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_POLICIES_EXPIRING_COUNT, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_POLICIES_EXPIRING_COUNT);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

 /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getAuditorExpiringPoliciesByBank(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_EXPIRING_POLICIES_BY_BANK);
  insurancePolicyService.getAuditorExpiringPoliciesByBank(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_EXPIRING_POLICIES_BY_BANK, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_EXPIRING_POLICIES_BY_BANK);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

    /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getExpiredIpNoticeCountByDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPNOTICE_COUNT_BY_DATE);
  insurancePolicyService.getExpiredIpNoticeCountByDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPNOTICE_COUNT_BY_DATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPNOTICE_COUNT_BY_DATE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };

  /**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getExpiredIpNoticeByBankAndDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPNOTICE_BY_BANKANDDATE);
  insurancePolicyService.getExpiredIpNoticeByBankAndDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPNOTICE_BY_BANKANDDATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IPNOTICE_BY_BANKANDDATE);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };




/**
 * This method will send options method call as a success.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function ipNoticesRecvdSummaryOptions(req, res, next) {
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.IP_NOTICE_RECVD_SUMRY_OPTIONS);
    logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.OPTIONS_METHOD, constants.REQUEST+"Req Method - "+req.method);
    logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.IP_NOTICE_RECVD_SUMRY_OPTIONS);
    res.sendStatus(200);
    next();
  }



  