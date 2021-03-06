require '../lib/screenxtv/screenxtv'
require 'json'
require 'socket'

socket=TCPSocket.open 'localhost', 8000

channel = ScreenXTV::Channel.new
channel.winch do |width, height|
  begin
    socket.write({type: :winch, width: width, height: height}.to_json+"\n")
  rescue => e
    p e, *e.backtrace
    throw e
  end
end

channel.data do |data|
  begin
    socket.write({type: :data, data: data}.to_json+"\n")
    print data
  rescue => e
    p e, *e.backtrace
    throw e
  end
end

winchanged = false
Signal.trap :SIGWINCH do
  winchanged = true
end
Thread.new do
  loop do
    if winchanged
      winchanged = false
      channel.winch *STDOUT.winsize.reverse
    end
    sleep 0.1
  end
end

Thread.new do
  loop do
    channel.data STDIN.getch
  end
end

Thread.new do
  loop do
    data = JSON.parse socket.gets
    channel.data data['data'] if data['type']=='data'
  end
end

channel.winch *STDOUT.winsize.reverse
command = `which zsh`.empty? ? 'bash' : 'zsh'
if `which screen`.empty?
  print "started!\r\n"
  ScreenXTV::CommandLine.execute_command channel, command
else
  ScreenXTV::CommandLine.execute_via_screen channel, command: command, message: '"remote control sample"'
end
