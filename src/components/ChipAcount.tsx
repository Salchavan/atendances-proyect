import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { useStore } from '../store/Store';
import { useUsers } from '../hooks/useUsers';

type Props = {
  size?: number;
  showRole?: boolean;
  className?: string;
  idAcount?: string;
  nameAcount?: string;
  roleAcount?: string;
  avatarAcount?: string;
};

export const ChipAcount: React.FC<Props> = ({
  size = 36,
  showRole = true,
  className,
  idAcount,
  nameAcount,
  roleAcount,
  avatarAcount,
}) => {
  const storeUser = useStore((s) => s.perfilUserSelected);
  const { data: users = [] } = useUsers();

  const [override, setOverride] = useState<
    | {
        fullName?: string;
        roleText?: string;
        initials?: string;
        avatarUrl?: string;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    if (!idAcount) {
      if (nameAcount || roleAcount || avatarAcount) {
        const trimmedName = (nameAcount || '').trim();
        const initials =
          trimmedName
            .split(' ')
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || '?';
        setOverride({
          fullName: trimmedName || undefined,
          roleText: roleAcount || undefined,
          initials,
          avatarUrl: avatarAcount || undefined,
        });
      } else {
        setOverride(undefined);
      }
      return;
    }

    const found = users.find((u) => String(u.id) === String(idAcount));
    if (!found) {
      setOverride(undefined);
      return;
    }
    const first = (found.firstName || found.first_name || '').trim();
    const last = (found.lastName || found.last_name || '').trim();
    const fullName = [first, last].filter(Boolean).join(' ') || found.email;
    const initials =
      `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase().slice(0, 2) ||
      (fullName?.[0]?.toUpperCase() ?? '?');
    const roleText =
      typeof found.rol !== 'undefined' ? `Rol ${String(found.rol)}` :
      found.role ? String(found.role) : '';
    setOverride({ fullName, roleText, initials, avatarUrl: undefined });
  }, [idAcount, nameAcount, roleAcount, avatarAcount, users]);

  const { initials, fullName, roleText, avatarUrl } = useMemo(() => {
    if (override) {
      return {
        initials: override.initials || '?',
        fullName: override.fullName || 'No definido',
        roleText: override.roleText || 'No definido',
        avatarUrl: override.avatarUrl,
      };
    }

    if (storeUser) {
      const first = (storeUser?.firstName || '').trim();
      const last = (storeUser?.lastName || '').trim();
      const initials =
        `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() ||
        (storeUser?.Username?.[0]?.toUpperCase() ?? '?');
      const fullName =
        [first, last].filter(Boolean).join(' ') ||
        storeUser?.Username ||
        storeUser?.email ||
        'Sin selección';
      const resolvedRole =
        (storeUser as any)?.role ??
        (storeUser as any)?.rol ??
        (storeUser as any)?.Role ??
        'STUDENT';
      const roleText = String(resolvedRole);
      return { initials, fullName, roleText, avatarUrl: undefined };
    }

    return {
      initials: '?',
      fullName: 'No definido',
      roleText: 'No definido',
      avatarUrl: undefined,
    };
  }, [override, storeUser]);

  return (
    <Box
      className={className}
      sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 1 }}
      title={
        override || storeUser
          ? `${fullName}${showRole && roleText ? ` • ${roleText}` : ''}`
          : 'Sin selección'
      }
    >
      <Avatar
        src={avatarUrl}
        sx={{ width: size, height: size, fontSize: size * 0.45 }}
      >
        {initials}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant='body2'
          noWrap
          sx={{ lineHeight: 1.2, fontWeight: 600 }}
        >
          {fullName}
        </Typography>
        {showRole && (
          <Typography variant='caption' color='text.secondary' noWrap>
            {roleText}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChipAcount;
