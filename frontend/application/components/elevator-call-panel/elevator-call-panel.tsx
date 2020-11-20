import * as React from 'react';
import * as css from './elevator-call-panel.module.scss';

export interface IElevatorCallPanelProps {
  floors: number;
  destinations: number[],
  onFloorSelected: (selectedFloor: number) => void
}

class ElevatorCallPanel extends React.Component<IElevatorCallPanelProps> {
  constructor(props: IElevatorCallPanelProps) {
    super(props);
  }

  private onFloorSelected = (floor: number) => {
    if (this.props.destinations.some(d => d === floor)) {
      return;
    }

    this.props.onFloorSelected(floor);
  };

  public render() {
    return (
      <div className={css.elevatorCallPanel}>
        {Array.from(Array(this.props.floors).keys()).map((floor) =>
          <button
            className={`${this.props.destinations.some(d => d === floor) ? css.callButtonActive : css.callButton}`}
            onClick={() => this.onFloorSelected(floor)} key={floor}>{floor}</button>)}
      </div>
    );
  }
}

export default ElevatorCallPanel;