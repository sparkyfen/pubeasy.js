'use strict';
var request = require('request');
var validator = require('validator');
var parseString = require('xml2js').parseString;

var URL = 'http://soap.pubeasy.com/cgi-bin/SoapServer.pl'

exports.checkLogin = function (options, callback) {
  if(!options instanceof Object) {
    return callback('Options should be a object.');
  }
  if(typeof(callback) !== 'function') {
    throw new Error('Callback should be a function.');
  }
  var pin = options.pin;
  var userId = options.userId;
  var pwd  = options.pwd;
  if(validator.isNull(pin)) {
    return callback('Missing pin in the options.');
  }
  if(validator.isNull(userId)) {
    return callback('Missing userId in the options.');
  }
  if(validator.isNull(pwd)) {
    return callback('Missing pwd in the options.');
  }
  var body = '<soapenv:Envelope xmlns:xsi="" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cen="http://soap.pubeasy.com/CentralPEWS">' +
                       '<soapenv:Header/>' +
                       '<soapenv:Body>' +
                          '<cen:check_login soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                             '<pin xsi:type="xsd:string">'+options.pin+'</pin>' +
                             '<user_id xsi:type="xsd:string">'+options.userId+'</user_id>' +
                             '<pwd xsi:type="xsd:string">'+options.pwd+'</pwd>' +
                          '</cen:check_login>' +
                       '</soapenv:Body>' +
                    '</soapenv:Envelope>';
  request.post({
    url: URL,
    body: body,
    headers: {
      'Content-Type': 'text/xml',
      'Content-Length': body.length
    }
  }, function (err, res, body) {
    if(err) {
      return callback(err);
    }
    if(res.statusCode === 200) {
      parseString(body, function (err, result) {
        if(err) {
          return console.log(err);
        }
        var loginResp = result['soap:Envelope']['soap:Body'][0]['check_loginResponse'][0]['check_loginReturn'][0]['_'];
        loginResp = parseInt(loginResp, 10);
        if(loginResp === 1) {
          return callback(null, 'Success.');
        } else {
          return callback('Response from server was that the login check failed.');
        }
      });
    } else {
      return callback(body);
    }
  });
};

exports.bibliography = function (options, callback) {
  if(!options instanceof Object) {
    return callback('Options should be a object.');
  }
  if(typeof(callback) !== 'function') {
    throw new Error('Callback should be a function.');
  }
  var pin = options.pin;
  var userId = options.userId;
  var pwd  = options.pwd;
  var isbn = options.isbn;
  var region = options.region;
  var hasRegion = false;
  if(validator.isNull(pin)) {
    return callback('Missing pin in the options.');
  }
  if(validator.isNull(userId)) {
    return callback('Missing userId in the options.');
  }
  if(validator.isNull(pwd)) {
    return callback('Missing pwd in the options.');
  }
  if(validator.isNull(isbn)) {
    return callback('Missing ISBN in the options.');
  }
  if(!validator.isNull(region) && validator.isRegion(region)) {
    hasRegion = true;
    options.region = options.region.toUpperCase();
  }
  var body = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cen="http://soap.pubeasy.com/CentralPEWS">' +
                       '<soapenv:Header/>' +
                       '<soapenv:Body>' +
                          '<cen:bibliograph soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
                             '<pin xsi:type="xsd:string">'+options.pin+'</pin>' +
                             '<user_id xsi:type="xsd:string">'+options.userId+'</user_id>' +
                             '<pwd xsi:type="xsd:string">'+options.pwd+'</pwd>' +
                             '<query_string xsi:type="xsd:string">' +
                               '<isbn>'+options.isbn+'</isbn>' +
                               (hasRegion ? ('<region>' + options.region + '</region>') : '') +
                             '</query_string>' +
                          '</cen:bibliograph>' +
                       '</soapenv:Body>' +
                    '</soapenv:Envelope>';
  request.post({
    url: URL,
    body: body,
    headers: {
      'Content-Type': 'text/xml',
      'Content-Length': body.length
    }
  }, function (err, res, body) {
    if(err) {
      return callback(err);
    }
    if(res.statusCode === 200) {
      parseString(body, function (err, result) {
        if(err) {
          return console.log(err);
        }
        var bibResp = result['soap:Envelope']['soap:Body'][0]['bibliographResponse'][0]['bibliographReturn'][0]['_'];
        if(bibResp === '0 RESULTS FOUND') {
          return callback('No results found.');
        }
        if(bibResp === '-1 INCORRECT LOGIN INFORMATION') {
          return callback('The login information provided in the bibliograph request was incorrect or invalid.');
        }
        if(bibResp === '-2 USER DOES NOT HAVE REQUIRED PRIVILEGES') {
          return callback('The user provided does not have the required privileges enabled to execute an online product search.');
        }
        return callback(null, bibResp);
      });
    } else {
      return callback(body);
    }
  });
};

validator.extend('isRegion', function (str) {
  if(str.toLowerCase() === 'ame' || str.toLowerCase() === 'eur') {
    return true;
  }
  return false;
})