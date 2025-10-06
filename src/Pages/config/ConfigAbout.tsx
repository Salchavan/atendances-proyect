import { changePageTitle } from '../../Logic';
import { BoxNull } from '../../components/BoxNull';

export const ConfigAbout = () => {
  changePageTitle('Configuración - Acerca de');
  return <BoxNull className='' />;
};
