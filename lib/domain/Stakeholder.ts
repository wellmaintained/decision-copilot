export type StakeholderProps = {
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
    return new Stakeholder(props);
  }
} 