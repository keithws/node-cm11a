"use strict";

/**
 * @author Keith W. Shaw
 */

/**
 * Module Dependencies
 */

var SerialPort = require('serialport').SerialPort,
    util = require('util'),
    events = require('events');

var _functionCodes = {
  "All Units Off": 0x0,
  "All Lights On": 0x1,
  "On": 0x2,
  "Off": 0x3,
  "Dim": 0x4,
  "Bright": 0x5,
  "All Lights Off": 0x6,
  "Extended Code": 0x7,
  "Hail Request": 0x8,
  "Hail Acknowledge": 0x9,
  "Pre-set Dim (1)": 0xA,
  "Pre-set Dim (2)": 0xB,
  "Extended Data Transfer": 0xC,
  "Status On": 0xD,
  "Status Off": 0xE,
  "Status Request": 0xF
};

var _signals = {
  "poll": 0x5a,
  "ack": 0xc3
};

var _serialPortOptions = {
  baudrate: 4800,
  parity: 'none',
  databits: 8,
  stopbits: 1
};

/**
 * @class The cm11a object represents an X10 Activehome interface.
 * @augments EventEmitter
 * @param {String} port This is the serial port the cm11a is connected to.
 * @param {function} function A function to be called when the interface is ready to communicate.
 * @property firmware An object indication the name, major and minor version of the firmware currently running.
 * @property currentBuffer An array holding the current bytes received from the cm11a.
 * @property {SerialPort} sp The serial port object used to communicate with the cm11a.
 */

function cm11a(port, callback) {
  events.EventEmitter.call(this);
  
  this.firmware = {};
  this.currentBuffer = [];
  this.versionReceived = false;
  if (typeof port === 'object'){
      this.sp = port;
  } else { 
      this.sp = new SerialPort(port, {
          baudrate: 4800,
          buffersize: 1
      });   
  }
  this.sp.on('error', function(string) {
      callback(string);
  });
  
  this.sp.on('data', function(data) {
    // anaylize data and emit events
    // TODO
    
  });
  
  if ( !(this instanceof cm11a) ) {
    return new cm11a( path, options, openImmediately );
  }
  
  options = options || {};
  options.__proto__ = _options;
  
  var self;
  
  self = this;
  
  self.encode = function (value) {
    var codes, index;

    // The housecodes and device codes range from A to P and 1 to 16 respectively although they do not follow a binary sequence. The encoding format for these codes is as follows:
    codes = [0x6, 0xE, 0x2, 0xA, 0x1, 0x9, 0x5, 0xD, 0x7, 0xF, 0x3, 0xB, 0x0, 0x8, 0x4, 0xC];

    // if value is not a number then ...
    if (Number.isNaN(value)) {
      // if value is a lower case a-p then ...
      if (value.match(/^[a-p]$/)) {
        // convert it to uppercase
        value = value.toUpperCase();
      }
      // if value is an upper case A-P then ...
      if (value.match(/^[A-P]$/)) {
        // convert it to a device code by subtracting 64
        value = value.charCodeAt(0) - 64;
      }
    }

    if (Number.isFinite(value) && value > 0 && value <= 16) {
      // set the index to one less then the value
      value -= 1;
    } else {
      // throw exception because code is out of allowed range
      throw new Exception("House codes and device codes must be in the range from A to P and 1 to 16 respectively.");
    }

    // return integer from hex value in codes
    return codes[value];
  };

  // as defined in section 9 in docs/protocol.txt
  self.status = {
    "battery": 0xffff, // set to 0xffff on reset
    "currentTime": {
      "seconds": 0,
      "minutes": 0,
      "hours": 0
    },
    "currentYearDay": 0, // MSB bit 63
    "dayMask": 0, // SMTWTFS
    "monitoredHouseCode": 0,
    "firmwareRevision": 0, // level 0 to 15
    "monitoredDevices": {
      "currentlyAddressed": 0,
      "status": {
        "onOff": 0,
        "dim": 0
      }
    }
  };

  board.once('statusRequest', function () {
    board.once('hailRequest', function () {
      callback();
    });
  });
}

util.inherits(cm11a, events.EventEmitter);

/**
 * Asks the cm11a to tell us its current status.
 * @param {function} callback A function to be called when the cm11a has reported its firmware version.
 */

cm11a.prototype.statusRequest = function(callback) {
    this.once('statusRequest', callback);
    this.sp.write(0x8b);
};

cm11a.prototype.standardTransmission = cm11a.prototype.transmission = cm11a.prototype.transmit = cm11a.prototype.tx = cm11a.prototype.t = function (callback) {
  console.log("Standard Transmission");
  
};

cm11a.prototype.allUnitsOff = function (options, callback) {
  var functionName, functionCode;

  functionName = "All Units Off";
  functionCode = _functionCodes[functionName];

  console.log(functionName);
};

cm11a.prototype.allLightsOn = function (options, callback) {
  var functionName, functionCode;

  functionName = "All Lights On";
  functionCode = _functionCodes[functionName];

  console.log(functionName);

};

cm11a.prototype.on = function (options, callback) {
  var functionName, functionCode;

  functionName = "On";
  functionCode = _functionCodes[functionName];

  console.log(functionName);

};

cm11a.prototype.off = function (options, callback) {
  var functionName, functionCode;

  functionName = "On";
  functionCode = _functionCodes[functionName];

  console.log(functionName);

};

cm11a.prototype.serialRing = cm11a.prototype.ringIndicator = cm11a.prototype.RI = function (enableRing, callback) {
  console.log("serial ring indicator signal");

  enableRing = enableRing ? enableRing : true;
  
  var transmission;
  
  if (enableRing) {
    transmission = parseInt("0xeb", 16);
    // tx 0xeb Enable the ring signal
  } else {
    transmission = parseInt("0xdb", 16);
    // tx 0xdb Disable the ring signal
  }
  // rx checksum (same as transmission)
  // tx 0x00 Checksum correct 
  // rx 0x55 Interface ready
};

cm11a.prototype.disableSR = cm11a.prototype.disableRI = function (callback) {
  this.serialRing(false, callback);
};

cm11a.prototype.enableSR = cm11a.prototype.enableRI = function (callback) {
  this.serialRing(true, callback);
};

// request the current status from the interface
cm11a.prototype.status = cm11a.prototype.statusRequest = function (callback) {
  var _signal = parseInt("0x8b", 16);
  
  // see section 9 of docs/protocol.txt
};

// The transmission for both ACK and REQ are one byte of function data in the standard hc:function format.  The REQ command appears to use any house code.
cm11a.prototype.hail = cm11a.prototype.hailReq = cm11a.prototype.hailRequest = function (callback) {
  
};

// The transmission for both ACK and REQ are one byte of function data in the standard hc:function format. The ACK should contain the house code that you have active.  If you have several house codes, you could reply with all of them, one after the other.
cm11a.prototype.hailAck = cm11a.prototype.hailAcknowlege = function (callback) {
  
};

