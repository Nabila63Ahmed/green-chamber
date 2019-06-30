import React from 'react';
import { Grommet, Grid, Box, Heading, Button } from 'grommet';
import * as Icons from 'grommet-icons';
import { LineChart, XAxis, YAxis, Line, Label } from 'recharts';
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

    return (
      <Grommet style={styles.container} full={true} theme={theme}>
        {isLoading ? (
          <Box style={styles.centered} fill={true}>
            <Spinner />
          </Box>
        ) : (
          <Box>
            <Heading color="white" margin="medium">
              Controls
            </Heading>

            <Box style={styles.centered} direction="row">
              <Button
                style={{ margin: 16, padding: 30 }}
                plain={false}
                icon={<Icons.Info size="large" />}
                color={isLampOn ? 'status-ok' : 'status-critical'}
                onClick={this._handleToggleLamp}
              />

              <Button
                style={{ margin: 16, padding: 30 }}
                plain={false}
                icon={<Icons.Fan size="large" />}
                color={isFanOn ? 'status-ok' : 'status-critical'}
                onClick={this._handleToggleFan}
              />
            </Box>

            <Heading color="white" margin="medium">
              Readings
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
                  {currentTemperature
                    ? `${currentTemperature.value.toFixed(1)}°C`
                    : 'Current temperature unavailable'}
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
                  {currentHumidity
                    ? `${currentHumidity.value.toFixed(1)}%`
                    : 'Current humidity unavailable'}
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
                <Heading size="small">
                  {currentEvent ? currentEvent.summary : 'No current event'}
                </Heading>
              </Box>
            </Grid>
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
                    <Label
                      value="Humidity (%)"
                      angle={-90}
                      position="insideLeft"
                    />
                  </YAxis>

                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              ) : (
                'Humidities unavailable'
              )}
            </div>
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
