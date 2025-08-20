import { defaultDataTabletColumns } from '../data/Data';

import type { RowDataType } from 'rsuite/esm/Table';

import { DataGrid } from '@mui/x-data-grid';

type Props = {
  tableData: RowDataType[];
};

export const DataTable = ({ tableData }: Props) => {
  return (
    <DataGrid
      columns={defaultDataTabletColumns}
      rows={tableData}
      rowHeight={25}
      columnHeaderHeight={36}
      autoPageSize
    />
  );
};
