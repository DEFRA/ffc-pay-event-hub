const streamOptions = {
  onStart: (stream) => stream.write('{ "data": [\n'),
  onEnd: (stream) => stream.end('\n] }\n'),
}

module.exports = { streamOptions }
