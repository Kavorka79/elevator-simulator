import * as React from 'react';
import { ElevatorState, IElevator } from '../../../../backend/src/elevatorController';
import ELEVATOR_IMAGE from '../../images/elevator.svg';
import * as css from './elevator.module.scss';

class Elevator extends React.Component<IElevator> {
  public render() {
    return (
      <div className={css.elevator}>
        <div>
          <div className={css.elevatorId}>#{this.props.id}</div>
          <div className={css.floorIndicatorContainer}>
            <div className={`${this.props.state === ElevatorState.Ascending ? css.arrowUpActive : css.arrowUp}`}/>
            <div className={css.floorIndicator}>{this.props.floor}</div>
            <div className={`${this.props.state === ElevatorState.Descending ? css.arrowDownActive : css.arrowDown}`}/>
          </div>
        </div>
        <img className={css.elevatorImage} src={ELEVATOR_IMAGE} alt="elevator"/>
      </div>
    );
  }
}

export default Elevator;