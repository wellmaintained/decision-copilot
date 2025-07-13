import { IsNotEmpty, Matches } from 'class-validator';

export class Name {
  @IsNotEmpty({ message: "Name can't be empty." })
  @Matches(/^(?!.*(foo|bar)).*$/, { message: "Name can't contain forbidden words." })
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Name {
    // Additional custom validation logic can go here
    return new Name(value);
  }
}