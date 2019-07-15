import React from 'react';
import { Grommet, Grid, Box, Heading, Button } from 'grommet';
import * as Icons from 'grommet-icons';
import { LineChart, XAxis, YAxis, Line, Label, Tooltip } from 'recharts';
import socket from 'socket.io-client';
import moment from 'moment';
import { Spinner } from './components';
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
import { attempt, truncate } from './utilities';

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
    /* Fetch the latest data from the server */
    const [
      temperatures,
      humidities,
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

    /* Connect to the server socket */
    const io = socket('http://localhost:4001');

    /* Reflect real-time temperature change in local state */
    io.on('temperature-changed', newTemperatureReading => {
      this.setState(state => ({
        temperatures: state.temperatures.concat(newTemperatureReading),
        currentTemperature: newTemperatureReading,
      }));
    });

    /* Reflect real-time humidity change in local state */
    io.on('humidity-changed', newHumidityReading => {
      this.setState(state => ({
        humidities: state.humidities.concat(newHumidityReading),
        currentHumidity: newHumidityReading,
      }));
    });

    /* Reflect real-time lamp state in local state */
    io.on('lamp-state-changed', newLampState => {
      this.setState(state => ({ isLampOn: newLampState }));
    });

    /* Reflect real-time fan state in local state */
    io.on('fan-state-changed', newFanState => {
      this.setState(state => ({ isFanOn: newFanState }));
    });

    /* Update local state */
    this.setState({
      isLoading: false,
      temperatures,
      humidities,
      currentTemperature,
      currentHumidity,
      currentEvent,
      isLampOn,
      isFanOn,
    });
  }

  /* Toggle the current lamp state in the system */
  _handleToggleLamp = async () => {
    const { isLampOn } = this.state;
    const newValue = await toggleLamp(!isLampOn);
    this.setState({ isLampOn: newValue });
  };

  /* Toggle the current fan state in the system */
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

    const modifiedTemperatures = temperatures.map(record => ({
      ...record,
      createdAt: moment(record.createdAt).format('LT'),
    }));

    const modifiedHumidities = humidities.map(record => ({
      ...record,
      createdAt: moment(record.createdAt).format('LT'),
    }));

    return (
      <Grommet style={styles.container} full={true} theme={theme}>
        {isLoading ? (
          /* Loading data */
          <Box style={styles.centered} fill={true}>
            <Spinner />
          </Box>
        ) : (
          /* Data loaded */
          <Box>
            <Heading color="white" margin="medium">
              Controls
            </Heading>

            <Box style={styles.centered} direction="row">
              <button
                style={{
                  margin: 16,
                  padding: 30,
                  borderRadius: 15,
                  borderWidth: 4,
                  borderColor: isLampOn ? '#00C781' : '#FF4040',
                  backgroundColor: 'black',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                onClick={this._handleToggleLamp}
              >
                <Icons.Info size="large" color="white" />
              </button>

              <button
                style={{
                  margin: 16,
                  padding: 30,
                  borderRadius: 15,
                  borderWidth: 4,
                  borderColor: isFanOn ? '#00C781' : '#FF4040',
                  backgroundColor: 'black',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                onClick={this._handleToggleFan}
              >
                <Icons.Fan size="large" color="white" />
              </button>
            </Box>

            <Heading color="white" margin="medium">
              Live Readings
            </Heading>

            <Grid
              rows={['xsmall', 'small']}
              columns={['medium', 'medium', 'medium']}
              fill={true}
              margin="large"
              gap="small"
              justifyContent="center"
              areas={[
                { name: 'header-1', start: [0, 0], end: [0, 0] },
                { name: 'header-2', start: [1, 0], end: [1, 0] },
                { name: 'header-3', start: [2, 0], end: [2, 0] },
                { name: 'content-1', start: [0, 1], end: [0, 1] },
                { name: 'content-2', start: [1, 1], end: [1, 1] },
                { name: 'content-3', start: [2, 1], end: [2, 1] },
              ]}
            >
              <Box
                style={styles.centered}
                gridArea="header-1"
                background="#262680"
                round="small"
                elevation="xlarge"
                animation="fadeIn"
              >
                <Heading size="xxsmall">Temperature</Heading>
              </Box>

              <Box
                style={styles.centered}
                gridArea="header-2"
                background="#262680"
                round="small"
                elevation="xlarge"
                animation="fadeIn"
              >
                <Heading size="xxsmall">Humidity</Heading>
              </Box>

              <Box
                style={styles.centered}
                gridArea="header-3"
                background="#262680"
                round="small"
                elevation="xlarge"
                animation="fadeIn"
              >
                <Heading size="xxsmall">Event</Heading>
              </Box>

              <Box
                style={styles.centered}
                gridArea="content-1"
                background="#0000FF"
                round="small"
                elevation="xlarge"
                animation="fadeIn"
              >
                <Heading size="small">
                  {currentTemperature ? (
                    `${currentTemperature.value.toFixed(1)}°C`
                  ) : (
                    <Icons.Close size="large" color="red" />
                  )}
                </Heading>
              </Box>

              <Box
                style={styles.centered}
                gridArea="content-2"
                background="#0000FF"
                round="small"
                elevation="xlarge"
                animation="fadeIn"
              >
                <Heading size="small">
                  {currentHumidity ? (
                    `${currentHumidity.value.toFixed(1)}%`
                  ) : (
                    <Icons.Close size="large" color="red" />
                  )}
                </Heading>
              </Box>

              <Box
                style={styles.centered}
                gridArea="content-3"
                background="#0000FF"
                round="small"
                elevation="xlarge"
                animation="fadeIn"
              >
                <Heading size="small" textAlign="center">
                  {currentEvent ? (
                    truncate(70)(currentEvent.summary)
                  ) : (
                    <Icons.Close size="large" color="red" />
                  )}
                </Heading>
              </Box>
            </Grid>

            {temperatures.length > 0 || humidities.length > 0 ? (
              <Heading color="white" margin="medium">
                Today's Readings
              </Heading>
            ) : null}

            <Box>
              {temperatures.length > 0 ? (
                <LineChart
                  width={window.innerWidth - 10}
                  height={300}
                  margin={{ top: 30, bottom: 30, left: 30, right: 30 }}
                  data={modifiedTemperatures}
                >
                  <XAxis dataKey="createdAt" tick={{ fill: 'white' }}>
                    <Label
                      value="Time"
                      offset={-10}
                      position="insideBottom"
                      fill="white"
                    />
                  </XAxis>

                  <YAxis dataKey="value" tick={{ fill: 'white' }}>
                    <Label
                      value="Temperature (°C)"
                      angle={-90}
                      position="insideLeft"
                      fill="white"
                    />
                  </YAxis>

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0000FF"
                    dot={false}
                  />
                </LineChart>
              ) : null}
            </Box>

            <Box>
              {humidities.length > 0 ? (
                <LineChart
                  width={window.innerWidth - 10}
                  height={300}
                  margin={{ top: 30, bottom: 30, left: 30, right: 30 }}
                  data={modifiedHumidities}
                >
                  <XAxis dataKey="createdAt" tick={{ fill: 'white' }}>
                    <Label
                      value="Time"
                      offset={-10}
                      position="insideBottom"
                      fill="white"
                    />
                  </XAxis>

                  <YAxis dataKey="value" tick={{ fill: 'white' }}>
                    <Label
                      value="Humidity (%)"
                      angle={-90}
                      position="insideLeft"
                      fill="white"
                    />
                  </YAxis>

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0000FF"
                    dot={false}
                  />
                </LineChart>
              ) : null}
            </Box>
          </Box>
        )}
      </Grommet>
    );
  }
}

const styles = {
  container: {
    backgroundColor: 'black',
    overflowX: 'hidden',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const theme = {
  global: {
    font: {
      family: 'Roboto',
      size: '14px',
      height: '20px',
    },
  },
  meter: {
    color: '#0000FF',
  },
};

export default App;
