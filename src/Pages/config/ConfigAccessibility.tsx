import { changePageTitle } from '../../Logic';
import { BoxNull } from '../../components/BoxNull';

export const ConfigAccessibility = () => {
  changePageTitle('Configuración - Accesibilidad');
  return <BoxNull className='' />;
};
