import { classed } from "~/lib/classed";
import { Row } from "./Row";
import { Column, WithId } from "./types";

const Cell = classed.td("py-0.5 text-sm font-medium text-end", {
  variants: {
    align: {
      right: "pr-8 text-right",
      left: "text-left"
    }
  }
});

interface Props<T extends WithId> {
  data: T[];
  columns: Column<T>[];
}

export function TableContent<T extends WithId>(props: Props<T>) {
  const isEven = (index: number) => index % 2 === 0;
  const isLast = (index: number) => index === props.data.length - 1;

  return (
    <>
      {props.data.map((row, rowIndex) => (
        <Row key={row.id} even={isEven(rowIndex)} last={isLast(rowIndex)}>
          {props.columns.map((column) => (
            <Cell key={column.name} align={column.align ?? "left"}>
              {column.render ? column.render(row) : String(row[column.field])}
            </Cell>
          ))}
        </Row>
      ))}
    </>
  );
}
