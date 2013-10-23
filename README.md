# ScreenX TV Core

![ScreenX TV Core - Broadcasting Scene](https://dl.dropboxusercontent.com/u/2819285/screenxtv-core_ss-broadcast.png)

ScreenX TV Core is a opensource self-hosted server to broadcast your terminal, internally used in [ScreenX TV](http://screenx.tv/).

With attached sample client tool, you can broadcast your terminal to the server you hosted (See [sample1](https://github.com/screenxtv/screenxtv-core#sample1)). Also, you can control your terminal from web browser (See [sample2](https://github.com/screenxtv/screenxtv-core#sample2)).

## Requirements (`command`)

- Nodejs (`node`)
- Node Package Manager (`npm`)
- Ruby (`ruby`)

## /sample1

`/sample1` is a sample to broadcast and remote-control example.

1. Install required packages: `cd ./server/; npm install`
2. Launch server: `npm start`
3. Broadcast/Control your terminal: `ruby broadcast_sample.rb` / `ruby remote_control_sample.rb`
4. Click the URL with your browser: [http://localhost:8080/](http://localhost:8080/)

## /sample2

`/sample2` is a sample to remotely login your terminal; you can issue the shell process log in it from web browser.

1. Install required packages: `cd ./server/; npm install`
2. Launch server: `npm start`
3. Click the URL with your browser: [http://localhost:8080/](http://localhost:8080/)

## Notice

If you want to use these codes in your project, you should consider using a proper protocol (instead of raw tcp-socket), authentication, and encryption for security issues.

## Related Works

- [ScreenX TV](http://screenx.tv/)
- [ScreenX TV GCC Client](https://github.com/screenxtv/screenxtv-gcc-client)
- [ScreenX TV Ruby Client](https://github.com/screenxtv/screenxtv-ruby-client)
- [ScreenX TV Sandbox](https://github.com/screenxtv/screenxtv-sandbox)
- [ScreenX TV News](https://github.com/screenxtv/screenxtv-news)
- [ScreenX](https://github.com/screenxtv/screenx) (Java-based stand-alone Software)


## License

(The MIT License)

Copyright (c) 2013 Tomoya Ishida

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
