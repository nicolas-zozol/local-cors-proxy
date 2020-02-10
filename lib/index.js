var express = require('express');
var request = require('request');
var cors = require('cors');
var chalk = require('chalk');
var proxy = express();

var startProxy = function(port, proxyUrl, proxyPartial) {
  proxy.use(cors());
  proxy.options('*', cors());

  proxy.all('/*', function(req, res, next) {
    res.header("X-FUN", "Added manually");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // remove trailing slash
  var cleanProxyUrl = proxyUrl.replace(/\/$/, '');
  // remove all forward slashes
  var cleanProxyPartial = proxyPartial.replace(/\//g, '');

  cleanProxyUrl = 'http://192.168.50.4'
  cleanProxyPartial='';
  const bcgUrl = 'https://www.bcg.com';
  console.log({cleanProxyPartial, cleanProxyUrl})

  proxy.use('/' + cleanProxyPartial, function(req, res) {


    const result={url:req.url}
    res.header("X-FUN", "Added manually");
    if (shouldProxyToBcg(req.url)){
      result.bcg=true;
      result.proxiedUrl = bcgUrl + req.url
      req.pipe(request(bcgUrl + req.url)).pipe(res);
    }else{
      result.false=true;
      try {
      //  console.log(chalk.green('Request Proxied -> ' + req.url));
      } catch (e) {}
      result.proxiedUrl = cleanProxyUrl + req.url
      req.pipe(request(cleanProxyUrl + req.url)).pipe(res);
    }

    console.log({result})


  });

  proxy.listen(port);

  // Welcome Message
  console.log(chalk.bgGreen.black.bold.underline('\n Proxy Active \n'));
  console.log(chalk.blue('Proxy Url: ' + chalk.green(cleanProxyUrl)));
  console.log(chalk.blue('Proxy Partial: ' + chalk.green(cleanProxyPartial)));
  console.log(chalk.blue('PORT: ' + chalk.green(port) + '\n'));
  console.log(
    chalk.cyan(
      'To start using the proxy simply replace the proxied part of your url with: ' +
        chalk.bold('http://localhost:' + port + '/' + cleanProxyPartial + '\n')
    )
  );
};

const wordsToProxyToBcg = ['/Configuration', '/Auth'];

function shouldProxyToBcg(url){
  return wordsToProxyToBcg.some(word => url.startsWith(word));
}

exports.startProxy = startProxy;
