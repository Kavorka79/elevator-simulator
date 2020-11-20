export enum ElevatorState {
  Ascending,
  Descending,
  Idle,
}

export interface IElevator {
  id: string;
  floor: number;
  destination: number;
  state: ElevatorState;
}

interface IArrivedData {
  id: string;
  floor: number;
}

let elevatorController: ElevatorController;
export const getElevatorController = () => {
  elevatorController = elevatorController ?? new ElevatorController();
  return elevatorController;
};

export class ElevatorController {
  private elevators: IElevator[] = [];

  public getElevators = (): IElevator[] => this.elevators;

  public createElevators = (numberOfElevators: number): IElevator[] => {
    this.elevators = Array.from(Array(numberOfElevators).keys()).map((i) => ({
      id: i.toString(),
      floor: 0,
      destination: 0,
      state: ElevatorState.Idle,
    }));

    return this.elevators;
  };

  public getElevator = (floor: number): IElevator => {
    const elevator = this.elevators
      .filter(e => e.state === ElevatorState.Idle)
      .reduce((prev, curr) => {
        if (prev === undefined) {
          return curr;
        }
        return (Math.abs(curr.floor - floor) < Math.abs(prev.floor - floor) ? curr : prev);
      }, undefined);

    if (elevator === undefined || elevator.floor === floor) {
      return undefined;
    }

    elevator.state = elevator.floor > floor ? ElevatorState.Descending : ElevatorState.Ascending;
    elevator.destination = floor;

    return elevator;
  };

  public handleArrived = (arrived: IArrivedData) => {
    const elevator = this.elevators.find(e => e.id === arrived.id);
    elevator.floor = arrived.floor;
    elevator.state = ElevatorState.Idle;
  };
}