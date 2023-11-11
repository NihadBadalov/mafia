let _data = {
  servers: [],
  users: [],
  userAsts: [],
  serverPassphrase: _generateUserToken(64)
};
function _generateUserToken(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
export {
  _data as _,
  _generateUserToken as a
};
