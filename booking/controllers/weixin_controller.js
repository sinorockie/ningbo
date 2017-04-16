var config = require('../config');

var request = require('request');
var util = require('util');
var crypto = require('crypto');
var xml2js = require('xml2js');

var builder = new xml2js.Builder();
var parser = new xml2js.Parser();

var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

/**
* @synopsis 签名算法 
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*
* @returns
*/

exports.sign = function(req, res) {
  var ret = {
    jsapi_ticket: global.jsapi_ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: req.query.url
  };
  var string = raw(ret);
      jsSHA = require('jssha');
      shaObj = new jsSHA("SHA-1", "TEXT");
    shaObj.update(string);
  ret.signature = shaObj.getHash('HEX');

  ret.appid = config.appid;

  res.json(ret);
};

exports.preSign = function(req, res) {
  var nonce_str = createNonceStr();
  var params = 'appid=' + config.appid + "&" +
    "body=" + req.query.body + "&" + 
    "mch_id=" + config.mch_id + "&" + 
    "nonce_str=" + nonce_str + "&" + 
    "notify_url=" + config.notify_url + "&" + 
    "openid=" + req.session.openid + "&" + 
    "out_trade_no=" + req.query.out_trade_no + "&" + 
    "spbill_create_ip=" + req.ip.match(/\d+\.\d+\.\d+\.\d+/) + "&" + 
    "total_fee=" + req.query.total_fee + "&" + 
    "trade_type=JSAPI&" + 
    "key=" + config.key;
  var md5 = crypto.createHash('md5');
  md5.update(params, "utf8");
  var sign = md5.digest('hex').toUpperCase();
  var xml = "<xml>" + 
    "<appid>" + config.appid + "</appid>" + 
    "<mch_id>" + config.mch_id + "</mch_id>" + 
    "<nonce_str>" + nonce_str + "</nonce_str>" + 
    "<sign>" + sign + "</sign>" + 
    "<body>" + req.query.body + "</body>" + 
    "<out_trade_no>" + req.query.out_trade_no + "</out_trade_no>" + 
    "<total_fee>" + req.query.total_fee + "</total_fee>" + 
    "<spbill_create_ip>" + "127.0.0.1" + "</spbill_create_ip>" + 
    "<notify_url>" + config.notify_url + "</notify_url>" + 
    "<trade_type>JSAPI</trade_type>" + 
    "<openid>" + req.session.openid + "</openid>" +
    "</xml>";
  util.log(xml);
  request({
    url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    body: xml,
    method: 'post',
    headers: {
      'content-type': 'application/xml',
    }
  }, function(error, response, body) {
    util.log(error);
    util.log(response);
    util.log(body);
  //   if(res.statusCode==200) {
  //         res.on('data', function (chunk) {
  //             response += chunk;                  
  //         });
  //         res.on('end', function (chunk) {
  //           parser.parseString(response, function (err, result) {
  //             if (err) {
  //               util.log(err);
  //               res.status(500).json("failed to get prepay_id");
  //             } else if (result.return_code=='SUCCESS' && result.result_code=='SUCCESS') {
  //               var ret = {
  //                 appId: config.appid,
  //                 nonceStr: createNonceStr(),
  //                 timeStamp: createTimestamp(),
  //                 signType: 'MD5',
  //                 package: 'prepay_id='+result.prepay_id
  //               };
  //               var string = raw(ret);
  //                   crypto = require('crypto');
  //                   md5Obj = crypto.createHash('MD5');
  //                 md5Obj.update(string);
  //               ret.preSign = md5Obj.digest('HEX');

  //               res.json(ret);
  //             } else {
  //               util.log(result);
  //               res.status(500).json("failed to get prepay_id");
  //             }
  //           });
  //         });
  //   } else {
  //     res.status(500).json("failed to get prepay_id");
  //   }
  // }).end();
    res.json(body);
  });
};

exports.notify = function(req, res) {
  res.json(JSON.stringify(res));
};