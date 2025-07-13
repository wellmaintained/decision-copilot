export interface StakeholderProps {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export class Stakeholder {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
  readonly photoURL?: string;

  private constructor(props: StakeholderProps) {
    this.id = props.id;
    this.displayName = props.displayName;
    this.email = props.email;
    this.photoURL = props.photoURL;
  }

  static create(props: StakeholderProps): Stakeholder {
    if (!props.email) {
      throw new Error('Email is required');
    }
    if (!this.isValidEmail(props.email)) {
      throw new Error('Invalid email format');
    }
    return new Stakeholder(props);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 