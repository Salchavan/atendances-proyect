import { StudentProfileView } from './components/StudentProfileView';
import { StaffProfileView } from './components/StaffProfileView';
import { ClassroomProfileView } from './components/ClassroomProfileView';
import { useStore } from '../../store/Store';

export const MultiProfile = () => {
  const view = useStore((state) => state.profileView);

  if (view === 'STUDENT') return <StudentProfileView />;
  if (view === 'STAFF') return <StaffProfileView />;
  return <ClassroomProfileView />;
};
