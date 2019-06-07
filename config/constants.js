'use strict';

/**
@author:Munesh Rawat
@version: 1.0
@date: 20/04/2019
@Description: constants file
**/

module.exports = {
    //use key for Token Generation
	"ACCESS_CONTROL": "AccessControl",	
	"ARTWORK_REF_NUMBER": "ArtWorkRefNumber",
	"CONDITION_REPORT_NUMBER": "ConditionReportNumber",
	"TRANSACTION_ID": "TransactionId",
	"REQUEST_ID" : "requestId",
	"MORTGAGE_NUMBER":"mortgageNumber",
	"UNIQUE_LOAN_ID" : "uniqueLoanId",
	"ADD_ART_IMAGE": "addArtImage",
	"SUCCESS": 200,
	"UNAUTHORIZED": 401,
	"NOT_FOUND": 404,
	"FORBIDDEN": 403,
	//"METHOD_NOT_ALLOWED": 405,
	"SIGNATURE_FAILURE": 406,
	"UNSUPPORTED_MEDIA_TYPE": 415,
	"NO_CONTENT": 204,
	"INVALID_INPUT": 400,
	"ERROR_CODE": 405,
	"TRUE": "true",
	"FALSE": "false",
	"TOKEN_ERROR": "Invalid credential so token is not created",
	"CONNECTION_ERROR": "connection error",
	"INTERNAL_SERVER_ERROR": 500,
	"WORNG_USER_NAME_PASSWORD":401,
	"CONTENT-TYPE": "application/json",
	"RESPONSE": "Response :",
	"REQUEST": "Request :",
	"INVALID_ORG" : "invalid Org",


	//Messages for http methods
	"MESSAGE_400": "Bad Request - The request couldn’t be understood, usually because the JSON body contains an error.",
	"MESSAGE_401": "Invalid Authentication - The Authentication token used has expired or is invalid. The response body contains the message and errorCode.",
	"MESSAGE_403": "Forbidden - The request has been refused. Verify that the logged-in user has appropriate permissions.",
	"MESSAGE_404":	"Not Found - The requested resource couldn’t be found. Check the URI for errors, and verify that there are no sharing issues.",
	"MESSAGE_405":	"Method Not Allowed - The method specified in the Request-Line isn’t allowed for the resource specified in the URI.",
	"MESSAGE_406":	"Signature Failure - The Token/Signature is invalid or The timestamp is stale.",
	"MESSAGE_415":	"Unsupported Media Type - The entity in the request is in a format that’s not supported by the specified method.",
	"MESSAGE_422":	"Unprocessable Entity - The request parameters did not passed validation specification.",
	"MESSAGE_429":	"Too Many Requests - The request is rejected due to rate limiting.",
	"MESSAGE_500":	"Server Error - An error has occurred within Service API, so the request couldn’t be completed.",
	"INVALID_PARAM": "Input params are invalid.",
	"MESSAGE_204": "No Content - Data doesn't exist in the repository",
	"WRONG_SUB_KEY": "User authentication failed as wrong subscription key provided.",
	"INPUT_TOKEN": "Error: Token is invalid.",
	"VALID_TOKEN": "Token is valid.",
	"DATA_NOT_ADDED": "could not add data.",
	"UPDATION_FAILED": "could not updated data.",
	"UPDATION_FAILED_RECORD_NOT_FOUND": "could not updated data. Record not found",
	"TRANSACTION_NOT_ADDED": "Tranaction data not added.",

	//files name
	"LOAN_ASSET_CONTROLLER_FILE": "loanAssetController",
	"LOAN_ASSET_SERVICE_FILE": "loanAssetService",
	"CHAINCODE_SERVICE_FILE": "chaincodeService",
	"AUTH_FILE": "auth",
	"TRANSACTION_CONTROLLER_FILE": "transactionController",
	"TRANSACTION_SERVICE_FILE": "transactionService",
	"USER_CONTROLLER_FILE": "userController",
	"USER_SERVICE_FILE": "userService",
	"NOTIFICATION_CONTROLLER_FILE":"notificationController",
	"NOTIFICATION_SERVICE_FILE":"notificationService",
	//methods name
	"LOAN": "Loan",
	"NOTIFICATION": "Notification",
	"GET_DETAILS_BY_TRANSACTION_ID":"getDetailsByTransactionId",
	"ADD_LOAN_ASSET": "addLoanAssetInfo",
	"UPDATE_POOL_STATUS": "updatePoolStatus",
	"UPDATE_POOL_ID": "updatePoolId",
	"UPDATE_LOAN_STATUS_LCN": "updateLoanStatusBylcn",
	"UPDATE_REVIEW_INFO":"updateReviewInfo",
	"UPDATE_LOAN_BY_CUSTODIAN":"updateLoanByCustodian",
	"UPDATE_LOAN_BY_REVIEWER": "updateLoanByReviewer",
	"UPDATE_LOAN_BY_ORIGINATOR": "updateLoanByOriginator",
	"UPDATE_LOAN_BY_INVESTOR": "updateLoanByInvestor",
	"GET_CASE_BY_CASE_ID": "getCaseById",
	"GET_LOAN_BY_POOL_ID":"getLoanAssetInfoByPoolId",
	"GET_LOAN_BY_LCN":"getLoanAssetInfoByLCN",
	"GET_LOAN_INFO_BY_REVIEW_STATUS":"GetLoanInfoByReviewStatus",
	"GET_LOAN_BY_DATE_RANGE":"GetLoanByDateRange",
	"FIND_INDIVIDUAL_LOAN_SUMMARY":"FindIndividualLoanSummary",
	"FIND_ALL_CASE": "findAllCases",
	"FIND_ALL_LOAN" : "findAllLoanAssetInfo",
	"FIND_ALL_POOL_LOAN" : "findAllPoolLoanAssetInfo",
	"GET_LOAN_BY_ID" :"getLoanById",
	"ADD_NOTIFICATION": "addNotification",
	"UPDATE_NOTIFICATION": "updateNotification",
	"GET_NOTIFICATIONS": "getNotifications",
	"ENROLL_USER": "enrollUser",
    "INVOKE_CHAINCODE": "invokeChainCode",
    "QUERY_CHAINCODE": "queryChainCode",
    "LIST_CHANNEL_INFO": "listChannelInfo",
	"QUERY_BLOCK_BY_TRANSACTION_ID": "queryBlockByTransactionId",
	
	"VALIDATE_TOKEN": "validateToken",
	"GENERATE_TOKEN": "generateToken",

	"GET_TRANSACTION_BY_EVIDENCE_ID": "getTransactionByEvidenceId",
	"GET_BLOCK_BY_EVIDENCE_ID": "getBlockByEvidenceId",
	"GET_TRANSACTION_BY_LCN": "getTransactionsByLcn",
	"GET_CURRENT_BLOCK": "getCurrentBlock",
	"ADD_TRANSACTION": "addTransaction",

	"AUTHENTICATE_USER": "authenticateUser",
	"VALIDATE_TOKEN_INTERNALLY": "validateTokenInternally",
	"VALIDATE_TOKEN":"validateToken",
	"FIND_BY_USER_ID":"findByUserId",
	"FIND_BY_PERSONA":"findByPersona",

	"REQUEST_POST": "POST",
	"REQUEST_GET": "GET",
	"ORG_NAME": "Originator",

	//Transactions Events
	"ADD_LOAN_ASSET":"AddLoanAsset",
	"UPDATE_POOL_STATUS":"UpdatePoolStatus", 
	"UPDATE_POOL_ID":"UpdatePoolID",
	"UPDATE_REVIEW_INFO":"UpdateReviewInfo",
	"UPDATE_LOAN_STATUS":"UpdateLoanStatus",
	"UPDATE_ORIGINATOR":"UpdateOriginator",
	"UPDATE_INVESTOR":"UpdateInvestor",
	"UPDATE_CUSTODIAN":"UpdateCustodian",
	"UPDATE_REVIEWER":"UpdateReviewer",

	//Attribue names
	"LOAN_CONTROL_NUMBER": "loanControlNumber",
	"LOAN_DOCUMENT_HASH": "loanDocumentHash",
	"MERS_NUMBER": "MERSNumber",
	"ORIGINATOR_LOAN_NUMBER": "originatorLoanNumber",
	"AGENCY_LOAN_NUMBER": "agencyLoanNumber",
	"SERVICER_LOAN_NUMBER": "servicerLoanNumber",

	"INSURER":"insurer",
	"BANK":"bank",
	"SERVICE_PROVIDER": "serviceProvider",
	"AUDITOR": "Auditor",

	//Display Messages
	"LOAN_ADDED_SUCCESSFULLY":"Loan Added Successfully for Loan Control Number: ",
	"UPDATE_POOL_STATUS_MSG":"Pool Status Updated to ",
	"UPDATE_POOL_ID_MSG":"Pool ID Updated to ",
	"UPDATE_LOAN_STATUS_MSG":"Loan Status Updated to ",
	"UPDATE_REVIEW_INFO_MSG":"Review Information Updated to ",
	"UPDATE_CUSTODIAN_MSG":"Custodian changed to ",
	"UPDATE_ORIGINATOR_MSG":"Originator Changed to ", 
	"UPDATE_REVIEWER_MSG":"Reviewer changed to ",
	"UPDATE_INVESTOR_MSG":"Investor changed to ",
	"FOR_LOAN_CNTRL_MSG":" for Loan Control Number: ",
	"SHARED_SECRET": "shh",
	"ISSUER": "irm-evidence.com",

	"INSURANCE_POLICY_CONTROLLER_FILE": "insurancePolicyController",
	"READ_DATA_FROM_LOAN_JSON" : "readDatafromLoanJson",
	"ADD_LOAN_INFO" : "add_Loan_Info",
	"ADD_ART_WORK": "addArtWorkInfo",
	"FINDALLCONDITIONRPT_BY_ARTNO": "findAllConditionReportsByArtWorkNumber",
	"ADD_CONDITION_REPORT": "addConditionReport",
	"GET_IPLETTER_COUNT_BY_BANKNNOTICEDATE": "getIpLetterCountByBankNNoticeDate",
	"GET_AUDITOR_IP_COUNT_BY_NOTICEDATE" : "getAuditorIpCountByNoticeDate",
	"GET_EXPIRED_IP_COUNT_BY_DATE" : "getExpiredIpCountByDate",
	"GET_IP_NOTICE_RECVD_SUMMARY" : "getIPNoticeRecvdSummary",
	"GET_IPNOTICE_BY_BANK_AND_NOTICEDATE" : "getIpNoticeByBankAndNoticeDate",
	"GET_AUDITOR_POLICIES_EXPIRING_COUNT" : "getAuditorPoliciesExpiringCount",
	"GET_AUDITOR_EXPIRING_POLICIES_BY_BANK" : "getAuditorExpiringPoliciesByBank",
	"GET_EXPIRED_IPNOTICE_COUNT_BY_DATE" : "getExpiredIpNoticeCountByDate",
	"GET_EXPIRED_IPNOTICE_BY_BANKANDDATE" : "getExpiredIpNoticeByBankAndDate",
	"PROCESS_IP_LETTERS" : "processIpLetters",
	"GET_IPLETTER_DETAILS_BY_BANKNDATE" : "getIpLetterDetailsByBankNDate",
	"GET_EXPIRING_IPLETTER_COUNT_OFNDAYS_BY_INSURERNDATE" : "getExpiringIpLetterCountOfNdaysByInsurerNDate",
	"GET_EXPIRING_IPLETTER_DETAILS_BY_DATERANGE" : "getExpiringIpLetterDetailsByDateRange",
	"GET_EXPIRED_IP_COUNT_OF_LAST_NDAYS_BY_BANKNDATE" : "getExpiredIpCountOfLastNDaysByBankNDate",
	"GET_EXPIRED_IPLETTER_BY_BANK_N_DATE" : "getExpiredIPLetterByBankNDate",
	"GET_EXPIRED_POLICIES_BY_DATE" : "getExpiredPoliciesByDate",
	"LIST_IP_NOTICES" : "listIPNotices",
	"LIST_BANK_IPLETTERS_BY_BANK_N_LIMIT" : "listBankIPLettersByBankNlimit",
	"SEARCH_IP_NOTICES" : "searchIPNotices",
	"SEARCH_IPNOTICES_BY_INSURER" : "searchIPNoticesByInsurer",
	"SEARCH_IPNOTICES_BY_BANK" : "searchIPNoticesByBank",
	"AUDITOR_SEARCH_IPLETTER_BY_BANK" : "auditorSearchIpLetterByBank",
	"SEARCH_IP_NOTICES_BY_INSURER" : "searchIPNoticesByInsurer",
	"LIST_IPNOTICES_BY_INSURER" : "listIPNoticesByInsurer",
	"UPDATE_UNMATCH_IPNOTICES" : "updateUnmatchIPNotices",
	"GET_UPDATE_ZIP_FILE_PATH" : "getUpdateZipFilePath",
	"UPDATE_READ_ZIP_FILE" : "updateReadZipFile",
	"UPDATE_CHAINCODE_CALL" : "updateChainCodeCall",
	"UPLOAD_IP_NOTICES" : "uploadIPNotices",
	"UPLOAD_IP_LETTERS" : "uploadIpLetters",
	"GET_UPLOAD_ZIP_FILE_PATH" : "getUploadZipFilePath",
	"READ_ZIP_FILE" : "readZipFile",
	"File_Not_Uploaded" : "File uploading error!!!",
	"IRM" : "Irm",
	"LIST_UNMATCHED_NOTICES" : "listUnmatchedNotices",
	"DOWNLOAD_UNMATCHED_NOTICES" : "downloadUnmatchedNotices",
	"DOWNLOAD_IPLETTERS_BY_BANK" : "downloadIpLettersByBank",
	"IP_NOTICES_SUMMARY" : "ipNoticesSummary",
	"GET_ARTWORK_DETAILS": "getArtWorkDetails",
	"GET_ALL_ARTWORK": "getAllArtWork",
	"GET_CONDITIONRPT_BY_CONDTIONNO": "getConditionReportByConditionRptNo",
	"GET_ACCESS_CTRLLIST": "getAccessControlList",
	"UPDATE_ACCESS_CONTROL": "updateAccessControl",
	"FIND_ALL_TRANSACTION_BY_TYPE": "findAllTransactionByType",
	"GET_TRANSACTION_BY_REFNUM": "getTransactionByReferenceNum",
	"IP_NOTICE_RECVD_SUMRY_OPTIONS": "ipNoticesRecvdSummaryOptions",
	"NO_OF_DAYS" : "7",
	"INSURANCE_PROVIDER" : "insuranceProvider",
	"POLICY_EXPIRING_DATE" : "policyExpiringDate",
    "BANK_ID" : "bankId",
	"INSURANCE_POLICY_SERVICE_FILE": "insurancePolicyService",
	"GET_ALL_ART_IMAGE_JSON": "getallArtImageJson",
	"ADD_ART_WORK_ASSET": "addArtworkAsset",
	"GET_UPLOADED_CONDITIONREPORTS": "getuploadedConditionReports",
	"FILE_NOT_FOUND": "File/Directory not found",
	"FIND_ALL_ART_WORK_DETAILS": "findAllArtWorkDetails",
	"FIND_ALL_CONDTION_REPORTS": "findAllConditionReports",
	"GRANT": "Grant",
	"REVOKE": "Revoke",
	"INVALID_USERID_PASSWORD": "Invalid User/Password",
	"BANK_NAME" : "bankName"
	


	

}