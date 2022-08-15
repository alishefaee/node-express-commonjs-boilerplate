const Validator = require("fastest-validator");
const types = require("./consts.validator");

const v = new Validator({
  useNewCustomCheckerFunction: true, // using new version
  // Register our new error message text
  atLeastOneLetter: "at least one letter",
  atLeastOneDigit: "at least one digit",
});

const editUserSchema = {
  code: { type: "number", length: 6 },
  password: types.password,
  $$async: true,
};

exports.validateEditUser = v.compile(editUserSchema);
