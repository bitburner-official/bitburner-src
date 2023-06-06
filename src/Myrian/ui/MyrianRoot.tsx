import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import PersonIcon from '@mui/icons-material/Person';
import { Box } from "@mui/system";
import { Paper, Typography } from "@mui/material";
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import { useRerender } from "src/ui/React/hooks";


const width = 30;
const height = 30;

const iterator = (i: number): number[] => {
    return Array(i).fill(0)
}

const Cell = (): React.ReactElement => {
    const x = 20;
    const sx = {
        display: 'block',
        color: 'white',
        fontSize: x + 'px',
    }
    return <div style={{
        width: x + 'px', height: x + 'px', margin: '0px', padding: '0px'
    }}>{Math.random() > 0.5 ? <PersonIcon sx={sx} /> : <BatteryFullIcon sx={sx} />}</div>
}

export function MyrianRoot(): React.ReactElement {
    console.log(new Date());
    const [render, setRerender] = useState(false);
    const rerender = () => setRerender((old) => !old);
    useEffect(() => {
        const intervalID = setInterval(rerender, 200);
        return () => clearInterval(intervalID);
    }, []);

    return (
        <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
            <Paper sx={{ display: 'flex', flexDirection: 'column', m: 0, p: 0 }}>
                {iterator(height).map(() => <Box sx={{ display: 'flex', flexDirection: 'row' }}>{iterator(width).map(() => <Cell />)}</Box>)}
            </Paper>
        </Container>
    );
}
