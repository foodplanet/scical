export class PrecisionNumber {
  private _significand: number
  private _exponent: number
  private _precision: number

  constructor(significand: number, exponent: number, precision?: number) {
    this._significand = significand
    this._exponent = exponent
    if (
      typeof precision === 'undefined' ||
      (precision > 0 && precision <= significand.toString().length)
    ) {
      this._precision = precision || Math.abs(significand).toString().length
    } else {
      throw new RangeError(
        'The precision must be greater than 0 and smaller or equal than the number of digits of the significand.',
      )
    }
  }

  get significand(): number {
    return this._significand
  }

  set significand(significand: number) {
    this._significand = significand
  }

  get exponent(): number {
    return this._exponent
  }

  set exponent(exponent: number) {
    this._exponent = exponent
  }

  get precision(): number {
    return this._precision
  }

  set precision(precision: number) {
    this._precision = precision
  }

  toString(): string {
    let output = this.significand < 0 ? '-' : ''

    const absoluteSignificand = Math.abs(this.significand).toString()
    output += (
      parseInt(absoluteSignificand.slice(0, this.precision), 10) +
      (parseInt(absoluteSignificand[this.precision], 10) > 4 ? 1 : 0)
    ).toString()

    output += 'E' + this._exponent.toString()

    return output
  }
}
