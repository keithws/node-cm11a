"use strict";

/**
 * X10 protocol objects
 * @author Keith W. Shaw
 */

/**
 * Module Dependencies
 */
var _ = require('underscore');

var deviceCodes = [0x6, 0xE, 0x2, 0xA, 0x1, 0x9, 0x5, 0xD, 0x7, 0xF, 0x3, 0xB, 0x0, 0x8, 0x4, 0xC];

/**
 * object to convert X-10 address strings to their binary values
 */
function Address(address) {
	// The housecodes and device codes range from A to P and 1 to 16 respectively although they do not follow a binary sequence. The encoding format for these codes is as follows:
	this.houseCode = null;
	this.unitCode = null;
	switch(typeof address) {
		case 'object':
		if (_.isArray(address)) {
			this.houseCode = address[0];
			this.unitCode = address[1];
		} else {
			if (address.houseCode !== undefined && address.houseCode !== null) {
				this.houseCode = address.houseCode;
			}
			if (address.unitCode !== undefined && address.unitCode !== null) {
				this.unitCode = address.unitCode;
			}
		}
		break;
		case 'number':
		this.houseCode = address>>>4;
		this.unitCode = address&0x0F;
		break;
		case 'string':
		try {
			address = JSON.parse(address);
			if (address.hasOwnProperty("houseCode")) {
				this.houseCode = address.houseCode;
			}
			if (address.hasOwnProperty("unitCode")) {
				this.unitCode = address.unitCode;
			}
		} catch (e) {
			this.houseCode = (address.toUpperCase().match(/[A-P]+/)||[null])[0];
			this.unitCode = (address.match(/\d+/)||[null])[0];
		}
		break;
	}
	if (this.houseCode !== null) {
		if (typeof this.houseCode === 'string') {
			if (this.houseCode !== "") {
				this.houseCode = this.houseCode.charCodeAt(0) - 65;
				this.houseCode = deviceCodes[this.houseCode];
			}
		}
	}
	if (this.unitCode !== null) {
		if (typeof this.unitCode === 'string') {
			if (this.unitCode !== "") {
				this.unitCode = parseInt(this.unitCode, 10) - 1;
				this.unitCode = deviceCodes[this.unitCode];
			}
		}
	}
	if (!Number.isFinite(this.houseCode) || this.houseCode < 0x0 || this.houseCode > 0xf) {
		// throw exception because code is out of allowed range
		throw new Error("Out of range");
	}
	if (!Number.isFinite(this.unitCode) || this.unitCode < 0x0 && this.unitCode > 0xf) {
		// throw exception because code is out of allowed range
		throw new Error("Out of range");
	}
}

Address.prototype.toString = function(base) {
	var houseCode, unitCode;
	if (base !== undefined && base !== null) {
		return this.toNumber().toString(base);
	} else {
		houseCode = deviceCodes.indexOf(this.houseCode);
		unitCode = deviceCodes.indexOf(this.unitCode);
		houseCode = String.fromCharCode(houseCode + 65);
		unitCode = unitCode + 1;
		return houseCode + unitCode;
	}
};

Address.prototype.toNumber = function() {
	return this.houseCode << 4 | this.unitCode;
};

Address.prototype.toArray = function() {
	return [ this.houseCode, this.unitCode ];
};

Address.prototype.toObject = function() {
	return { "houseCode": this.houseCode, "unitCode": this.unitCode };
};

Address.prototype.toJSON = function() {
	return JSON.stringify(this.toObject());
};



var functionCodes = [
	{
		"code": 0,
		"func": "allUnitsOff",
		"function": "All units off",
		"description": "Switch off all devices with the house code indicated in the message",
		"bidirectional": false
	},
	{
		"code": 1,
		"func": "allLightsOn",
		"function": "All lights on",
		"description": "Switches on all lighting devices (with the ability to control brightness)",
		"bidirectional": false
	},
	{
		"code": 2,
		"func": "on",
		"function": "On",
		"description": "Switches on a device",
		"bidirectional": false
	},
	{
		"code": 3,
		"func": "off",
		"function": "Off",
		"description": "Switches off a device",
		"bidirectional": false
	},
	{
		"code": 4,
		"func": "dim",
		"function": "Dim",
		"description": "Reduces the light intensity",
		"bidirectional": false
	},
	{
		"code": 5,
		"func": "bright",
		"function": "Bright",
		"description": "Increases the light intensity",
		"bidirectional": false
	},
	{
		"code": 6,
		"func": "allLightsOff",
		"function": "All lights off",
		"description": "Switches off all lighting devices",
		"bidirectional": false
	},
	{
		"code": 7,
		"func": "extendedCode",
		"function": "Extended code",
		"description": "Extension code",
		"bidirectional": true
	},
	{
		"code": 8,
		"func": "hailRequest",
		"function": "Hail request",
		"description": "Requests a response from the device(s) with the house code indicated in the message",
		"bidirectional": true
	},
	{
		"code": 9,
		"func": "Hail acknowledge",
		"function": "hailAcknowledge",
		"description": "Response to the previous command",
		"bidirectional": true
	},
	{
		"code": 10,
		"funct": "preSetDim1",
		"function": "Pre-set dim 1",
		"description": "Allows the selection of two predefined levels of light intensity",
		"bidirectional": true
	},
	{
		"code": 11,
		"func": "preSetDim2",
		"function": "Pre-set dim 2",
		"description": "Allows the selection of two predefined levels of light intensity",
		"bidirectional": true
	},
	{
		"code": 12,
		"func": "extendedDataTransfer",
		"function": "Extended Data Transfer",
		"description": "For meter read & DSM",
		"bidirectional": true
	},
	{
		"code": 13,
		"func": "statusIsOn",
		"function": "Status is on",
		"description": "Response to the Status Request indicating that the device is switched on",
		"bidirectional": true
	},
	{
		"code": 14,
		"func": "statusIsOff",
		"function": "Status is off",
		"description": "Response indicating that the device is switched off",
		"bidirectional": true
	},
	{
		"code": 15,
		"func": "statusRequest",
		"function": "Status request",
		"description": "Request requiring the status of a device",
		"bidirectional": true
	}
];

var funcCodes = _.pluck(functionCodes, "func");

function Command(command) {
	this.functionCode = null;

	switch (typeof command) {
		case 'object':
			if (command instanceof Array) {
				this.functionCode = command[0];
			} else {
				if (command.functionCode !== undefined && command.functionCode !== null) {
					this.functionCode = command.functionCode;
				}
			}
		break;
		case 'number':
		this.functionCode = command;
		break;
		case 'string':
		try {
			command = JSON.parse(command);
			if (command.hasOwnProperty("functionCode")) {
				this.functionCode = command.functionCode;
			}
		} catch (e) {
			this.functionCode = funcCodes.indexOf(command);
		}
		break;
	}

	if (this.functionCode !== null) {
		if (typeof this.functionCode === 'string') {
			if (this.functionCode !== "") {
				this.functionCode = funcCodes.indexOf(this.functionCode);
			}
		}
	}
}

Command.prototype.toObject = function () {
	return { "functionCode": this.functionCode };
};

module.exports = {
	Address: Address,
	Command: Command
};
