var should = require("should"),
	x10 = require("../x10"),
	X10Address = x10.Address,
	X10Command = x10.Command;

describe("X10Address", function () {
	var address;

	it("should create an address from an array", function () {
		address = new X10Address([0x6, 0x6]);
		address.toArray().should.eql([0x6, 0x6]);
		address.toNumber().should.equal(0x66);
		address.toString().should.equal("A1");
	});

	it("should create an address from a number", function () {
		address = new X10Address(0x66);
		address.toArray().should.eql([0x6, 0x6]);
		address.toNumber().should.equal(0x66);
		address.toString().should.equal("A1");
	});

	it("should create an address from a string", function () {
		address = new X10Address("A1");
		address.toArray().should.eql([0x6, 0x6]);
		address.toNumber().should.equal(0x66);
		address.toString().should.equal("A1");
	});

	it("should create an address from a JSON string", function () {
		address = new X10Address('{"houseCode":6,"unitCode":6}');
		address.toString().should.equal("A1");
		address.toJSON().should.equal('{"houseCode":6,"unitCode":6}');
	});

	it("should create an address from an object", function () {
		address = new X10Address({"houseCode":6,"unitCode":6});
		address.toString().should.equal("A1");
		address.toObject().should.eql({"houseCode":6,"unitCode":6});
		address = new X10Address({"houseCode": "A","unitCode": "1"});
		address.toString().should.equal("A1");
		address.toObject().should.eql({"houseCode":6,"unitCode":6});
	});

	it("should create an address at the end of range", function () {
		address = new X10Address("P16");
		address.toArray().should.eql([0xC, 0xC]);
		address.toNumber().should.equal(0xCC);
		address.toString().should.equal("P16");
	});

	it("should have a proprty for the house code and unit code", function () {
		address = new X10Address("A1");
		address.houseCode.should.equal(0x6);
		address.should.have.property("unitCode", 0x6);
	});

	it("should throw an error when out of range", function () {
		// House codes and device codes must be in the range from A to P and 1 to 16 respectively
		(function () { new X10Address("A1"); }).should.not.throwError(/^Out of range.*/);
		(function () { new X10Address("P16"); }).should.not.throwError(/^Out of range.*/);
		(function () { new X10Address("Z1"); }).should.throwError(/^Out of range.*/);
		(function () { new X10Address("Q1"); }).should.throwError(/^Out of range.*/);
		(function () { new X10Address("A0"); }).should.throwError(/^Out of range.*/);
		(function () { new X10Address("A17"); }).should.throwError(/^Out of range.*/);
	});

});


describe("X10Command", function () {
	var command;

	it("should create an command from a string", function () {
		command = new X10Command("allLightsOff");
		command.toObject().should.eql({"functionCode":6});
	});

	it("should create an command from a JSON string", function () {
		command = new X10Command('{"functionCode":6}');
		command.toObject().should.eql({"functionCode":6});
	});

	it("should create an command from an object", function () {
		command = new X10Command({"functionCode":6});
		command.toObject().should.eql({"functionCode":6});
		command = new X10Command({"functionCode":"allLightsOff"});
		command.toObject().should.eql({"functionCode":6});
	});

	it("should create an command from an array", function () {
		command = new X10Command([6]);
		command.toObject().should.eql({"functionCode":6});
		command = new X10Command(["allLightsOff"]);
		command.toObject().should.eql({"functionCode":6});
	});

	it("should create an command from a number", function () {
		command = new X10Command(6);
		command.toObject().should.eql({"functionCode":6});
	});

});

