var plan = require('flightplan');

var appName = 'btctalk';
var username = 'btctalk';
var startFile = 'server';

var tmpDir = appName+'-' + new Date().getTime();

// configuration
plan.target('staging', [
  {
    host: 'dearest.slickage.com',
    username: username,
    agent: process.env.SSH_AUTH_SOCK,
    port: 53522
  }
]);

plan.target('production', [
  {
    host: '0.0.0.0',
    username: username,
    agent: process.env.SSH_AUTH_SOCK
  }
]);

// run commands on localhost
plan.local(function(local) {
  // uncomment these if you need to run a build on your machine first
  // local.log('Run build');
  // local.exec('gulp build');

  local.log('Copy files to remote hosts');
  var filesToCopy = local.exec('git ls-files', {silent: true});
  // rsync files to all the destination's hosts
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

// run commands on remote hosts (destinations)
plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);
  remote.log('Install dependencies');
  remote.sudo('npm --prefix ~/' + tmpDir + ' install ~/' + tmpDir, {user: username});
  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
  remote.exec('cp ~/btctalk.env ~/' + appName + '/.env');
  remote.exec('cd ~/' + appName + '; npm run build');
  // remote.sudo('rm -rf /tmp/' + appName + '*');
  // remote.exec('cd ~/' + appName + '; nf export -t systemd -o /tmp/ -a ' + appName);
  // remote.sudo('cp /tmp/' + appName + '*.service /tmp/' + appName + '*.target /usr/lib/systemd/system/');
  // remote.sudo('systemctl enable ' + appName + '.target');
  remote.sudo('systemctl restart ' + appName + '.target');
});
