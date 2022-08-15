const { number } = require("sharp/lib/is.js");

module.exports = Object.freeze({
  password: {
    type: "string",
    custom: (v, errors) => {
      if (!/[0-9]/.test(v)) errors.push({ type: "atLeastOneDigit" });
      if (!/[a-zA-Z]/.test(v)) errors.push({ type: "atLeastOneLetter" });
      return v;
    },
    min: 8,
    max: 60,
    trim: true,
  },
  sort: { type: "string", optional: true },
  page: { type: "number", min: 1, optional: true, convert: true },
  limit: { type: "number", min: 1, max: 100, optional: true, convert: true },
  id: { type: "string", nullable: true, optional: true },
  requiredId: { type: "string", required: true },
  ids: {
    type: "string",
    custom: (v, errors) => {
      if (v) {
        let arr = JSON.parse(v);
        if (!Array.isArray(arr) || (Array.isArray(arr) && !arr.length))
          errors.push({ type: "sortNotInRange" });
      }
      return v;
    },
    optional: true,
  },
  title: { type: "string" },
  description: { type: "string" },
});
