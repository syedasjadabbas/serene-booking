const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signAccessToken = ({ customerId, sid }) =>
  jwt.sign({ sub: customerId, sid, typ: "access" }, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl });

const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, env.jwtAccessSecret);
  if (payload.typ !== "access") throw new Error("wrong token type");
  return payload;
};

module.exports = { signAccessToken, verifyAccessToken };
