var spawn = require('child_process').spawn;
var proc = spawn('new.js');

try {
  proc.stdout.on('data', function(data) {
    process.stdout.write(data);
  });
  proc.stderr.on('data', function(data) {
    process.stderr.write(data);
  });
  proc.on('close', function(code, signal) {
    console.log('test.exe closed');
  });
} catch (err) {
  console.log(err)
}
