import React from 'react';
import { LineChart, XAxis, YAxis, Line, Label } from 'recharts';
import moment from 'moment';
import {
  getTemperatures,
  getHumidities,
  getCurrentTemperature,
  getCurrentHumidity,
  getCurrentEvent,
  getLamp,
  getFan,
  toggleLamp,
  toggleFan,
} from './networking';
import { attempt } from './utilities';

class App extends React.Component {
  state = {
    isLoading: true,
    temperatures: [],
    humidities: [],
    currentTemperature: null,
    currentHumidity: null,
    currentEvent: null,
    isLampOn: false,
    isFanOn: false,
  };

  async componentDidMount() {
    const [
      temperatureRecords,
      humidityRecords,
      currentTemperature,
      currentHumidity,
      currentEvent,
      isLampOn,
      isFanOn,
    ] = await Promise.all([
      attempt(getTemperatures, []),
      attempt(getHumidities, []),
      attempt(getCurrentTemperature, null),
      attempt(getCurrentHumidity, null),
      attempt(getCurrentEvent, null),
      attempt(getLamp, false),
      attempt(getFan, false),
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
      currentEvent,
      isLampOn,
      isFanOn,
    });
  }

  _handleToggleLamp = async () => {
    const { isLampOn } = this.state;

    const newValue = await toggleLamp(!isLampOn);
    this.setState({ isLampOn: newValue });
  };

  _handleToggleFan = async () => {
    const { isFanOn } = this.state;

    const newValue = await toggleFan(!isFanOn);
    this.setState({ isFanOn: newValue });
  };

  render() {
    const {
      isLoading,
      temperatures,
      humidities,
      currentTemperature,
      currentHumidity,
      currentEvent,
      isLampOn,
      isFanOn,
    } = this.state;

    if (isLoading) {
      return <h3>Loading...</h3>;
    }

    return (
      <div>
        <h1>
          {currentTemperature
            ? currentTemperature.value
            : 'Current temperature unavailable'}
        </h1>

        <h1>
          {currentHumidity
            ? currentHumidity.value
            : 'Current humidity unavailable'}
        </h1>

        <h1>{currentEvent ? currentEvent.summary : 'No current event'}</h1>

        <button
          style={{ backgroundColor: isLampOn ? 'green' : 'red' }}
          onClick={this._handleToggleLamp}
        >
          Toggle Light
        </button>

        <button
          style={{ backgroundColor: isFanOn ? 'green' : 'red' }}
          onClick={this._handleToggleFan}
        >
          Toggle Fan
        </button>

        <div>
          {temperatures.length > 0 ? (
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
                <Label
                  value="Temperature (°C)"
                  angle={-90}
                  position="insideLeft"
                />
              </YAxis>

              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          ) : (
            'Temperatures unavailable'
          )}
        </div>

        <div>
          {humidities.length > 0 ? (
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
          ) : (
            'Humidities unavailable'
          )}
        </div>
      </div>
    );
  }
}

export default App;
