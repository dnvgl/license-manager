const assert = require("assert");
const { primaryMacAddress } = require("../src/mac-address");

describe("mac-address", function () {
  describe("#primaryMacAddress", function () {
    it("should return correct mac array on laml", function () {
      const interfaces = require("./test-data/laml.json");
      const primaryMac = primaryMacAddress(interfaces);
      assert.deepEqual(
        primaryMac.map((p) => p.mac),
        ["70:1a:b8:2f:01:70", "a0:29:19:68:32:56"]
      );
    });
  });
});
