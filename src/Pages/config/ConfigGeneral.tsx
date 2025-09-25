import { changePageTitle } from '../../Logic';
import { BoxNull } from '../../components/BoxNull';

export const ConfigGeneral = () => {
  changePageTitle('Configuración - General');
  return <BoxNull className='' />;
};
