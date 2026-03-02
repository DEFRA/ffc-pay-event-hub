const { PassThrough } = require('node:stream')
const { streamOptions } = require('../../../../app/data-requests/utils/stream-options')

describe('streamOptions', () => {
  let mockStream

  beforeEach(() => {
    mockStream = new PassThrough()
    jest.spyOn(mockStream, 'write')
    jest.spyOn(mockStream, 'end')
  })

  test('onStart writes opening JSON array', () => {
    streamOptions.onStart(mockStream)
    expect(mockStream.write).toHaveBeenCalledWith('{ "data": [\n')
  })

  test('onEnd writes closing JSON array and ends stream', () => {
    streamOptions.onEnd(mockStream)
    expect(mockStream.end).toHaveBeenCalledWith('\n] }\n')
  })
})
