'use strict';

/**
@author: Munesh Rawat
@version: 1.0
@date: 11/09/2018
@description: utility file containing commonly used and customized validation methods
**/


/**
Returns true if input is a string and is non empty
**/
exports.isValidString = function(str){
	return typeof str === 'string' && str.trim().length > 0;
}

/**
Returns true if input is a boolean
**/
exports.isValidBoolean = function(val){
	return typeof val === 'boolean';
}

/**
Returns true if input is a non empty array
**/
exports.isValidArray = function(array){
	return Object.prototype.toString.call( array ) === '[object Array]' && array.length > 0
}

/**
Returns true if input is a non empty json object
**/
exports.isValidJson = function(json){
	if(!json || typeof json == 'undefined'){ 
		return false;
	}
	if((Object.prototype.constructor === json.constructor) || (Object.prototype.toString.call( json ) === '[object Array]')){
	    try{
			var keys = Object.keys(json);
			if(keys && keys.length == 0){
				return false;
			}
		}
		catch(err){
			return false;
		}
	}
	else{
		return false;
	}
	return true;
}

exports.isParamMissing = function(body, params){
	var isMissing = false;
	var missingParams="";
	if(body){
		for(var i=0;i<params.length;i++){
			if(!body[params[i]]){
				isMissing=true;
				missingParams +=params[i] +" ";
			}
		}
		if(isMissing){
			return {"missing":isMissing, message:"Following request body paranmeters missing: "+ missingParams};
		}
	}
	else
	{
		return {"missing":true, message:"Request body is not defined"};
	}
	return {"missing":isMissing};
}

exports.isValid = function(val){
	return (val != null && typeof val != 'undefined');
}

