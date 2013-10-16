require './screenxtv'

channel = ScreenXTV::Channel.new
channel.winch do |width, height|

end

channel.data do |data|
  print data
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
  begin
  loop do
    STDIN.raw do
      channel.data STDIN.getch
    end
  end
  rescue => e
    p e.backtrace
  end
end

ScreenXTV::CommandLine.execute_via_screen channel, command: 'zsh', message: 'broadcasting...'


