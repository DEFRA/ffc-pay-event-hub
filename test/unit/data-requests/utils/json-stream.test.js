const { PassThrough } = require('node:stream')
const {
  parseRow,
  writeJsonRow,
  createReportProcessor,
} = require('../../../../app/data-requests/utils/json-stream')

describe('json-stream utils', () => {
  describe('parseRow', () => {
    test('returns object unchanged if input is not a string', () => {
      const obj = { a: 1 }
      expect(parseRow(obj)).toBe(obj)
    })

    test('parses valid JSON string', () => {
      const json = '{"a":1,"b":2}'
      expect(parseRow(json)).toEqual({ a: 1, b: 2 })
    })

    test('returns original string if invalid JSON', () => {
      const invalid = '{a:1,b:2}'
      expect(parseRow(invalid)).toBe(invalid)
    })
  })

  describe('writeJsonRow', () => {
    let stream
    let output

    beforeEach(() => {
      output = ''
      stream = new PassThrough()
      stream.on('data', (chunk) => {
        output += chunk.toString()
      })
    })

    test('writes first row without comma', () => {
      const isFirstRowFlag = { value: true }
      writeJsonRow(stream, { a: 1 }, isFirstRowFlag)
      expect(output).toBe(JSON.stringify({ a: 1 }))
      expect(isFirstRowFlag.value).toBe(false)
    })

    test('writes subsequent row with comma and newline', () => {
      const isFirstRowFlag = { value: false }
      writeJsonRow(stream, { b: 2 }, isFirstRowFlag)
      expect(output).toBe(',\n' + JSON.stringify({ b: 2 }))
      expect(isFirstRowFlag.value).toBe(false)
    })
  })

  describe('createReportProcessor', () => {
    let output
    const transformRow = jest.fn((row) => ({ ...row, transformed: true }))

    beforeEach(() => {
      output = ''
    })

    const makeStream = () => ({
      write: jest.fn((chunk) => {
        output += chunk
      }),
      end: jest.fn(),
    })

    test('processes invalid JSON string as string', () => {
      const processor = createReportProcessor(transformRow)
      const isFirstRowFlag = { value: true }
      const row = '{b:2}'
      const stream = makeStream()

      processor(row, stream, isFirstRowFlag)

      expect(transformRow).not.toHaveBeenCalled()
      expect(output).toBe(JSON.stringify(row))
      expect(isFirstRowFlag.value).toBe(false)
    })
  })
})
