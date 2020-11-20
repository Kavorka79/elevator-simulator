import * as React from 'react';
import Building from '../../components/building/building';

class ImplementationPage extends React.Component {
  public render() {
    return (
        <Building elevators={5} floors={20} timeBetweenFloorsMs={2000}/>
    );
  }
}

export default ImplementationPage;
