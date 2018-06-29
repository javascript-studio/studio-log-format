# Studio Log Format

🎩 Transform streams to format Studio Log streams

> This module also works in the browser using a [naive `stream` shim][7] for
> small Browserify bundles.

## Usage

```js
const FancyFormat = require('@studio/log-format/fancy');

require('@studio/log')
  .pipe(new FancyFormat())
  .pipe(process.stdout);
```

## Install

```bash
❯ npm i @studio/log-format
```

## API

### Transform Streams

- `@studio/log-format/basic`: Basic formatting with ISO dates and no colors.
- `@studio/log-format/fancy`: Colored output with localized dates. This is the
  default formatter when using the `emojilog` CLI.

Some advanced formatting is applied by naming conventions on top level
properties of the `data` object.

- `ts` or prefix `ts_` formats a timestamp.
- `ms` or prefix `ms_` formats a millisecond value.
- `bytes` or prefix `bytes_` formats a byte value.

These options can be passed to the bundled format transforms:

- `ts: false` hide timestamps
- `topic: false` hide topics
- `ns: false` hide namespaces
- `data: false` hide data
- `stack: style` with these stack styles:
    - `false`: hide the error entirely
    - `message` only show the error message
    - `peek` show the message and the first line of the trace (default)
    - `full` show the message and the full trace

The `stack` option is also used to format the `"cause"`, if present.

### Writable Streams

- `@studio/log-format/console`: Console logger, making use of the `console.log`
  default formatting. This format has no options.

## Custom Format Transforms

You can also write your own format transforms by implementing a [node transform
streams][5] in `writableObjectMode`. Here is an example transform
implementation, similar to the [ndjson transform][6] for Studio Log:

```js
const { Transform } = require('stream');

const ndjson = new Transform({
  writableObjectMode: true,

  transform(entry, enc, callback) {
    const str = JSON.stringify(entry);
    callback(null, `${str}\n`);
  }
});
```

## Related modules

- 👻 [Studio Log][1] logs ndjson to an output stream
- 🏷 [Studio Log Topics][2] defines the topics used by Studio Log
- 🌈 [Studio Emojilog][3] is a CLI to pretty print the Studio Log ndjson with
  emoji
- 📦 [Studio Changes][4] is used to create the changelog for this module.

## License

MIT

<div align="center">Made with ❤️ on 🌍</div>

[1]: https://github.com/javascript-studio/studio-log
[2]: https://github.com/javascript-studio/studio-log-topics
[3]: https://github.com/javascript-studio/studio-emojilog
[4]: https://github.com/javascript-studio/studio-changes
[5]: https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream
[6]: https://github.com/javascript-studio/studio-ndjson
[7]: https://github.com/javascript-studio/studio-browser-stream
