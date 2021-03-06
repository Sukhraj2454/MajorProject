// React Utils
import { useState, useEffect, useRef } from 'react';

// Other Utils
import { updateDate } from '../../Utils/controller';

// MUI Components
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileDateTimePicker from '@mui/lab/MobileDateTimePicker';
import { Container } from '@mui/material';

export default function BasicDateTimePicker({ name, disabled, date, minDate, tId }) {
  const valueRef = useRef(date);
  const [value, setValue] = useState(date);
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')));
  useEffect(() => {
    if (value !== null && value !== valueRef.current) {
      // console.log(value)
      // console.log(date)
      valueRef.current = value;
      updateDate(value, tId);
    }
    setUser(JSON.parse(sessionStorage.getItem('user')))
  }, [value, date, tId, setUser]);

  return (
    <Container sx={{ mt: 2, mb: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MobileDateTimePicker
          clearable
          label={name}
          showTodayButton
          todayText="Current Time"
          value={value}
          minDate={minDate}
          disabled={user ? (user.desig !== 'EE') : true}
          onChange={(newValue) => {
            setValue(newValue);
          }}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
    </Container>
  );
}
BasicDateTimePicker.defaultProps = {
  disabled: false,
  name: 'DateTimePicker',
  date: new Date(),
  minDate: new Date(),
  user: { desig: 'Worker' },
}
