export const leadingZeros = (num: string): number => {
  // the number '0' has no leading zero
  let numOfLeadingZeros = 0
  for (const char of num.slice(0, -1)) {
    if (char === '0') {
      numOfLeadingZeros++
    } else {
      break
    }
  }
  return numOfLeadingZeros
}

export const trailingZeros = (num: string): number => {
  // the number '0' has one trailing zero
  const indexOfFirstNonZeroChar = num
    .split('')
    .reverse()
    .join('')
    .search(/[^0]/)
  return indexOfFirstNonZeroChar === -1 ? num.length : indexOfFirstNonZeroChar
}

export const validateCharactersOfSignificand = (
  significand: string,
): string => {
  if (/^\d+$/.test(significand)) {
    return significand
  } else {
    throw new Error('The significand contains illegal characters.')
  }
}

export const validateRangeOfPrecision = (
  precision: number | undefined,
  significand: string,
): number => {
  const calculatedPrecision = precision ?? significand.length
  if (calculatedPrecision > 0 && calculatedPrecision <= significand.length) {
    return calculatedPrecision
  } else {
    throw new RangeError(
      'The precision must be greater than 0 and smaller or equal than the number of digits of the significand.',
    )
  }
}

export const validateSignOfExponent = (exponent: number): number => {
  // ensure that exponent is not -0
  return exponent === 0 ? 0 : exponent
}

export const removeUnnecessaryZeros = (
  significand: string,
  exponent: number,
  precision: number,
): [string, number, number] => {
  const significantDigits = significand.slice(0, precision)
  const insignificantDigits = significand.slice(precision)

  const numOfLeadingZeros = leadingZeros(significand)
  const numOfLeadingZerosOfSignificandDigits = leadingZeros(significantDigits)
  const numOfUnnecessaryLeadingZeros =
    numOfLeadingZeros < precision
      ? numOfLeadingZeros
      : numOfLeadingZerosOfSignificandDigits

  const numOfUnnecessaryTrailingZeros = trailingZeros(insignificantDigits)

  const newSignificand = numOfUnnecessaryTrailingZeros
    ? significand.slice(
        numOfUnnecessaryLeadingZeros,
        -numOfUnnecessaryTrailingZeros,
      )
    : significand.slice(numOfUnnecessaryLeadingZeros)
  const newExponent = exponent + numOfUnnecessaryTrailingZeros
  const newPrecision = precision - numOfUnnecessaryLeadingZeros

  return [newSignificand, newExponent, newPrecision]
}

const hasLeadingZero = (num: string) => {
  return num.length > 1 && num[0] === '0'
}

const determineNumberToPad = (num1: PrecisionNumber, num2: PrecisionNumber) => {
  if (num1.exponent > num2.exponent) {
    return [num1, num2]
  } else {
    return [num2, num1]
  }
}

export class PrecisionNumber {
  private _significand
  private _exponent
  private _precision

  constructor(significand: string, exponent: number, precision?: number) {
    let validSignificand = validateCharactersOfSignificand(significand)
    let validExponent = validateSignOfExponent(exponent)
    let validPrecision = validateRangeOfPrecision(precision, validSignificand)

    if (/^0+$/.test(significand)) {
      this._significand = '0'
      this._exponent = validExponent + validSignificand.length - validPrecision
      this._precision = 1
    } else {
      ;[
        validSignificand,
        validExponent,
        validPrecision,
      ] = removeUnnecessaryZeros(
        validSignificand,
        validExponent,
        validPrecision,
      )
      this._significand = validSignificand
      this._exponent = validExponent
      this._precision = validPrecision
    }
  }

  static fromString(num: string): PrecisionNumber {
    if (/^\d+E-?\d+$/.test(num)) {
      const [significand, rawExponent] = num.split('E')
      const exponent = parseInt(rawExponent, 10)

      return new this(significand, exponent)
    } else {
      throw new Error('The provided string is invalid.')
    }
  }

  static fromDecimalString(num: string, exponent = 0) {
    if (/^\d+$/.test(num)) {
      return new this(num, exponent)
    } else if (/^\d+\.\d+$/.test(num)) {
      const numOfDigitsAfterDecimal = num.split('.')[1].length
      let numWithoutDecimalPoint = num.replace('.', '')
      numWithoutDecimalPoint = numWithoutDecimalPoint.slice(
        leadingZeros(numWithoutDecimalPoint),
      )

      if (/^0+\.0+$/.test(num)) {
        return new this('0', exponent - numOfDigitsAfterDecimal)
      }

      return new this(
        numWithoutDecimalPoint,
        exponent - numOfDigitsAfterDecimal,
      )
    } else {
      throw new Error('The provided string is invalid.')
    }
  }

  get significand(): string {
    return this._significand
  }

  get exponent(): number {
    return this._exponent
  }

  get precision(): number {
    return this._precision
  }

  toString(): string {
    const significand = (
      parseInt(this.significand.slice(0, this.precision), 10) +
      (parseInt(this.significand[this.precision], 10) > 4 ? 1 : 0)
    ).toString()

    return significand + 'E' + this.exponent.toString()
  }

  toDecimalString(exponent = 0): string {
    const calculatedExponent = this.exponent + exponent
    const numOfInsignificantDigits = this.significand.length - this.precision

    const roundedNum = (
      Math.round(
        parseInt(this.significand, 10) / 10 ** numOfInsignificantDigits,
      ) *
      10 ** numOfInsignificantDigits
    ).toString()

    let digitsBeforeDecimal = ''
    let digitsAfterDecimal = ''

    if (calculatedExponent >= 0) {
      if (roundedNum === '0') {
        digitsBeforeDecimal = '0'
      } else {
        digitsBeforeDecimal = roundedNum + '0'.repeat(calculatedExponent)
      }
    } else {
      if (roundedNum.length > -calculatedExponent) {
        const numOfDigitsBeforeDecimal = roundedNum.length + calculatedExponent
        const numOfDigitsAfterDecimal = -calculatedExponent
        digitsBeforeDecimal = roundedNum.slice(0, numOfDigitsBeforeDecimal)
        if (numOfDigitsAfterDecimal > numOfInsignificantDigits) {
          digitsAfterDecimal = roundedNum.slice(
            numOfDigitsBeforeDecimal,
            roundedNum.length - numOfInsignificantDigits,
          )
        }
      } else {
        digitsBeforeDecimal = '0'
        digitsAfterDecimal =
          '0'.repeat(Math.abs(calculatedExponent + roundedNum.length)) +
          roundedNum.slice(0, roundedNum.length - numOfInsignificantDigits)
      }
    }

    return (
      digitsBeforeDecimal +
      (digitsAfterDecimal.length ? '.' + digitsAfterDecimal : '')
    )
  }

  add(num: PrecisionNumber): PrecisionNumber {
    // special case if both significands are zero
    if (
      parseInt(this.significand, 10) === 0 &&
      parseInt(num.significand, 10) === 0
    ) {
      return new PrecisionNumber('0', Math.max(this.exponent, num.exponent), 1)
    }
    const [paddedNumber, unpaddedNumber] = determineNumberToPad(this, num)
    const padding = paddedNumber.exponent - unpaddedNumber.exponent
    const paddedSignificand = paddedNumber.significand + '0'.repeat(padding)

    const newSignificand =
      Number(unpaddedNumber.significand) + Number(paddedSignificand)

    const maxNumOfInsignificantDigits = Math.max(
      paddedSignificand.length - paddedNumber.precision,
      unpaddedNumber.significand.length - unpaddedNumber.precision,
    )
    const newPrecision = Math.max(
      Math.abs(newSignificand).toString().length - maxNumOfInsignificantDigits,
      1,
    )

    let minLength = 0
    if (hasLeadingZero(paddedSignificand)) {
      minLength = paddedSignificand.length
    }
    if (hasLeadingZero(unpaddedNumber.significand)) {
      minLength = Math.max(minLength, unpaddedNumber.significand.length)
    }

    let newSignificandWithLeadingZeros = Math.abs(newSignificand).toString()
    if (newSignificandWithLeadingZeros.length < minLength) {
      newSignificandWithLeadingZeros =
        '0'.repeat(minLength - newSignificandWithLeadingZeros.length) +
        newSignificandWithLeadingZeros
    }

    const newExponent = unpaddedNumber.exponent

    return new PrecisionNumber(
      newSignificandWithLeadingZeros,
      newExponent,
      newPrecision,
    )
  }

  div(num: number) {
    if (num > 0) {
      const newSignificand = Math.round(
        parseInt(this.significand, 10) / num,
      ).toString()
      const newPrecision =
        this.precision - (this.significand.length - newSignificand.length)
      return new PrecisionNumber(newSignificand, this.exponent, newPrecision)
    } else {
      throw new RangeError('The number must be greater than 0.')
    }
  }
}
