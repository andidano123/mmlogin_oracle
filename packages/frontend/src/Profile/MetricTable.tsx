import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { PriceItem } from '../types';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});
interface Props {
	tabledata: PriceItem[]
}
function createData(name: string, calories: number, fat: number, carbs: number, protein: number) {
  return { name, calories, fat, carbs, protein };
}


export default function MetricTable({ tabledata }: Props) {
  const classes = useStyles();
  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>No</TableCell>
            <TableCell>TimeStamp</TableCell>
            <TableCell align="right">ETHUSDT</TableCell>
            <TableCell align="right">Sender</TableCell>            
          </TableRow>
        </TableHead>
        <TableBody>
          {tabledata.map((row, index) => (
            <TableRow key={row.ts}>
              <TableCell>{index}</TableCell>
              <TableCell component="th" scope="row">
                {row.ts}
              </TableCell>
              <TableCell align="right">{row.price}</TableCell>
              <TableCell align="right">{row.sender}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
