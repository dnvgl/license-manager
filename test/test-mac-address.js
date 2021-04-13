const assert = require("assert");
const { primaryMacAddress } = require("../src/mac-address");

describe("mac-address", function() {
  describe("#primaryMacAddress", function() {
    it("should return 04d4c4f1ce1d on laml-ubuntu", function() {
      const interfaces = require("./test-data/laml-ubuntu.json");
      const primaryMac = primaryMacAddress(interfaces);
      assert.strictEqual(primaryMac, "04d4c4f1ce1d");
    });
  });
});
