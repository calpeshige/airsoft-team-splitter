export interface Member {
  id: string;
  name: string;
}

export interface Car {
  id: string;
  driver: Member | null;
  passengers: (Member | null)[];
}

export type TeamType = 'red' | 'green' | 'unassigned';
