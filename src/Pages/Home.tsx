import { useEffect } from 'react';
import { DynamicGraph } from '../components/DynamicGraph.tsx';
import { AsideEvents } from '../components/AsideEvents.tsx';
import { getLastWeekdays } from '../Store/specificStore/GraphStore.ts';

import 'rsuite/dist/rsuite.min.css';

export const Home = () => {
  // Obtener hoy + 5 días laborables hacia atrás (total 6 fechas)
  const recentWeekdays = getLastWeekdays(6, true);
  useEffect(() => {
    document.title = 'Inicio';
  }, []);
  return (
    <>
      <DynamicGraph
        dataTableName='Ultimos 5 dias escolares'
        initialAssignedDate={recentWeekdays}
        grid='col-span-6 row-span-8 '
      />
      <AsideEvents grid='col-span-2 row-span-9 col-start-7' />
    </>
  );
};
