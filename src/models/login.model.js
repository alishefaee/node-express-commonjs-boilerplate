const mongoose = require("mongoose");
const { UserType } = require("../utils/consts.utils.js");
const { passwordHash } = require("../utils/encrypt.utils.js");

const Schema = mongoose.Schema;

const loginSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: Object.values(UserType) },
  },
  {
    timestamps: {},
  }
);

loginSchema.pre("save", async function (next) {
  let user = this;

  if (!user.isModified("password")) {
    return next();
  }

  user.password = await passwordHash(user.password);

  return next();
});

module.exports = mongoose.model("Login", loginSchema);
