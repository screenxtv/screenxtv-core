require '../lib/screenxtv/screenxtv'
require 'json'

channel = ScreenXTV::Channel.new
channel.winch do |width, height|
  begin
    puts({type: :winch, width: width, height: height}.to_json)
    STDOUT.flush
  rescue => e
    p e, *e.backtrace
    throw e
  end
end

channel.data do |data|
  begin
    puts({type: :data, data: data}.to_json)
    STDOUT.flush
  rescue => e
    p e, *e.backtrace
    throw e
  end
end

Thread.new do
  channel.winch 80, 24
  loop do
    data = JSON.parse gets
    case data['type']
    when 'data'
      channel.data data['data']
    when 'winch'
      channel.winch data['width'],data['height']
    end
  end
end

command = `which zsh`.empty? ? 'bash' : 'zsh'
ScreenXTV::CommandLine.execute_command channel, command
