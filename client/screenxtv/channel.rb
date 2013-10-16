module ScreenXTV
  class Channel
    def initialize
      @mutex = Mutex.new
      @cond = ConditionVariable.new
      @queue = []
    end

    def winch *args, &block
      if block_given?
        @winch_callback = block
      else
        push_queue :winch, *args
      end
    end

    def data *args, &block
      if block_given?
        @data_callback = block
      else
        push_queue :data, *args
      end
    end

    def push_queue *cmd
      @mutex.synchronize do
        @queue.push cmd
        @cond.signal
      end
    end

    def winch_call width, height
      @winch_callback.call width, height if @winch_callback
    end

    def data_call data
      @data_callback.call data if @data_callback
    end

    def start_event_thread &callback
      Thread.new do
        begin
        loop do
          @mutex.synchronize do
            yield @queue.shift until @queue.empty?
            @cond.wait(@mutex)
          end
        end
        rescue => e
          p e.backtrace
        end
      end
    end

  end
end