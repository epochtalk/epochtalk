var repl = require('repl')
var net = require('net')

net.createServer(function (socket) {
  var r = repl.start({
      prompt: 'socket '+socket.remoteAddress+':'+socket.remotePort+'> '
    , input: socket
    , output: socket
    , terminal: true
    , useGlobal: false
  })
  r.on('exit', function () {
    socket.end()
  })
  r.context.socket = socket
}).listen(1337)
