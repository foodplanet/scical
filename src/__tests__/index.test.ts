import { PrecisionNumber } from '../index'

test('constructor', () => {
  expect(new PrecisionNumber(23, 0).significand).toEqual(23)
  expect(new PrecisionNumber(23, 0).exponent).toEqual(0)
  expect(new PrecisionNumber(23, 0).precision).toEqual(2)
  expect(new PrecisionNumber(-8, 1).significand).toEqual(-8)
  expect(new PrecisionNumber(-8, 1).exponent).toEqual(1)
  expect(new PrecisionNumber(-8, 1).precision).toEqual(1)
  expect(new PrecisionNumber(523, -24, 2).significand).toEqual(523)
  expect(new PrecisionNumber(523, -24, 2).exponent).toEqual(-24)
  expect(new PrecisionNumber(523, -24, 2).precision).toEqual(2)
  expect(() => new PrecisionNumber(67, 0, 3)).toThrow(RangeError)
  expect(() => new PrecisionNumber(-9, 0, 0)).toThrow(RangeError)
  expect(() => new PrecisionNumber(0, 0, -1)).toThrow(RangeError)
})

test('toString', () => {
  expect(new PrecisionNumber(23, 0).toString()).toEqual('23E0')
  expect(new PrecisionNumber(826, 1).toString()).toEqual('826E1')
  expect(new PrecisionNumber(42, 0, 1).toString()).toEqual('4E0')
  expect(new PrecisionNumber(178, 2, 1).toString()).toEqual('2E2')
  expect(new PrecisionNumber(995, 0, 2).toString()).toEqual('100E0')
  expect(new PrecisionNumber(0, 0).toString()).toEqual('0E0')
  expect(new PrecisionNumber(0, -2).toString()).toEqual('0E-2')
  expect(new PrecisionNumber(-89, 1).toString()).toEqual('-89E1')
  expect(new PrecisionNumber(-7123, 0, 2).toString()).toEqual('-71E0')
  expect(new PrecisionNumber(-655, 0, 2).toString()).toEqual('-66E0')
  expect(new PrecisionNumber(-999, 0, 2).toString()).toEqual('-100E0')
})

test('fromString', () => {
  expect(PrecisionNumber.fromString('23E1')).toEqual(new PrecisionNumber(23, 1))
  expect(PrecisionNumber.fromString('-892E-31')).toEqual(
    new PrecisionNumber(-892, -31),
  )
  expect(PrecisionNumber.fromString('0E0')).toEqual(new PrecisionNumber(0, 0))
  expect(PrecisionNumber.fromString('-0E-0')).toEqual(new PrecisionNumber(0, 0))
  expect(() => PrecisionNumber.fromString('4e-2')).toThrow(Error)
  expect(() => PrecisionNumber.fromString('4E+2')).toThrow(Error)
  expect(() => PrecisionNumber.fromString('E55')).toThrow(Error)
})
