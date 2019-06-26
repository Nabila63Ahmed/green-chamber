import React from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Line, Label } from 'recharts';
import moment from 'moment';

class App extends React.Component {
  state = {};

  render() {
    return (
      <div>
        <LineChart
          width={1000}
          height={300}
          margin={{ top: 30, bottom: 30, left: 30, right: 30 }}
          data={temperatures}
        >
          <XAxis dataKey="createdAt">
            <Label value="Time" offset={-10} position="insideBottom" />
          </XAxis>

          <YAxis>
            <Label value="Temperature" angle={-90} position="insideLeft" />
          </YAxis>

          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </div>
    );
  }
}

const temperatures = new Array(30).fill(0).map(() => ({
  value: Math.random() * 25 + 15,
  createdAt: moment().format('LT'),
}));

export default App;
