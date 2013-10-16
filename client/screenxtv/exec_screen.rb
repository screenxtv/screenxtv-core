require 'tempfile'

module ScreenXTV
  module CommandLine
    def self.execute_via_screen channel, options
      required_fields options, :message, :command
      status_rc = Tempfile.open("screenrc_sxtv_status") do |f|
        f.write "term xterm-256color\n"
        f.write "hardstatus alwayslastline #{options[:message]}\n"
        f.write "escape ^Qq\n"
        f.write "autodetach off\n"
        f
      end
      prefix = options[:prefix] || "sxtv"
      suffix = (0x10000000 + rand(0xf0000000)).to_s 16
      cmd_hardstatus = ["screen", "-c", status_rc.path, "-S", "#{prefix}_#{suffix}"]
      execute_command channel, [*cmd_hardstatus, *options[:command]]
    end

    def self.execute_screen channel, options
      required_fields options, :screen_name, :message
      unless File.exists? "#{ENV['HOME']}/.screenrc"
        begin
          #disable C-a if not screen user
          Tempfile.open("screenrc_sxtv_alt") do |f|
            f.write "term xterm-256color\n"
            f.write "escape ^Jj\n"
            ENV['SCREENRC'] = f.path
          end
        rescue
        end
      end
      screen_name = options[:screen_name]
      cmd_attach = ["screen", "-x", screen_name, "-R"]
      execute_command_via_screen channel, message: options[:message], prefix: "sxtv_#{screen_name}", command: cmd_attach
    end
  end
end
