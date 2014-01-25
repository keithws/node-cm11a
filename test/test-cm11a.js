var should = require("should"),
	_ = require("underscore"),
	SerialPort = require("./MockSerialPort").SerialPort,
	x10 = require("../x10"),
	X10Address = x10.Address,
	X10Command = x10.Command,
	cm11a = require("../cm11a"),
	Controller = cm11a.Controller;

describe("Controller", function () {
	var serialPort, controller;

	serialPort = new SerialPort("/path/to/fake/usb");
	controller = new Controller(serialPort, function (err) {
        "test error".should.equal(err); 
	});
	serialPort.emit("error", "test error");
	serialPort = new SerialPort("/path/to/fake/usb");
	controller = new Controller(serialPort, function (err) {
		(typeof err).should.equal("undefined"); 
	});

	it("receives the status on init", function (done) {
		serialPort = new SerialPort("/path/to/fake/usb");
		controller = new Controller(serialPort, function () {
			controller.firmwareRevision.should.equal(1);
			controller.monitored.houseCode.should.equal(new X10Address("K1").houseCode);
			controller.isReady.should.equal(true);
			done();
		});
		// "send" a 14 byte status response back from cm11a
		serialPort.emit("data", [0xff, 0xff, 0x2c, 0x48, 0x0b, 0x71, 0x08, 0x31, 0x00, 0x04, 0x24, 0x44, 0x00, 0x00]);
		_.delay(function () {
			serialPort.emit("data", [0xeb]);
			_.delay(function () {
				serialPort.emit("data", [0x55]);
			}, 0);
		}, 0);
	});

	serialPort = new SerialPort("/path/to/fake/usb");
	controller = new Controller(serialPort, function () {
		controller.firmwareRevision.should.equal(1);
		controller.monitored.houseCode.should.equal(new X10Address("K1").houseCode);
		controller.isReady.should.equal(true);
	});
	// "send" a 14 byte status response back from cm11a
	serialPort.emit("data", [0xff, 0xff, 0x2c, 0x48, 0x0b, 0x71, 0x08, 0x31, 0x00, 0x04, 0x24, 0x44, 0x00, 0x00]);
	_.delay(function () {
		serialPort.emit("data", [0xeb]);
		_.delay(function () {
			serialPort.emit("data", [0x55]);
		}, 0);
	}, 0);

	describe("#queryStatus()", function () {
		it("should update the status of the controller", function (done) {
			controller.queryStatus(function (data) {
				data.length.should.equal(14);
				controller.firmwareRevision.should.equal(1);
				controller.monitored.houseCode.should.equal(new X10Address("K1").houseCode);
				controller.isReady.should.equal(true);
				done();
			});
			// "send" a 14 byte status response back from cm11a
			serialPort.emit("data", [0xff, 0xff, 0x2c, 0x48, 0x0b, 0x71, 0x08, 0x31, 0x00, 0x04, 0x24, 0x44, 0x00, 0x00]);
			_.delay(function () {
				serialPort.emit("data", [0xeb]);
				_.delay(function () {
					serialPort.emit("data", [0x55]);
				}, 0);
			}, 0);
		});
	});
	describe("#verify()", function () {
		it("should verify a checksum", function (done) {
			controller.once("checksumcorrect", function (checksum) {
				checksum.should.equal(0xeb);
				controller.removeAllListeners("checksumincorrect");
			});
			controller.once("checksumincorrect", function () {
				throw new Error("Incorrect checksum.  " +  arguments[0] + " !== " +  arguments[1][0]);
			});
			serialPort.once("data", function (data) {
				controller.verify(data, [0xeb], function () {
					done();
				});
			});
			serialPort.emit("data", [0xeb]);
			_.delay(function () {
				serialPort.emit("data", [0x55]);
			}, 0);
		});
	});
	describe("#transmit()", function () {
		it("should transmit data and recieve a checksum", function (done) {
			controller.once("checksumcorrect", function (checksum) {
				checksum.should.equal(0x02);
			});
			controller.isReady = true;
			controller.transmit(0x02, function () {
				done();
			});
			serialPort.emit("data", [0x02]);
			_.delay(function () {
				serialPort.emit("data", [0x55]);
			}, 0);
		});
		it("should transmit data, recieve a bad checksum and re-transmit", function (done) {
			controller.once("checksumincorrect", function (checksum, dataReceived) {
				checksum.should.equal(0x03);
				dataReceived.should.not.include(0x03);
			});
			controller.once("retransmit", function () {
				controller.retry.count.should.equal(1);
				controller.transmitBuffer.length.should.equal(1);
			});
			controller.once("checksumcorrect", function (checksum, dataReceived) {
				checksum.should.equal(0x03);
				dataReceived.should.include(0x03);
			});
			controller.isReady = true;
			controller.transmit(0x03, function () {
				controller.isReady.should.equal(true);
				controller.transmitBuffer.should.be.empty;
				done();
			});
			// emit the wrong checksum
			serialPort.emit("data", [0x04]);
			_.delay(function () {
				// emit the right checksum
				serialPort.emit("data", [0x03]);
				_.delay(function () {
					serialPort.emit("data", [0x55]);
				}, 0);
			}, 0);
		});
		it("should transmit data, recieve 3 bad checksums and give up", function (done) {
			controller.once("checksumincorrect", function (checksum, dataReceived) {
				checksum.should.equal(0xeb);
				dataReceived.should.not.include(0xeb);
			});
			controller.once("checksumcorrect", function (checksum, dataReceived) {
				console.log(checksum + "===" + dataReceived);
				(function () {
					throw new Error("Should never be called.")
				}).should.not.throwError("Should never be called.");
			});
			controller.isReady = true;
			controller.retry.max = 3;
			controller.on("transmissionfailed", function () {
				controller.retry.count.should.equal(3);
				controller.removeAllListeners("checksumcorrect");
				done();
			});
			controller.transmit(0xeb, function () {
				(function () {
					throw new Error("Should never be called.")
				}).should.not.throwError("Should never be called.");
			});
			_.delay(function () {
				// emit the wrong checksum
				serialPort.emit("data", [0xe0]);
				_.delay(function () {
					// emit the wrong checksum
					serialPort.emit("data", [0xe0]);
					_.delay(function () {
						// emit the wrong checksum
						serialPort.emit("data", [0xe0]);
						_.delay(function () {
							// emit the wrong checksum
								serialPort.emit("data", [0xe0]);
						}, 0);
					}, 0);
				}, 0);
			}, 0);
		});
	});
	describe("#disableRing()", function () {
		it("should transmit the disable ring command", function (done) {
			controller.once("checksumcorrect", function (checksum) {
				checksum.should.equal(0xdb);
			});
			controller.isReady = true;
			controller.disableRing(function () {
				controller.isReady.should.equal(true);
				controller.ringIndicator.should.equal(false);
				done();
			});
			serialPort.emit("data", [0xdb]);
			_.delay(function () {
				serialPort.emit("data", [0x55]);
			}, 0);
		});
	});
	describe("#enableRing()", function () {
		it("should transmit the enable ring command", function (done) {
			controller.once("checksumcorrect", function (checksum) {
				checksum.should.equal(0xeb);
			});
			controller.isReady = true;
			controller.enableRing(function () {
				controller.isReady.should.equal(true);
				controller.ringIndicator.should.equal(true);
				done();
			});
			serialPort.emit("data", [0xeb]);
			_.delay(function () {
				serialPort.emit("data", [0x55]);
			}, 0);
		});
	});
	describe("#Poll from interface", function () {
		it("should emit events", function (done) {
			serialPort.emit("data", [0x5a]);
			_.delay(function () {
				serialPort.emit("data", [0x06, 0x04, 0xe9, 0xe5, 0xe5, 0x58]);
			}, 0);
			
			done();
		});
	});
});

