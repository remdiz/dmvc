//TODO: testing module

var express = require('express');
var router = express.Router();

var _ = require('underscore');

var mongoose = require('mongoose');


//Inheritance implementation (c)J.Resig
(function() {
    var initializing = false,
        superPattern =  // Determine if functions can be serialized
            /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;

    // Creates a new Class that inherits from this class
    Object.subClass = function(properties) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var proto = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in properties) {
            // Check if we're overwriting an existing function
            proto[name] = typeof properties[name] == "function" &&
            typeof _super[name] == "function" &&
            superPattern.test(properties[name]) ?
                (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, properties[name]) :
                properties[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init) {
                this._preConstruct.apply(this, arguments);
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        Class.prototype = proto;

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extendable
        Class.subClass = arguments.callee;

        return Class;
    };
})();

/**
 * Simple namespace
 */
var dMVC = {};

/**
 * Controller mapper
 * looking for ctrl class by name (req.body.emitter + 'Controller')
 * @param req {Object} - request
 * @returns {dMVC.Controller}
 */
dMVC.getController = function(req) {
    return new dMVC[req.body.emitter + 'Controller'](req);
};

//TODO: implement adapters in separated module
dMVC.DbAdapter = Object.subClass({

});

dMVC.MongoDBAdapter = dMVC.DbAdapter.subClass({

    connect: function(opt) {

        var dbConnection = mongoose.createConnection(opt.connection);

        try {
            this._table = dbConnection.model(opt.schemaName);
        } catch (err) {
            var schema = mongoose.Schema(opt.schema);
            this._table = dbConnection.model(opt.schemaName, schema);
        }

    },

    find: function(parameters, callback) {
        if(!_.isObject(parameters)) {
            parameters = {_id: parameters};
        }
        this._table.find(parameters,function (err, rows) {
            if (err) {
                callback({error: err});
            } else {
                callback(rows);
            }
        });
    },

    remove: function (id, callback) {
        this._table.remove({_id: id}, callback);
    },

    save: function(model, callback) {
        var row = new this._table(model);
        row.save(callback);
    }

});

//Data Mapper
dMVC.ModelMapper = Object.subClass({

    _preConstruct: function(opt) {
        this._dbAdapter = opt.adapter;
    }

});

dMVC.Validator = Object.subClass({

    _preConstruct: function(opt) {
        if(!this.validateField) {
            //TODO: handle lack of method
        }
    }

});

dMVC.RequiredValidator = dMVC.Validator.subClass({

    validateField: function(value) {

        var strValue = value + '';
        return !!strValue.length;

    }

});

dMVC.StringValidator = dMVC.Validator.subClass({

    //TODO: incorrect Number handle
    validateField: function(value) {

        return _.isString(value);

    }

});


dMVC.Model = Object.subClass({

    /**
     * Initialization method
     * @param opt {Object}
     */
    init: function(opt) {

    },

    validate: function() {

        var result = true;

        _.each(this.validationRules, function(rules, name) {

            _.each(rules, function(rule) {
                var validator = new dMVC[rule + 'Validator']();
                if(!validator.validateField(this[name])) {
                    result = false;
                }
            }, this);

        }, this);

        return result;
    },

    /**
     * Constructor
     * @param opt {Object}
     * @private
     */
    _preConstruct: function(opt) {

    }

});

/**
 * Controller
 */
dMVC.Controller = Object.subClass({

    /**
     * Constructor
     * @param opt {Object}
     * @private
     */
    _preConstruct: function(opt) {

    },

    /**
     * Initialization method
     * @param opt {Object}
     */
    init: function(opt) {

    },

    /**
     * Client request procession
     * @param req {Object} req.body.evtType must match this method name
     * @param res {Object}
     * @param next {Function}
     */
    processRequest: function(req, res, next) {
        var command = this[req.body.evtType](req, res, next);
    }

});

dMVC.router = router.post('/', function(req, res, next) {

    var controller = dMVC.getController(req);
    controller.processRequest(req, res, next);

});

module.exports = dMVC;


