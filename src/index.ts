export class PrecisionNumber {
  private _significand = '0'
  private _isSignificandNegative = false
  private _exponent = 0
  private _precision = 1

  constructor(
    significand: string,
    isSignificandNegative: boolean,
    exponent: number,
    precision?: number,
  ) {
    // significand has to be set before exponent
    this.significand = significand
    this.isSignificandNegative = isSignificandNegative
    this.exponent = exponent
    if (typeof precision === 'undefined') {
      this.precision = this.significand.length
    } else {
      this.precision = precision
    }
  }

  static fromString(rawNumber: string): PrecisionNumber {
    if (rawNumber.match(/^-?\d+E-?\d+$/)) {
      const [significand, rawExponent] = rawNumber.split('E')
      let exponent = parseInt(rawExponent, 10)

      if (significand[0] === '-') {
        return new this(significand.slice(1), true, exponent)
      } else {
        return new this(significand, false, exponent)
      }
    } else {
      throw new Error('The provided string is invalid.')
    }
  }

  get significand(): string {
    return this._significand
  }

  set significand(significand: string) {
    if (significand.match(/^\d+$/)) {
      this._significand = significand
    } else {
      throw new Error('The significand contains illegal characters.')
    }
    this.removeUnnecessaryLeadingZeros()
    this.makeZeroSignificandPositive()
  }

  get isSignificandNegative(): boolean {
    return this._isSignificandNegative
  }

  set isSignificandNegative(isSignificandNegative: boolean) {
    this._isSignificandNegative = isSignificandNegative
    this.makeZeroSignificandPositive()
  }

  get exponent(): number {
    return this._exponent
  }

  set exponent(exponent: number) {
    // ensure that exponent is not -0
    this._exponent = exponent === 0 ? 0 : exponent
  }

  get precision(): number {
    return this._precision
  }

  set precision(precision: number) {
    if (precision > 0 && precision <= this.significand.length) {
      this._precision = precision || this.significand.toString().length
    } else {
      throw new RangeError(
        'The precision must be greater than 0 and smaller or equal than the number of digits of the significand.',
      )
    }
    this._precision = precision
    this.removeUnnecessaryLeadingZeros()
    this.makeZeroSignificandPositive()
  }

  private makeZeroSignificandPositive(): void {
    if (this.significand === '0') {
      this._isSignificandNegative = false
    }
  }

  private removeUnnecessaryLeadingZeros(): void {
    if (this.significand.length === this.precision) {
      this._significand = this.significand.slice(
        this.leadingZeros(this.significand),
      )
      this._precision = this.significand.length
    }
  }

  private leadingZeros(num: string): number {
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

  private hasLeadingZero(num: string) {
    return num.length > 1 && num[0] === '0'
  }

  toString(): string {
    const significand = (
      parseInt(this.significand.slice(0, this.precision), 10) +
      (parseInt(this.significand[this.precision], 10) > 4 ? 1 : 0)
    ).toString()

    const sign = this.isSignificandNegative && significand !== '0' ? '-' : ''

    return sign + significand + 'E' + this.exponent.toString()
  }

  private determineNumberToPad(num1: PrecisionNumber, num2: PrecisionNumber) {
    console.log('h', num1.exponent, num2.exponent)
    if (num1.exponent > num2.exponent) {
      return [num1, num2]
    } else {
      return [num2, num1]
    }
  }

  add(num: PrecisionNumber): PrecisionNumber {
    // special case if both significands are zero
    if (
      parseInt(this.significand, 10) === 0 &&
      parseInt(num.significand, 10) === 0
    ) {
      return new PrecisionNumber(
        '0',
        false,
        Math.max(this.exponent, num.exponent),
        1,
      )
    }
    const [paddedNumber, unpaddedNumber] = this.determineNumberToPad(this, num)
    const padding = paddedNumber.exponent - unpaddedNumber.exponent
    const paddedSignificand = paddedNumber.significand + '0'.repeat(padding)

    const newSignificand =
      Number(unpaddedNumber.significand) *
        (unpaddedNumber.isSignificandNegative ? -1 : 1) +
      Number(paddedSignificand) * (paddedNumber.isSignificandNegative ? -1 : 1)

    const maxNumOfInsignificantDigits = Math.max(
      paddedSignificand.length - paddedNumber.precision,
      unpaddedNumber.significand.length - unpaddedNumber.precision,
    )
    const newPrecision = Math.max(
      Math.abs(newSignificand).toString().length - maxNumOfInsignificantDigits,
      1,
    )

    let minLength = 0
    if (this.hasLeadingZero(paddedSignificand)) {
      minLength = paddedSignificand.length
    }
    if (this.hasLeadingZero(unpaddedNumber.significand)) {
      minLength = Math.max(minLength, unpaddedNumber.significand.length)
    }

    let newSignificandWithLeadingZeros = Math.abs(newSignificand).toString()
    if (newSignificandWithLeadingZeros.length < minLength) {
      newSignificandWithLeadingZeros =
        '0'.repeat(minLength - newSignificandWithLeadingZeros.length) +
        newSignificandWithLeadingZeros
    }

    const isNewSignificantNegative = newSignificand < 0
    const newExponent = unpaddedNumber.exponent

    // console.log(
    //   newSignificandWithLeadingZeros,
    //   isNewSignificantNegative,
    //   newExponent,
    //   newPrecision,
    // )
    return new PrecisionNumber(
      newSignificandWithLeadingZeros,
      isNewSignificantNegative,
      newExponent,
      newPrecision,
    )
  }
}
