require './screenxtv'
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

Thread.new do
  loop do
    data = JSON.parse socket.gets
    case data['type']
    when 'data'
      channel.data data['data']
    when 'winch'
      channel.winch data['width'],data['height']
    end
  end
end

ScreenXTV::CommandLine.execute_via_screen channel, command: 'zsh', message: 'broadcasting...'


