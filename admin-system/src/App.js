import React from 'react';
import { LineChart, XAxis, YAxis, Line, Label } from 'recharts';
import moment from 'moment';
import {
  getTemperatures,
  getHumidities,
  getCurrentTemperature,
  getCurrentHumidity,
} from './networking';

class App extends React.Component {
  state = {
    isLoading: true,
    temperatures: [],
    humidities: [],
    currentTemperature: null,
    currentHumidity: null,
  };

  async componentDidMount() {
    const [
      temperatureRecords,
      humidityRecords,
      currentTemperature,
      currentHumidity,
    ] = await Promise.all([
      getTemperatures(),
      getHumidities(),
      getCurrentTemperature(),
      getCurrentHumidity(),
    ]);

    const modifiedTemperatureRecords = temperatureRecords.map(record => ({
      ...record,
      createdAt: moment(record.createdAt).format('LT'),
    }));

    const modifiedHumityRecords = humidityRecords.map(record => ({
      ...record,
      createdAt: moment(record.createdAt).format('LT'),
    }));

    this.setState({
      isLoading: false,
      temperatures: modifiedTemperatureRecords,
      humidities: modifiedHumityRecords,
      currentTemperature,
      currentHumidity,
    });
  }

  render() {
    const {
      isLoading,
      temperatures,
      humidities,
      currentTemperature,
      currentHumidity,
    } = this.state;

    if (isLoading) {
      return <h3>Loading...</h3>;
    }

    return (
      <div>
        <h1>{currentTemperature.value}</h1>

        <h1>{currentHumidity.value}</h1>

        <LineChart
          width={window.innerWidth - 10}
          height={300}
          margin={{ top: 30, bottom: 30, left: 30, right: 30 }}
          data={temperatures}
        >
          <XAxis dataKey="createdAt">
            <Label value="Time" offset={-10} position="insideBottom" />
          </XAxis>

          <YAxis>
            <Label value="Temperature (°C)" angle={-90} position="insideLeft" />
          </YAxis>

          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>

        <LineChart
          width={window.innerWidth - 10}
          height={300}
          margin={{ top: 30, bottom: 30, left: 30, right: 30 }}
          data={humidities}
        >
          <XAxis dataKey="createdAt">
            <Label value="Time" offset={-10} position="insideBottom" />
          </XAxis>

          <YAxis>
            <Label value="Humidity (%)" angle={-90} position="insideLeft" />
          </YAxis>

          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </div>
    );
  }
}

export default App;
