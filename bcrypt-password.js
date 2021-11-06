const bcrypt = require('bcrypt');
const rounds = 10;


bcrypt.hash(process.argv[process.argv.length - 1], rounds, (err, encrypted) => {
  console.log(encrypted);
});
