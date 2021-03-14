import { PrecisionNumber } from '../index'

test('constructor', () => {
  expect(new PrecisionNumber('23', false, 0).significand).toEqual('23')
  expect(new PrecisionNumber('23', false, 0).isSignificandNegative).toEqual(false)
  expect(new PrecisionNumber('23', false, 0).exponent).toEqual(0)
  expect(new PrecisionNumber('23', false, 0).precision).toEqual(2)
  expect(new PrecisionNumber('8', true, 1).significand).toEqual('8')
  expect(new PrecisionNumber('8', true, 1).isSignificandNegative).toEqual(true)
  expect(new PrecisionNumber('8', true, 1).exponent).toEqual(1)
  expect(new PrecisionNumber('8', true, 1).precision).toEqual(1)
  expect(new PrecisionNumber('523', false, -24, 2).significand).toEqual("523")
  expect(new PrecisionNumber('523', false, -24, 2).isSignificandNegative).toEqual(false)
  expect(new PrecisionNumber('523', false, -24, 2).exponent).toEqual(-24)
  expect(new PrecisionNumber('523', false, -24, 2).precision).toEqual(2)

  const num1= new PrecisionNumber('012', false, -3, 2)
  expect(num1.significand).toEqual('012')
  expect(num1.isSignificandNegative).toEqual(false)
  expect(num1.exponent).toEqual(-3)
  expect(num1.precision).toEqual(2)

  const num2= new PrecisionNumber('012', false, 0)
  expect(num2.significand).toEqual('12')
  expect(num2.isSignificandNegative).toEqual(false)
  expect(num2.exponent).toEqual(0)
  expect(num2.precision).toEqual(2)

  const num3= new PrecisionNumber('00', true, 0)
  expect(num3.significand).toEqual('0')
  expect(num3.isSignificandNegative).toEqual(false)
  expect(num3.exponent).toEqual(0)
  expect(num3.precision).toEqual(1)

  const num4= new PrecisionNumber('000', false, 0, 1)
  expect(num4.significand).toEqual('000')
  expect(num4.isSignificandNegative).toEqual(false)
  expect(num4.exponent).toEqual(0)
  expect(num4.precision).toEqual(1)

  expect(() => new PrecisionNumber('67', false, 0, 3)).toThrow(RangeError)
  expect(() => new PrecisionNumber('9', true, 0, 0)).toThrow(RangeError)
  expect(() => new PrecisionNumber('0', false, 0, -1)).toThrow(RangeError)

  expect(() => new PrecisionNumber('-5', false, 0)).toThrow(Error)
  expect(() => new PrecisionNumber('-5', true, 0)).toThrow(Error)
  expect(() => new PrecisionNumber('-0', true, 0)).toThrow(Error)
  expect(() => new PrecisionNumber('0.23', false, 0)).toThrow(Error)
})

test('toString', () => {
  expect(new PrecisionNumber('23', false, 0).toString()).toEqual('23E0')
  expect(new PrecisionNumber('826', false, 1).toString()).toEqual('826E1')
  expect(new PrecisionNumber('42',false, 0, 1).toString()).toEqual('4E0')
  expect(new PrecisionNumber('178',false, 2, 1).toString()).toEqual('2E2')
  expect(new PrecisionNumber('995', false, 0, 2).toString()).toEqual('100E0')
  expect(new PrecisionNumber('0',false, 0).toString()).toEqual('0E0')
  expect(new PrecisionNumber('0', false, -2).toString()).toEqual('0E-2')
  expect(new PrecisionNumber('89', true, 1).toString()).toEqual('-89E1')
  expect(new PrecisionNumber('7123', true, 0, 2).toString()).toEqual('-71E0')
  expect(new PrecisionNumber('655', true, 0, 2).toString()).toEqual('-66E0')
  expect(new PrecisionNumber('999', true, 0, 2).toString()).toEqual('-100E0')
  expect(new PrecisionNumber('09', false, 0, 1).toString()).toEqual('1E0')
  expect(new PrecisionNumber('0003', true, 0, 3).toString()).toEqual('0E0')
})

test('fromString', () => {
  expect(PrecisionNumber.fromString('23E1')).toEqual(new PrecisionNumber('23', false, 1))
  expect(PrecisionNumber.fromString('-892E-31')).toEqual(
    new PrecisionNumber('892', true, -31),
  )
  expect(PrecisionNumber.fromString('0E0')).toEqual(new PrecisionNumber('0', false, 0))
  expect(PrecisionNumber.fromString('-0E-0')).toEqual(new PrecisionNumber('0', false, 0))
  expect(() => PrecisionNumber.fromString('4e-2')).toThrow(Error)
  expect(() => PrecisionNumber.fromString('4E+2')).toThrow(Error)
  expect(() => PrecisionNumber.fromString('E55')).toThrow(Error)
})


test.each([
  ['23', false, 2, 2, '5', false, -1, 1, '23005', false, -1, 2],
  ['3', true, 0, 1, '5', false, 0, 1, '2', false, 0, 1],
  ['999', false, -2, 2, '999', false, -1, 3, '10989', false, -2, 4],
  ['1', false, 3, 1, '9', false, 2, 1, '19', false, 2, 1],
  // both significands are zero
  ['0', false, 1, 1, '0', false, 0, 1, '00', false, 0, 1],
  ['0', false, 1, 1, '5', false, 0, 1, '05', false, 0, 1],
  ['0', false, 0, 1, '0', false, 0, 1, '0', false, 0, 1],
  ['0', false, -4, 1, '0', false, -4, 1, '0', false, -4, 1],
  // ['0', false, -11, 1, '0', false, 10, 1, '0', false, 10, 1],
  // one significand is zero
  ['1', false, 0, 1, '0', false, 0, 1, '1', false, 0, 1],
  ['45', false, 0, 2, '0', false, 1, 1, '45', false, 0, 1],
])(
  '(%s, %d, %i, %i).add((%s, %d, %i, %i))',
  (
    significand1,
    isSignificand1Negative,
    exponent1,
    precision1,
    significand2,
    isSignificand2Negative,
    exponent2,
    precision2,
    significandRes,
    isSignificandResNegative,
    exponentRes,
    precisionRes
  ) => {
    const num1 = new PrecisionNumber(significand1, isSignificand1Negative, exponent1, precision1)
    const num2 = new PrecisionNumber(significand2, isSignificand2Negative, exponent2, precision2)
    expect(num1.add(num2)).toEqual(new PrecisionNumber(significandRes, isSignificandResNegative, exponentRes, precisionRes))
  }
)
