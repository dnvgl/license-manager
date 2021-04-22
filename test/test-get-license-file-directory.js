const assert = require("assert");
const { getLicenseFileDirectory } = require("../src/license-file");

describe("license-file", function() {
  describe("#getLicenseFileDirectory", function() {
    it("should return C:\\flexlm by default", function() {
      const licenseFileDirectory = getLicenseFileDirectory();
      assert.strictEqual(licenseFileDirectory, "C:\\flexlm");
    });

    it("should return the first directory when supplied a key", function() {
      const licenseFileDirectory = getLicenseFileDirectory(
        "27000@localhost;C:\\flexlm2\\dnvs_any.lic;",
        ";"
      );
      assert.strictEqual(licenseFileDirectory, "C:\\flexlm2");
    });

    it("should return the first directory when supplied a key", function() {
      const licenseFileDirectory = getLicenseFileDirectory(
        "27000@localhost;C:\\flexlm3;C:\\flexlm2\\dnvs_any.lic;",
        ";"
      );
      assert.strictEqual(licenseFileDirectory, "C:\\flexlm3");
    });
  });
});
