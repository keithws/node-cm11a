"use strict";

/**
 * X10 protocol objects
 * @author Keith W. Shaw
 */

/**
 * Module Dependencies
 */
var _ = require("underscore");

// The housecodes and device codes range from A to P and 1 to 16 respectively although they do not follow a binary sequence. The encoding format for these codes is as follows:
var deviceCodes = [0x6, 0xE, 0x2, 0xA, 0x1, 0x9, 0x5, 0xD, 0x7, 0xF, 0x3, 0xB, 0x0, 0x8, 0x4, 0xC];


/**
 * object to convert X-10 house codes from numbers to strings and back
 */
function HouseCode(houseCode) {
	this.raw = null;

	switch (typeof houseCode) {
	case "string":
		if (houseCode !== "" && houseCode.length === 1) {
			var index = houseCode.charCodeAt(0) - 65;
			if ((index >= 0) && (index <= (deviceCodes.length - 1))) {
				this.raw = deviceCodes[index];
			} else {
				throw new Error("House code string out of range.");
			}
		} else {
			throw new Error("Invalid house code.");
		}
		break;
	default:
		if (deviceCodes.indexOf(houseCode) !== -1) {
			this.raw = houseCode;
		} else {
			throw new Error("House code number out of range.");
		}
		break;
	}
	return this.raw;
}

HouseCode.prototype.toString = function(base) {
	if (base !== undefined && base !== null) {
		return this.raw.toString(base);
	} else {
		return String.fromCharCode(deviceCodes.indexOf(this.raw) + 65);
	}
};

HouseCode.prototype.valueOf = function() {
	return this.raw;
};


/**
 * object to convert X-10 unit codes from numbers to strings and back
 */
function UnitCode(unitCode) {
	switch (typeof unitCode) {
	case "string":
		unitCode = parseInt(unitCode, 10);
		if (unitCode || unitCode === 0) {
			var index = unitCode - 1;
			if ((index >= 0) && (index <= (deviceCodes.length - 1))) {
				this.raw = deviceCodes[index];
			} else {
				throw new Error("Unit code string out of range.");
			}
		} else {
			throw new Error("Invalid unit code.");
		}
		break;
	default:
		if (deviceCodes.indexOf(unitCode) !== -1) {
			this.raw = unitCode;
		} else {
			throw new Error("Unit code number out of range.");
		}
		break;
	}
	return this.raw;
}

UnitCode.prototype.toString = function(base) {
	if (base !== undefined && base !== null) {
		return this.raw.toString(base);
	} else {
		// always return two characters by padding with zero
		return ("0" + (deviceCodes.indexOf(this.raw) + 1)).substr(-2, 2);
	}
};

UnitCode.prototype.valueOf = function() {
	return this.raw;
};


/**
 * object to convert X-10 addresses from numbers to strings and back
 */
function Address(address) {
	this.houseCode = null;
	this.unitCode = null;

	try {
		switch (typeof address) {
		case "object":
			if (_.isArray(address) && address.length === 2) {
				this.houseCode = new HouseCode(address[0]);
				this.unitCode = new UnitCode(address[1]);
			} else {
				if (address.houseCode !== undefined && address.houseCode !== null) {
					this.houseCode = new HouseCode(address.houseCode);
				}
				if (address.unitCode !== undefined && address.unitCode !== null) {
					this.unitCode = new UnitCode(address.unitCode);
				}
			}
			break;
		case "string":
			try {
				address = JSON.parse(address);
				if (address.hasOwnProperty("houseCode") && address.houseCode !== null) {
					this.houseCode = new HouseCode(address.houseCode);
				}
				if (address.hasOwnProperty("unitCode") && address.unitCode !== null) {
					this.unitCode = new UnitCode(address.unitCode);
				}
			} catch (e) {
				this.houseCode = new HouseCode((address.toUpperCase().match(/[A-P]+/)||[null])[0]);
				this.unitCode = new UnitCode((address.match(/\d+/)||[null])[0]);
			}
			break;
		case "number":
			this.houseCode = new HouseCode(address>>>4);
			this.unitCode = new UnitCode(address&0x0F);
			break;
		default:
			throw new Error("Invalid address.");
			break;
		}
	} catch (e) {
		throw new Error('Address out of range.');
	}
}

Address.prototype.toString = function(base) {
	if (base !== undefined && base !== null) {
		return this.toNumber().toString(base);
	} else {
		return this.houseCode.toString() + this.unitCode.toString().replace(/^0/, "");
	}
};

Address.prototype.toNumber = function() {
	return this.houseCode << 4 | this.unitCode;
};

Address.prototype.toArray = function() {
	return [ this.houseCode.valueOf(), this.unitCode.valueOf() ];
};

Address.prototype.toObject = function() {
	return { "houseCode": this.houseCode.valueOf(), "unitCode": this.unitCode.valueOf() };
};

Address.prototype.toJSON = function(base) {
	return JSON.stringify(
		{ "houseCode": this.houseCode.toString(base), "unitCode": this.unitCode.toString(base) }
	);
};

Address.prototype.valueOf = function () {
	return this.toNumber();
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
		case "object":
			if (command instanceof Array) {
				this.functionCode = command[0];
			} else {
				if (command.functionCode !== undefined && command.functionCode !== null) {
					this.functionCode = command.functionCode;
				}
			}
		break;
		case "number":
		this.functionCode = command;
		break;
		case "string":
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
		if (typeof this.functionCode === "string") {
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
	HouseCode: HouseCode,
	UnitCode: UnitCode,
	Address: Address,
	Command: Command
};
