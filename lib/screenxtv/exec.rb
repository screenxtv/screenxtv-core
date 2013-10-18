require 'pty'
require 'io/console'

module ScreenXTV
  module CommandLine
    def self.execute_command channel, command
      PTY::getpty *command do |rr, ww|
        winch = ->(width, height){
          ww.winsize = rr.winsize = [height, width]
          channel.winch_call width, height
        }

        winch.call *STDOUT.winsize.reverse

        channel.start_event_thread do |type, *args|
          case type
          when :winch
            winch.call *args
          when :data
            ww.write args.first
          end
        end

        begin
          prevdata = ''
          while(data = rr.readpartial 1024)
            odata, prevdata = utf8_split prevdata + data
            channel.data_call odata
          end
        rescue
        end
      end
    end

    def self.utf8_split data
      ncount = blen = code = 0
      [5,data.length].min.times do
        code = data[data.length - ncount - 1].ord
        break if code & 0x80 == 0 || code & 0x40 != 0
        ncount += 1
      end
      if code & 0x80 == 0
        return [data[0, data.size - ncount], data[data.size - ncount, ncount]]
      end
      while code & 0x40 != 0
        code <<= 1
        blen += 1
      end
      ncount += 1
      ncount = 0 if blen < ncount
      [data[0, data.size - ncount], data[data.size - ncount, ncount]]
    end

    def self.required_fields options, *requireds
      err = requireds.select{|key|options[key].nil?}
      throw "required: #{err}" unless err.empty?
    end
  end
end
