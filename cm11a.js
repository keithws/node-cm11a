"use strict";

/**
 * @author Keith W. Shaw
 */

/**
 * Module Dependencies
 */

var SerialPort = require('serialport').SerialPort,
	util = require('util'),
	events = require('events'),
	_ = require('underscore'),
	x10 = require('./x10'),
	X10Address = x10.Address,
	X10Command = x10.Command;


var CHECKSUM_CORRECT = 0x00,
	READY = 0x55,
	EXTENDED_TRANSMISSION = 0x07,
	POLL = 0x5a,
	ACK = 0xc3,
	POWER_FAIL = 0xa5,
	CLOCK_UPDATE = 0x9b,
	EEPROM_DOWNLOAD = 0xfb,
	RI_ENABLE = 0xeb,
	RI_DISABLE = 0xdb,
	EEPROM_ADDRESS = 0x5b,
	CM11A_STATUS = 0x8b;


var SIGNAL_RESPONSE = {};

SIGNAL_RESPONSE[READY] = function (controller) {
	controller.isReady = true;
	controller.emit('ready');
};

SIGNAL_RESPONSE[READY] = function (controller) {
	controller.isReady = true;
	controller.emit('ready');
};

SIGNAL_RESPONSE[POLL] = function (controller) {
	controller.sp.once("data", function (data) {
		var length, functionAddressMask;
		// the response is defined protocol
		// in sections 4.3-5 and an example is given in 4.6
		// minimum three bytes, maximum ten bytes
		if ((data.length >= 3) && (data.length <= 10)) {
			// first byte indicates length
			length = data.shift();
			if (length !== (data.length + 1)) {
				throw new Error("Response length does not match the specified buffer upload length.");
			}
			// second byte is the function/address mask
			functionAddressMask = data.shift();
			// the remaining bytes are either addresses or functions
			_.each(data, function(byt, index) {
				var maskAtIndex = functionAddressMask & Math.pow(2, index);
				// If the bit is set (1), the data byte is defined as a function,
				// and if reset (0), the byte is an address.
				if (maskAtIndex === 0) {
					controller.emit("address", new X10Address(byt));
				} else {
					// data byte is a function
					// TODO
					// if function is dim or bright
					// then shift the next byte and emit it as the brightness level
					// n / 210 * 100%
					controller.emit("command", new X10Command(byt));
				}
			});
		} else {
			throw new Error("Invalid response length, " + data.length);
		}
	});
	controller.emit('poll');
	controller.sp.write([ACK]);
};

SIGNAL_RESPONSE[POWER_FAIL] = function (controller) {
	controller.emit('powerfail');
	controller.sp.write([CLOCK_UPDATE]);
};

/**
 * @class The Controller object represents a CM11A X-10 ActiveHome interface.
 * @augments EventEmitter
 * @param {String} port This is the serial port the cm11a is connected to.
 * @param {function} function A function to be called when the interface is ready to communicate.
 * @property firmware An object indication the name, major and minor version of the firmware currently running.
 * @property receiveBuffer An array holding the current bytes received from the cm11a.
 * @property {SerialPort} sp The serial port object used to communicate with the cm11a.
 */

function Controller(port, callback) {
	events.EventEmitter.call(this);

	callback = callback || function () {};

	var controller = this;

	// as defined in section 9 in docs/protocol.txt
	this.firmwareRevision = 0x0;  // level 0 to 15
	this.monitored = {};
	this.monitored.houseCode = 0x0;
	this.monitored.devices = {};
	this.monitored.devices.lastAddressed = 0;
	this.monitored.devices.currentlyAddressed = 0;
	this.monitored.devices.status = {};
	this.monitored.devices.status.onOff = 0;
	this.monitored.devices.status.dim = 0;

	this.isReady = false;
	this.retry = {};
	this.retry.max = 3;
	this.retry.count = 0;
	this.ringIndicator = true;

	this.transmitBuffer = [];
	this.receiveBuffer = [];

	if (typeof port === 'object') {
		this.sp = port;
	} else { 
		this.sp = new SerialPort(port, {
			baudRate: 4800,
			parity: 'none',
			dataBits: 8,
			stopBits: 1,
			bufferSize: 1
		});
	}
	this.sp.on("error", function (string) {
		console.error(string);
		callback(string);
	});

	this.sp.on("data", function (data) {
		var byt, cmd, i, l;
		// anaylize data and emit events
		for (i = 0, l = data.length; i < l; i += 1) {
			byt = data[i];
			// we dont want to push 0 as the first byte on our buffer
			if (false && controller.receiveBuffer.length === 0 && byt === 0) {
				continue;
			} else {
				controller.receiveBuffer.push(byt);
				
				if (SIGNAL_RESPONSE[byt] !== undefined) {
					SIGNAL_RESPONSE[byt](controller);
					controller.receiveBuffer.length = 0;
				}
			}
		}
	});

	if ( !(this instanceof Controller) ) {
		return new Controller( port, callback );
	}
	
	this.queryStatus(callback);
}
util.inherits(Controller, events.EventEmitter);


/**
 * Asks the cm11a to tell us its current status.
 * @param {function} callback A function to be called when the cm11a has reported its firmware version.
 */

Controller.prototype.queryStatus = function (callback) {
	var controller = this;

	controller.once("querystatus", callback);
	controller.sp.once("data", function (data) {
		// expects a 14 byte response
		if (data.length === 14) {
			
			controller.monitored.houseCode = data[7]>>>4;
			controller.firmwareRevision = data[7]&0x0F;
			controller.isReady = true;
			// finish up by enabling ring
			controller.enableRing(function () {
				controller.emit('querystatus', data);
			});
		} else {
			throw new Error("Invalid response length, " + data.length);
		}
	});
	this.sp.write([CM11A_STATUS]);
};

/**
 * Transmits data to the cm11a and verifies the the result
 * @param {array} dataReceived The address of the I2C device
 * @param {array} dataTransmitted The number of bytes to receive.
 * @param {function} callback A function to call when the checksum is verfied.
 */

Controller.prototype.transmit = function (data, callback) {
	var controller = this;

	if (data !== undefined && data !== null) {
		data = _.isArray(data) ? data : [data];
		this.transmitBuffer.push([data, callback]);
	}
	if (this.transmitBuffer.length > 0) {
		if (this.isReady) {
			this.isReady = false;
			// transmit an item in the buffer
			// peek at the buffer
			// remove item from buffer once the checksum is verified
			data = this.transmitBuffer[0][0];
			callback = this.transmitBuffer[0][1];
			this.sp.once("data", function (dataReceived) {
				controller.verify(dataReceived, data, callback);
			});
			this.sp.write(data);
		} else {
			// wait until ready
			this.once('ready', this.transmit);
		}
	}
};


/**
 * Verifies the cm11a checksum against the data transmitted
 * @param {array} dataReceived The address of the I2C device
 * @param {array} dataTransmitted The number of bytes to receive.
 * @param {function} callback A function to call when the checksum is verfied.
 */
Controller.prototype.verify = function (dataReceived, dataTransmitted, callback) {
	var checksum;
	
	if (dataReceived.length === 1) {
		checksum = _.reduce(dataTransmitted, function (memo, byt) {
			return memo + byt;
		}, 0x00) & 0xff;
		if (dataReceived[0] === checksum) {
			this.emit("checksumcorrect", checksum, dataReceived, dataTransmitted);
			this.retry.count = 0;
			this.transmitBuffer.shift();
			this.once("ready", callback);
			this.sp.write([CHECKSUM_CORRECT]);
		} else {
			this.emit("checksumincorrect", checksum, dataReceived, dataTransmitted);
			if (this.retry.count < this.retry.max) {
				this.retry.count += 1;
				this.isReady = true;
				this.emit("retransmit", checksum, dataReceived, dataTransmitted);
				this.transmit();
			} else {
				this.emit("transmissionfailed", checksum, dataReceived, dataTransmitted, callback);
				this.removeListener("ready", callback);
				this.transmitBuffer.shift();
				this.retry.count = 0;
				this.isReady = true;
			}
		}
	} else {
		throw new Error("Invalid response length.  Received " + dataReceived.length + " byte(s), expected 1 byte.");
	}
};

Controller.prototype.enableRing = function (callback) {
	var controller = this;
	this.once("ringenabled", callback);
	this.transmit(0xeb, function () {
		controller.ringIndicator = true;
		controller.emit("ringenabled");
	});
};

Controller.prototype.disableRing = function(callback) {
	var controller = this;
	this.once("ringdisabled", callback);
	this.transmit(0xdb, function () {
		controller.ringIndicator = false;
		controller.emit("ringdisabled");
	});
};

// The transmission for both ACK and REQ are one byte of function data in the standard hc:function format.	The REQ command appears to use any house code.
Controller.prototype.hailRequest = function (callback) {
	this.once('hailrequest', callback);
	this.sp.write([HAIL_REQUEST]);
};

// The transmission for both ACK and REQ are one byte of function data in the standard hc:function format. The ACK should contain the house code that you have active.	If you have several house codes, you could reply with all of them, one after the other.
Controller.prototype.hailAcknowlege = function (callback) {
	this.once('hailacknowledge', callback);
	this.sp.write([HAIL_ACKNOWLEDGE]);
};

Controller.prototype.address = function (addresses, callback) {
	addresses = _.isArray(addresses) ? addresses : [addresses];
	oneCallback = _.after(addresses.length, callback);
	_.each(addresses, function (address) {
		if (! (address instanceof X10Address)) {
			address = new X10Address(address);
		}
		this.transmit([0x04, address], oneCallback);
		this.monitored.devices.lastAddressed = address;
		this.emit("address", address);
	});
};

Controller.prototype.command = function (command, callback) {
	var functionCode, headerCode, houseCode;
	if (! (command instanceof X10Command)) {
		command = new X10Command(command);
	}
	houseCode = this.monitored.devices.lastAddressed.houseCode;
	functionCode = houseCode<<4|command;
	headerCode = 0x6;  // for a standard function
	this.transmit([headerCode, functionCode], callback);
	this.emit("command", command);
};

module.exports = {
	Controller: Controller,
	X10Address: X10Address
};