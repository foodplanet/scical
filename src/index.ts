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

  add(num: PrecisionNumber): PrecisionNumber {
    // special case if both significands are zero because padding does not work with: significand2 *= 10 ** padding bcs the number of digits doesn't increase
    // if (this.significand === 0 && num.significand === 0) {
    //   return new PrecisionNumber(0, Math.max(this.exponent, num.exponent), 1)
    // }
    let paddedSignificand = 0
    let significand1 = this._significand
    let significand2 = num.significand
    let significand1InsignificantDigits = 0
    let significand2InsignificantDigits = 0
    let padding = 0

    // padd the shorter significand with zeros to the same length as the longer one
    if (this._exponent > num.exponent) {
      paddedSignificand = 1
      padding = this._exponent - num.exponent
      significand1InsignificantDigits =
        significand1.length - this._precision + padding
      significand2InsignificantDigits = significand2.length - num.precision
      significand1 += '0'.repeat(padding)
    } else if (num.exponent > this._exponent) {
      paddedSignificand = 2
      padding = num.exponent - this._exponent
      significand1InsignificantDigits = significand1.length - this._precision
      significand2InsignificantDigits =
        significand2.length - num.precision + padding
      significand2 += '0'.repeat(padding)
    }
    const newSignificand =
      Number(significand1) * (this.isSignificandNegative ? -1 : 1) +
      Number(significand2) * (num.isSignificandNegative ? -1 : 1)
    // new exponent is the one we haven't padded
    const newExponent = paddedSignificand === 2 ? this._exponent : num.exponent
    const newPrecision = Math.max(
      Math.abs(newSignificand).toString().length -
        Math.max(
          significand1InsignificantDigits,
          significand2InsignificantDigits,
        ),
      1,
    )

    const isNewSignificantNegative = newSignificand < 0

    let minLength = 0
    if (this.hasLeadingZero(significand1)) {
      minLength = significand1.length
    }
    if (this.hasLeadingZero(significand2)) {
      minLength = Math.max(minLength, significand2.length)
    }

    let newSignificandWithLeadingZeros = Math.abs(newSignificand).toString()
    if (newSignificandWithLeadingZeros.length < minLength) {
      newSignificandWithLeadingZeros =
        '0'.repeat(minLength - newSignificandWithLeadingZeros.length) +
        newSignificandWithLeadingZeros
    }

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
