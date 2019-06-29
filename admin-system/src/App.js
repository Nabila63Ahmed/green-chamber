import React from 'react';
import { LineChart, XAxis, YAxis, Line, Label } from 'recharts';
import moment from 'moment';
import { getTemperatures, getHumidities } from './networking';

class App extends React.Component {
  state = {
    temperatures: [],
    humidities: [],
  };

  async componentDidMount() {
    const [temperatureRecords, humidityRecords] = await Promise.all([
      getTemperatures(),
      getHumidities(),
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
      temperatures: modifiedTemperatureRecords,
      humidities: modifiedHumityRecords,
    });
  }

  render() {
    return (
      <div>
        <LineChart
          width={window.innerWidth - 10}
          height={300}
          margin={{ top: 30, bottom: 30, left: 30, right: 30 }}
          data={this.state.temperatures}
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
          data={this.state.humidities}
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
