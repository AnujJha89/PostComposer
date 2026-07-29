

export class PostContent {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): PostContent {
    if (typeof value !== 'string') {
      throw new Error('PostContent must be a string.');
    }
    
    if (value.length > 63206) {
      throw new Error('Content exceeds maximum allowed length of 63,206 characters.');
    }
    return new PostContent(value);
  }

  get value(): string {
    return this._value;
  }

  get length(): number {
    return this._value.length;
  }

  isEmpty(): boolean {
    return this._value.trim().length === 0;
  }

  preview(maxLength: number = 100): string {
    if (this._value.length <= maxLength) return this._value;
    return this._value.slice(0, maxLength - 3) + '...';
  }

  equals(other: PostContent): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
