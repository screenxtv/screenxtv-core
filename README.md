# ScreenXTV-Core
Core part of [ScreenX TV](http://screenx.tv/) and some sample code.

## /sample1
broadcast and remote-controll example.

1. launch server : `cd ./server; node app.js`
2. run `ruby broadcast_sample.rb` or `ruby remote_controll_sample.rb`
3. Open http://localhost:8080/

## /sample2
remote-login example.

1. launch server : `node app.js`
2. open http://localhost:8080/

## Notice
If you want to use these codes in your project, you should consider using a proper protocol(instead of raw tcp-socket), authentication, and encryption.

## Related Works

- [ScreenX TV](http://screenx.tv/)
- [ScreenX TV GCC Client](https://github.com/screenxtv/screenxtv-gcc-client)
- [ScreenX TV Ruby Client](https://github.com/screenxtv/screenxtv-ruby-client)
- [ScreenX TV Sandbox](https://github.com/screenxtv/screenxtv-sandbox)
- [ScreenX TV News](https://github.com/screenxtv/screenxtv-news)
- [ScreenX](https://github.com/screenxtv/screenx) (Java-based stand-alone Software)


## License

(The MIT License)

Copyright (c) 2013 tomoya ishida

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
