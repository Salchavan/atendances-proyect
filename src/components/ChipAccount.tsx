import React, { useMemo } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/Store';
import { getStaff } from '../api/client';

type Props = {
  size?: number; // avatar size in px
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
  const staffQuery = useQuery({
    queryKey: ['chip-account-staff', idAcount],
    queryFn: async () => {
      if (!idAcount) return null;
      const response = await getStaff({ q: String(idAcount) });
      return response;
    },
    enabled: Boolean(idAcount),
    staleTime: 60 * 1000,
  });

  const manualOverride = useMemo(() => {
    if (!nameAcount && !roleAcount && !avatarAcount) return null;
    const trimmedName = (nameAcount || '').trim();
    const initials =
      trimmedName
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase() || '?';
    return {
      initials,
      fullName: trimmedName || 'No definido',
      roleText: roleAcount || 'No definido',
      avatarUrl: avatarAcount || undefined,
    };
  }, [nameAcount, roleAcount, avatarAcount]);

  const staffOverride = useMemo(() => {
    if (!idAcount || !staffQuery.data) return null;
    const payload: any = staffQuery.data;
    const collection = Array.isArray(payload?.staff)
      ? payload.staff
      : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : [];
    const match = collection.find((entry: any) => {
      const candidateId = entry?.id ?? entry?.dni ?? entry?.staff_id;
      return String(candidateId) === String(idAcount);
    });
    if (!match) return null;
    const first = (match.first_name ?? match.firstName ?? '').trim();
    const last = (match.last_name ?? match.lastName ?? '').trim();
    const fullName =
      [first, last].filter(Boolean).join(' ') ||
      match.email ||
      `ID ${idAcount}`;
    const initials =
      `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() ||
      (fullName?.[0]?.toUpperCase() ?? '?');
    const roleText = String(match.role ?? match.rol ?? 'STAFF');
    return {
      initials,
      fullName,
      roleText,
      avatarUrl: match.avatar_url ?? undefined,
    };
  }, [idAcount, staffQuery.data]);

  const { initials, fullName, roleText, avatarUrl } = useMemo(() => {
    if (staffOverride) return staffOverride;

    if (manualOverride) return manualOverride;

    if (storeUser) {
      const first = (storeUser?.first_name || '').trim();
      const last = (storeUser?.last_name || '').trim();
      const resolvedInitials =
        `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() ||
        (storeUser?.username?.[0]?.toUpperCase() ?? '?');
      const resolvedFullName =
        [first, last].filter(Boolean).join(' ') ||
        storeUser?.username ||
        'Sin selección';
      const resolvedRole =
        (storeUser as any)?.role ??
        (storeUser as any)?.rol ??
        (storeUser as any)?.Role ??
        'STUDENT';
      return {
        initials: resolvedInitials,
        fullName: resolvedFullName,
        roleText: String(resolvedRole),
        avatarUrl: undefined,
      };
    }

    if (staffQuery.isLoading && idAcount) {
      return {
        initials: '?',
        fullName: 'Buscando usuario...',
        roleText: '',
        avatarUrl: undefined,
      };
    }

    return {
      initials: '?',
      fullName: 'No definido',
      roleText: 'No definido',
      avatarUrl: undefined,
    };
  }, [
    staffOverride,
    manualOverride,
    storeUser,
    staffQuery.isLoading,
    idAcount,
  ]);

  return (
    <Box
      className={className}
      sx={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: 1 }}
      title={
        staffOverride || manualOverride || storeUser
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
