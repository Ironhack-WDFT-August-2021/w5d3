const bcrypt = require('bcrypt');

const password = '123456';

// const salt = '$2b$10$yBgaJV0bCd0aP5ZiI/gf1.'
const salt = bcrypt.genSaltSync();
console.log(salt.length);
const hash = bcrypt.hashSync(password, salt);

console.log(hash);