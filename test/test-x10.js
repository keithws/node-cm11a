var should = require("should"),
	assert = require("assert"),
	x10 = require("../x10"),
	X10Address = x10.Address,
	X10Command = x10.Command,
	X10UnitCode = x10.UnitCode,
	X10HouseCode = x10.HouseCode;

describe("X10HouseCode", function () {
	it("should create a house code object that is equal to a number", function () {
		(function () { new X10HouseCode(""); }).should.throwError(/^Invalid house code.*/);
		(function () { new X10HouseCode("AA"); }).should.throwError(/^Invalid house code.*/);
		(function () { new X10HouseCode("1"); }).should.throwError(/^House code string out of range.*/);
		(function () { new X10HouseCode("0"); }).should.throwError(/^House code string out of range.*/);
		(function () { new X10HouseCode("Z"); }).should.throwError(/^House code string out of range.*/);
		(function () { new X10HouseCode("Q"); }).should.throwError(/^House code string out of range.*/);

		// test creating house code objects from hex values
		assert.equal(new X10HouseCode(0x6), 0x6);
		assert.equal(new X10HouseCode(0xE), 0xE);
		assert.equal(new X10HouseCode(0x2), 0x2);
		assert.equal(new X10HouseCode(0xA), 0xA);
		assert.equal(new X10HouseCode(0x1), 0x1);
		assert.equal(new X10HouseCode(0x9), 0x9);
		assert.equal(new X10HouseCode(0x5), 0x5);
		assert.equal(new X10HouseCode(0xD), 0xD);
		assert.equal(new X10HouseCode(0x7), 0x7);
		assert.equal(new X10HouseCode(0xF), 0xF);
		assert.equal(new X10HouseCode(0x3), 0x3);
		assert.equal(new X10HouseCode(0xB), 0xB);
		assert.equal(new X10HouseCode(0x0), 0x0);
		assert.equal(new X10HouseCode(0x8), 0x8);
		assert.equal(new X10HouseCode(0x4), 0x4);
		assert.equal(new X10HouseCode(0xC), 0xC);

		// test creating house code objects from strings
		assert.equal(new X10HouseCode("A"), 0x6);
		assert.equal(new X10HouseCode("B"), 0xE);
		assert.equal(new X10HouseCode("C"), 0x2);
		assert.equal(new X10HouseCode("D"), 0xA);
		assert.equal(new X10HouseCode("E"), 0x1);
		assert.equal(new X10HouseCode("F"), 0x9);
		assert.equal(new X10HouseCode("G"), 0x5);
		assert.equal(new X10HouseCode("H"), 0xD);
		assert.equal(new X10HouseCode("I"), 0x7);
		assert.equal(new X10HouseCode("J"), 0xF);
		assert.equal(new X10HouseCode("K"), 0x3);
		assert.equal(new X10HouseCode("L"), 0xB);
		assert.equal(new X10HouseCode("M"), 0x0);
		assert.equal(new X10HouseCode("N"), 0x8);
		assert.equal(new X10HouseCode("O"), 0x4);
		assert.equal(new X10HouseCode("P"), 0xC);
	});
	it("should create house codes from numbers that are equal to ASCII characters", function () {
		assert.equal(new X10HouseCode(0x6).toString(), "A");
		assert.equal(new X10HouseCode(0xE).toString(), "B");
		assert.equal(new X10HouseCode(0x2).toString(), "C");
		assert.equal(new X10HouseCode(0xA).toString(), "D");
		assert.equal(new X10HouseCode(0x1).toString(), "E");
		assert.equal(new X10HouseCode(0x9).toString(), "F");
		assert.equal(new X10HouseCode(0x5).toString(), "G");
		assert.equal(new X10HouseCode(0xD).toString(), "H");
		assert.equal(new X10HouseCode(0x7).toString(), "I");
		assert.equal(new X10HouseCode(0xF).toString(), "J");
		assert.equal(new X10HouseCode(0x3).toString(), "K");
		assert.equal(new X10HouseCode(0xB).toString(), "L");
		assert.equal(new X10HouseCode(0x0).toString(), "M");
		assert.equal(new X10HouseCode(0x8).toString(), "N");
		assert.equal(new X10HouseCode(0x4).toString(), "O");
		assert.equal(new X10HouseCode(0xC).toString(), "P");
	});
});

describe("X10UnitCode", function () {
	it("should create a unit code object that is equal to a number", function () {
		(function () { new X10UnitCode(""); }).should.throwError(/^Invalid unit code.*/);
		(function () { new X10UnitCode("A"); }).should.throwError(/^Invalid unit code.*/);
		(function () { new X10UnitCode("0"); }).should.throwError(/^Unit code string out of range.*/);
		(function () { new X10UnitCode("17"); }).should.throwError(/^Unit code string out of range.*/);

		// test creating house code objects from hex values
		(new X10UnitCode(0x6)).valueOf().should.equal(0x6);
		(new X10UnitCode(0xE)).valueOf().should.equal(0xE);
		(new X10UnitCode(0x2)).valueOf().should.equal(0x2);
		(new X10UnitCode(0xA)).valueOf().should.equal(0xA);
		(new X10UnitCode(0x1)).valueOf().should.equal(0x1);
		(new X10UnitCode(0x9)).valueOf().should.equal(0x9);
		(new X10UnitCode(0x5)).valueOf().should.equal(0x5);
		(new X10UnitCode(0xD)).valueOf().should.equal(0xD);
		(new X10UnitCode(0x7)).valueOf().should.equal(0x7);
		(new X10UnitCode(0xF)).valueOf().should.equal(0xF);
		(new X10UnitCode(0x3)).valueOf().should.equal(0x3);
		(new X10UnitCode(0xB)).valueOf().should.equal(0xB);
		(new X10UnitCode(0x0)).valueOf().should.equal(0x0);
		(new X10UnitCode(0x8)).valueOf().should.equal(0x8);
		(new X10UnitCode(0x4)).valueOf().should.equal(0x4);
		(new X10UnitCode(0xC)).valueOf().should.equal(0xC);

		// test creating house code objects from strings
		(new X10UnitCode("01")).valueOf().should.equal(0x6);
		(new X10UnitCode("02")).valueOf().should.equal(0xE);
		(new X10UnitCode("03")).valueOf().should.equal(0x2);
		(new X10UnitCode("04")).valueOf().should.equal(0xA);
		(new X10UnitCode("05")).valueOf().should.equal(0x1);
		(new X10UnitCode("06")).valueOf().should.equal(0x9);
		(new X10UnitCode("07")).valueOf().should.equal(0x5);
		(new X10UnitCode("08")).valueOf().should.equal(0xD);
		(new X10UnitCode("09")).valueOf().should.equal(0x7);
		(new X10UnitCode("10")).valueOf().should.equal(0xF);
		(new X10UnitCode("11")).valueOf().should.equal(0x3);
		(new X10UnitCode("12")).valueOf().should.equal(0xB);
		(new X10UnitCode("13")).valueOf().should.equal(0x0);
		(new X10UnitCode("14")).valueOf().should.equal(0x8);
		(new X10UnitCode("15")).valueOf().should.equal(0x4);
		(new X10UnitCode("16")).valueOf().should.equal(0xC);
	});
	it("should create unit codes from numbers that are equal to ASCII characters", function () {
		assert.equal(new X10UnitCode(0x6).toString(), "01");
		assert.equal(new X10UnitCode(0xE).toString(), "02");
		assert.equal(new X10UnitCode(0x2).toString(), "03");
		assert.equal(new X10UnitCode(0xA).toString(), "04");
		assert.equal(new X10UnitCode(0x1).toString(), "05");
		assert.equal(new X10UnitCode(0x9).toString(), "06");
		assert.equal(new X10UnitCode(0x5).toString(), "07");
		assert.equal(new X10UnitCode(0xD).toString(), "08");
		assert.equal(new X10UnitCode(0x7).toString(), "09");
		assert.equal(new X10UnitCode(0xF).toString(), "10");
		assert.equal(new X10UnitCode(0x3).toString(), "11");
		assert.equal(new X10UnitCode(0xB).toString(), "12");
		assert.equal(new X10UnitCode(0x0).toString(), "13");
		assert.equal(new X10UnitCode(0x8).toString(), "14");
		assert.equal(new X10UnitCode(0x4).toString(), "15");
		assert.equal(new X10UnitCode(0xC).toString(), "16");
	});
});

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
		address.toJSON().should.equal('{"houseCode":"A","unitCode":"01"}');
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
		houseCode = new X10HouseCode("A");
		unitCode = new X10UnitCode("1");
		should(address).have.properties({
			"houseCode": houseCode,
			"unitCode": unitCode
		});
	});

	it("should throw an error when out of range", function () {
		// House codes and device codes must be in the range from A to P and 1 to 16 respectively
		(function () { new X10Address("A1"); }).should.not.throwError(/^Address out of range.*/);
		(function () { new X10Address("P16"); }).should.not.throwError(/^Address out of range.*/);
		(function () { new X10Address("Z1"); }).should.throwError(/^Address out of range.*/);
		(function () { new X10Address("Q1"); }).should.throwError(/^Address out of range.*/);
		(function () { new X10Address("A0"); }).should.throwError(/^Address out of range.*/);
		(function () { new X10Address("A17"); }).should.throwError(/^Address out of range.*/);
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

