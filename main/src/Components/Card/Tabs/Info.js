// React  Utils
import { useState, useEffect, useRef } from 'react'

// Other Utils
import { updateStatus } from '../../../Utils/controller';
// import {updatePriority } from '../../../Utils/controller';

// Other Components
import ACInput from "../../Others/ACInput";
// import BasicDateTimePicker from '../../Others/BasicDateTimePicker';

// MUI Components
import { Container } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

function Info({ theme, workers, data, set, cards, setCards, setRefresh, refresh }) {
    const [status, setStatus] = useState(data ? data.status : 'To Do');
    const firstStatusRender = useRef(true);

    // const firstPriorityRender = useRef(true);
    // const [priority, setPriority] = useState(data ? (data.priority === 2 ? 'High' : 'Medium') : '');
    // useEffect(() => {

    //     firstStatusRender.current = true;
    //     firstPriorityRender.current = true;
    // }, [])

    const handleStatusChange = (event) => {
        let temp = refresh.current;
        setRefresh(!temp);
        setStatus(event.target.value);
        if (cards.length > 0) {
            let ind = cards.findIndex(x => x._id === data._id);
            let temp = cards[ind];
            cards = cards.filter(x => x._id !== data._id);
            temp.status = event.target.value;
            cards.push(temp);
            setCards(cards);
        }
    };

    useEffect(() => {
        // setPriority(data.priority === 2 ? 'High' : 'Medium');
        setStatus(data.status);
        set[2](data.assignee);
        set[3](data.reporter);
        // eslint-disable-next-line
    }, [cards, data]);


    // const handlePriorityChange = (event) => {

    //     setPriority(event.target.value);
    //     set[1](event.target.value === 'Medium' ? 1 : 2);

    // };

    useEffect(() => {
        if (firstStatusRender.current) {
            firstStatusRender.current = false;
            return;
        }       // referece for not calling function if loading component for first time.
        updateStatus(status, data._id);
    }, [status, data._id]);

    // useEffect(() => {
    //     if (firstPriorityRender.current) {
    //         firstPriorityRender.current = false;
    //         return;
    //     }   // referece for not calling function if loading component for first time.
    //     updatePriority(priority, data._id);
    // }, [priority, data._id]);

    return (
        <Container component={'main'} maxWidth='sm'>

            <ACInput theme={theme} variant='outlined'
                setTitle={set[2]}
                defValue={{
                    title: data.assignee.name,
                    id: data.assignee.id
                }}
                data={workers}
                label={"Assignee"} />

            <ACInput theme={theme} variant='outlined'
                setTitle={set[3]}
                defValue={{
                    title: data.reporter.name,
                    id: data.reporter.id
                }}
                data={workers}
                label={"Reporter"} />

            {/* <FormControl fullWidth sx={{ mb: 3, mt: 3 }}>
                <InputLabel id="priority-select-label">Priority</InputLabel>
                <Select
                    labelId="priority-select-label"
                    id="priority-select"
                    value={priority}
                    label="Status"
                    onChange={handlePriorityChange}
                >
                    <MenuItem value={'Medium'}>Medium</MenuItem>
                    <MenuItem value={'High'}>High</MenuItem>
                </Select>
            </FormControl> */}
            {/* <BasicDateTimePicker name='Deadline'
                date={data.deadline !== undefined ? new Date(data.deadline) : null}
                sx={{ m: 1 }}
                tId={data._id}
                minDate={new Date(data.createdOn)}
            /> */}
            <FormControl fullWidth>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                    labelId="status-select-label"
                    value={status}
                    label="Status"
                    onChange={handleStatusChange}
                >
                    <MenuItem value={'To Do'}>To Do</MenuItem>
                    <MenuItem value={'In Progress'}>In Progress</MenuItem>
                    {/* <MenuItem value={'Review'}>Review</MenuItem> */}
                    <MenuItem value={'Completed'}>Completed</MenuItem>
                </Select>
            </FormControl>
        </Container >)
}
Info.defaultProps = {
    setCards: () => { },
    cards: [],
    setRefresh: () => { },
    refresh: false
}
export default Info;