import * as React from 'react';
import { ElevatorState, IElevator } from '../../../../backend/src/elevatorController';
import ElevatorCallPanel from '../elevator-call-panel/elevator-call-panel';
import Elevator from '../elevator/elevator';
import * as css from './building.module.scss';

interface IBuildingProps {
  floors: number;
  elevators: number;
  timeBetweenFloorsMs: number;
}

interface IBuildingState {
  elevators: IElevator[];
  floors: number;
  destinations: number[];
  activeDestinations: number[];
}

class Building extends React.Component<IBuildingProps, IBuildingState> {
  private intervalIds: number[] = [];
  private queue: number[] = [];
  private readonly baseUrl: string = 'http://localhost:3000';

  constructor(props: IBuildingProps) {
    super(props);
    this.state = {
      elevators: [],
      destinations: [],
      activeDestinations: [],
      floors: props.floors
    };
  }

  componentDidMount() {
    this.init();
  }

  private getURL = (route: string, params?: Record<string, string>): string => {
    const url = new URL(`${this.baseUrl}/${route}`);
    url.search = new URLSearchParams(params).toString();

    return url.toString();
  };

  componentWillUnmount() {
    this.cancelIntervals();
  }

  private init = () => {
    this.queue = [];

    fetch(this.getURL('init', { elevators: this.props.elevators.toString() }))
      .then(res => res.json())
      .then(data => {
        this.setState({
          elevators: data.elevators,
          destinations: [],
          activeDestinations: [],
          floors: this.props.floors,
        });
      });
  };

  private onFloorSelected = (selectedFloor: number) => {
    if (this.hasElevatorOnFloor(selectedFloor)) {
      return;
    }

    if (!this.hasFreeElevator()) {
      this.queue.push(selectedFloor);

      this.setState({
        destinations: this.queue.concat(this.state.activeDestinations),
      });

      return;
    }

    this.queryForElevator(selectedFloor);
  };

  private queryForElevator = (floor: number) => {
    const activeDestinations = this.state.activeDestinations.concat(floor);
    this.setState({
      destinations: this.queue.concat(activeDestinations),
      activeDestinations,
    });

    fetch(this.getURL('elevator', { floor: floor.toString() }))
      .then(res => {
        if (res.ok) {
          return res.json();
        }

        throw Error('No available elevator found');
      })
      .then(this.onElevatorReceived)
      .catch(error => console.log(error));
  };

  private onElevatorReceived = (elevator: IElevator) => {
    this.setState({
      elevators: this.state.elevators.map(e => {
        if (e.id === elevator.id) {
          e = { ...e };
          e.state = elevator.state;
        }
        return e;
      }),
    });

    this.move(elevator);
  };

  private move = (elevator: IElevator) => {
    let floorsTraveled = 0;
    const floorsToDestination = Math.abs(elevator.destination - elevator.floor);

    const intervalId = window.setInterval(() => {
      this.updateFloor(elevator);

      if (++floorsTraveled === floorsToDestination) {
        window.clearInterval(intervalId);
        this.intervalIds = this.intervalIds.filter(t => t !== intervalId);
        this.arrived(elevator);
      }
    }, this.props.timeBetweenFloorsMs);

    this.intervalIds.push(intervalId);
  };

  private arrived = (elevator: IElevator) => {
    const {id, destination: floor } = elevator;
    fetch(this.getURL('arrived'), {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, floor }),
    }).then(() => {
      const activeDestinations = this.state.activeDestinations.filter(d => d !== floor);
      this.setState({
        elevators: this.state.elevators.map(e => {
          if (e.id === id) {
            e = { ...e };
            e.state = ElevatorState.Idle;
          }
          return e;
        }),
        destinations: this.queue.concat(activeDestinations),
        activeDestinations,
      });

      if (this.queue.length > 0) {
        this.queryForElevator(this.queue.shift());
      }
    });
  };

  private updateFloor = (elevator: IElevator) => {
    const direction = elevator.state === ElevatorState.Ascending ? 1 : -1;
    const elevators = this.state.elevators.map(e => {
        if (e.id === elevator.id) {
          e = { ...e };
          e.floor = e.floor + direction;
        }
        return e;
      }
    );

    this.setState({
      elevators,
    });
  };

  private hasElevatorOnFloor = (floor: number) => {
    return this.state.elevators.some(e => e.floor === floor && e.state === ElevatorState.Idle);
  };

  private hasFreeElevator = (): boolean => {
    return this.props.elevators > this.state.activeDestinations.length && this.queue.length === 0;
  };

  private cancelIntervals = () => {
    this.intervalIds.forEach(t => window.clearInterval(t));
    this.intervalIds = [];
  };

  private reset = () => {
    this.cancelIntervals();
    this.init();
  };

  render() {
    return (
      <div className={css.building}>
        <div className={css.elevatorContainer}>
          {this.state.elevators.map((e) =>
            <Elevator key={e.id} id={e.id} floor={e.floor} destination={e.destination} state={e.state}/>)}
        </div>
        <ElevatorCallPanel floors={this.state.floors} destinations={this.state.destinations}
                           onFloorSelected={this.onFloorSelected}/>
        <button className={css.resetButton} onClick={this.reset}>Reset</button>
      </div>
    );
  }
}

export default Building;
