'use strict';
var utils = require('../utils/writer.js');
var insurancePolicyService = require('../service/insurancePolicyService');
var config = require('config');
var constants = require('../config/constants.js');
var logHelper = require('../utils/logging.js');
var logger = logHelper.getLogger(config.processname);


module.exports = {
    
    addBankLoanInfo : addBankLoanInfo,
    getIpLetterCountByBankNNoticeDate : getIpLetterCountByBankNNoticeDate,
    getExpiredIpCountOfLastNDaysByBankNDate : getExpiredIpCountOfLastNDaysByBankNDate,
    getIPNoticeRecvdSummary : getIPNoticeRecvdSummary,
    processIpLetters : processIpLetters,
    getIpLetterDetailsByBankNDate : getIpLetterDetailsByBankNDate,
    getExpiringIpLetterCountOfNdaysByInsurerNDate : getExpiringIpLetterCountOfNdaysByInsurerNDate,
    getExpiredIPLetterByBankNDate : getExpiredIPLetterByBankNDate,
    listBankIPLettersByBankNlimit : listBankIPLettersByBankNlimit,
    searchIPNotices : searchIPNotices,
    searchIPNoticesByBank : searchIPNoticesByBank,
    searchIPNoticesByInsurer : searchIPNoticesByInsurer,
    uploadIpLetters : uploadIpLetters,
    updateUnmatchIPNotices: updateUnmatchIPNotices,
    listUnmatchedNotices : listUnmatchedNotices,
    downloadUnmatchedNotices : downloadUnmatchedNotices,
    ipNoticesSummary : ipNoticesSummary, 
    getAuditorIpCountByNoticeDate : getAuditorIpCountByNoticeDate,
    getIpNoticeByBankAndNoticeDate : getIpNoticeByBankAndNoticeDate,
    getExpiredIpNoticeCountByDate : getExpiredIpNoticeCountByDate,
    getExpiredIpNoticeByBankAndDate : getExpiredIpNoticeByBankAndDate,
    getAuditorPoliciesExpiringCount : getAuditorPoliciesExpiringCount,
    getAuditorExpiringPoliciesByBank : getAuditorExpiringPoliciesByBank,
    getExpiringIpLetterDetailsByDateRange : getExpiringIpLetterDetailsByDateRange,
    addBankLoanInfoOptions:ipNoticesRecvdSummaryOptions,
    getExpiredPoliciesByDateOptions : ipNoticesRecvdSummaryOptions,
    getExpiringIpLetterCountOfNdaysByInsurerNDateOptions : ipNoticesRecvdSummaryOptions,
    getIpLetterDetailsByBankNDateOptions: ipNoticesRecvdSummaryOptions,
    processIpLettersOptions:ipNoticesRecvdSummaryOptions,
    getIpLetterCountByBankNNoticeDateOptions:ipNoticesRecvdSummaryOptions,
    getIPNoticeRecvdSummaryOption : ipNoticesRecvdSummaryOptions,
    listBankIPLettersByBankNlimitOptions : ipNoticesRecvdSummaryOptions,
    searchIPNoticesOptions : ipNoticesRecvdSummaryOptions,
    ssearchIPNoticesByBankOptions : ipNoticesRecvdSummaryOptions,
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
function getIpLetterCountByBankNNoticeDate(req, res) {
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY);
    insurancePolicyService.getIpLetterCountByBankNNoticeDate(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_ALL_IP_NOTICE_RECVD_SUMRY);
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
function getExpiredIpNoticeCountByDate(req, res) {
  console.log('ccccccccccccccccccccccccccccccccccccccc');
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
  insurancePolicyService.getExpiredIpNoticeCountByDate(req,res).then(function (response) {
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
function getExpiringIpLetterDetailsByDateRange(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
  insurancePolicyService.getExpiringIpLetterDetailsByDateRange(req,res).then(function (response) {
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
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
  insurancePolicyService.getIpNoticeByBankAndNoticeDate(req,res).then(function (response) {
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
function getExpiredIpNoticeByBankAndDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_AUDITOR_IP_COUNT_BY_NOTICEDATE);
  insurancePolicyService.getExpiredIpNoticeByBankAndDate(req,res).then(function (response) {
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
function getExpiredIpCountOfLastNDaysByBankNDate(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IP_COUNT_BY_DATE);
  insurancePolicyService.getExpiredIpCountOfLastNDaysByBankNDate(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IP_COUNT_BY_DATE, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_IP_COUNT_BY_DATE);
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
function getIPNoticeRecvdSummary(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY);
  insurancePolicyService.getIPNoticeRecvdSummary(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IP_NOTICE_RECVD_SUMMARY);
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
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.ACKNOWLEDGE_IP_NOTICE);
    insurancePolicyService.processIpLetters(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.ACKNOWLEDGE_IP_NOTICE, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.ACKNOWLEDGE_IP_NOTICE);
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
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IP_NOTICES_BY_DATE);
    insurancePolicyService.getIpLetterDetailsByBankNDate(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IP_NOTICES_BY_DATE, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_IP_NOTICES_BY_DATE);
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
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING);
    insurancePolicyService.getExpiringIpLetterCountOfNdaysByInsurerNDate(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING);
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
  console.log('11111111111111111111111111');
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_POLICIES_BY_DATE);
    insurancePolicyService.getExpiredIPLetterByBankNDate(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_POLICIES_BY_DATE, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_EXPIRED_POLICIES_BY_DATE);
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
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_IP_NOTICES);
    insurancePolicyService.listBankIPLettersByBankNlimit(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_IP_NOTICES, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_IP_NOTICES);
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
function searchIPNoticesByBank(req, res) {
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.SEARCH_IP_NOTICES);
    insurancePolicyService.searchIPNoticesByBank(req,res).then(function (response) {
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
function uploadIpLetters(req, res) {
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_NOTICES);
    insurancePolicyService.uploadIpLetters(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_NOTICES, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_NOTICES);
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
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_NOTICES);
  insurancePolicyService.updateUnmatchIPNotices(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_NOTICES, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.UPLOAD_IP_NOTICES);
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
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_UNMATCHED_NOTICES);
  insurancePolicyService.downloadUnmatchedNotices(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_UNMATCHED_NOTICES, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.LIST_UNMATCHED_NOTICES);
      console.log("response.result.toString()===>",response.result.toString());
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
function ipNoticesSummary(req, res) {
    logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.IP_NOTICES_SUMMARY);
    insurancePolicyService.ipNoticesSummary(req,res).then(function (response) {
        logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.IP_NOTICES_SUMMARY, constants.RESPONSE, response);
        logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.IP_NOTICES_SUMMARY);
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

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function getAuditorPoliciesExpiringCount(req, res) {
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING);
  insurancePolicyService.getAuditorPoliciesExpiringCount(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING);
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
  logHelper.logMethodEntry(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING);
  insurancePolicyService.getAuditorExpiringPoliciesByBank(req,res).then(function (response) {
      logHelper.logDebug(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING, constants.RESPONSE, response);
      logHelper.logMethodExit(logger, constants.INSURANCE_POLICY_CONTROLLER_FILE, constants.GET_POLICIES_EXPIRING);
      utils.writeJson(res, response,constants.SUCCESS);
    }).catch(function (response) {
      utils.writeJson(res, response,constants.ERROR_CODE);
    });
  };