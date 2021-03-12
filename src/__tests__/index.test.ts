import { PrecisionNumber } from '../index'

test('PrecisionNumber', () => {
  expect(PrecisionNumber(3, 4)).toBe('3#4')
})
