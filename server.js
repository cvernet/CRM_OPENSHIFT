#!/bin/env node
 //  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;

/**
 *  Define the sample application.
 */
var SampleApp = function () {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function () {
        if (typeof self.zcache === "undefined") {
            self.zcache = {
                'index.html': ''
            };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function (key) {
        return self.zcache[key];
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function () {
        self.routes = {};

        self.routes['/'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send('Here ! '+req.url);
//            res.send(self.cache_get('index.html'));
        };

        self.routes['/insert/:id'] = function (req, res) {
            res.write('Ajout dans la base '+req.params.id);
//insertion dans la base
          MongoClient.connect("mongodb://admin:nA8tR_dyNKnj@127.2.62.130:27017/alticrm", function (err, db) {
          var collection = db.collection("crm_data");
                collection.insert(
                [
                {
                  "FIELD1":req.params.id,
                }
                ]
                
                , {
                    w: 1
                }, function (err, result) {
                 res.end('Erreur ? ' + err);   
                    }); 
            });                   

        };

        self.routes['/main'] = function (req, res) {
            res.setHeader('Content-Type', 'text/html');        
          fs.createReadStream(__dirname+'/Main.html').pipe(res);
        };


        self.routes['/post'] = function (req, res) {
               res.write('Method ' + req.method + '\n');
          
               req.on('data', function (data) {
                    res.write('Data ' + data + '\n');
               });
               
               req.on('end',function(){
                    res.end('end');
               });


        };

        self.routes['/ws'] = function (req, res) {
//Lit les infos CRM présentes dans la base
            MongoClient.connect("mongodb://admin:nA8tR_dyNKnj@127.2.62.130:27017/alticrm", function (err, db) {
                //res.end('DB : '+ err);
                
                var collection = db.collection("crm_data");
                collection.find().toArray(function(err, item) {
                    res.write(JSON.stringify(item));
                    res.end();
                    
                 });
                   
            });
       };
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function () {
        self.createRoutes();
        self.app = express.createServer();
        self.app.use('/js', express.static(__dirname + '/js'));
        self.app.use('/css', express.static(__dirname + '/css'));
        self.app.use('/', express.static(__dirname));        
        
        
        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
            self.app.post(r, self.routes[r]); // add cver
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function () {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function () {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

}; /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();