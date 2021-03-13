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
    this.removeUnnecessaryLeadingZeros()
    this.makeZeroSignificandPositive()
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
      let numOfLeadingZeros = 0
      for (const char of this.significand.slice(0, -1)) {
        if (char === '0') {
          numOfLeadingZeros++
        } else {
          break
        }
      }
      this._significand = this.significand.slice(numOfLeadingZeros)
      this._precision = this.significand.length
    }
  }

  toString(): string {
    const significand = (
      parseInt(this.significand.slice(0, this.precision), 10) +
      (parseInt(this.significand[this.precision], 10) > 4 ? 1 : 0)
    ).toString()

    const sign = this.isSignificandNegative && significand !== '0' ? '-' : ''

    return sign + significand + 'E' + this.exponent.toString()
  }

  //   add(num: PrecisionNumber): PrecisionNumber {
  //     // special case if both significands are zero because padding does not work with: significand2 *= 10 ** padding bcs the number of digits doesn't increase
  //     if (this.significand === 0 && num.significand === 0) {
  //       return new PrecisionNumber(0, Math.max(this.exponent, num.exponent), 1)
  //     }
  //     let paddedSignificand = 0
  //     let significand1 = this._significand
  //     let significand2 = num.significand
  //     let significand1InsignificantDigits = 0
  //     let significand2InsignificantDigits = 0
  //     let padding = 0

  //     // padd the shorter significand with zeros to the same length as the longer one
  //     if (this._exponent > num.exponent) {
  //       paddedSignificand = 1
  //       padding = this._exponent - num.exponent
  //       significand1InsignificantDigits =
  //         Math.abs(significand1).toString().length - this._precision + padding
  //       significand2InsignificantDigits =
  //         Math.abs(significand2).toString().length - num.precision
  //       significand1 *= 10 ** padding
  //     } else if (num.exponent > this._exponent) {
  //       paddedSignificand = 2
  //       padding = num.exponent - this._exponent
  //       significand1InsignificantDigits =
  //         Math.abs(significand1).toString().length - this._precision
  //       significand2InsignificantDigits =
  //         Math.abs(significand2).toString().length - num.precision + padding
  //       significand2 *= 10 ** padding
  //     }
  //     const newSignificand = significand1 + significand2
  //     // new exponent is the one we haven't padded
  //     const newExponent = paddedSignificand === 2 ? this._exponent : num.exponent
  //     const newPrecision =
  //       Math.abs(newSignificand).toString().length -
  //         Math.max(
  //           significand1InsignificantDigits,
  //           significand2InsignificantDigits,
  //         ) || 1
  //     console.log(newExponent, paddedSignificand)
  //     return new PrecisionNumber(newSignificand, newExponent, newPrecision)
  //   }
}
