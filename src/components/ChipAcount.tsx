import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { useStore } from '../store/Store';

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

  // Resolved override data from props (id or explicit name/role/avatar)
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
    let cancelled = false;

    async function resolveById(id: string) {
      try {
        const users: Array<{
          id?: number | string;
          firstName?: string;
          lastName?: string;
          email?: string;
          rol?: string | number;
        }> = (await import('../data/users.json')).default as any;
        const found = users.find((u) => String(u.id) === String(id));
        if (!found) return setOverride(undefined);
        const first = (found.firstName || '').trim();
        const last = (found.lastName || '').trim();
        const fullName = [first, last].filter(Boolean).join(' ') || found.email;
        const initials =
          `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase().slice(0, 2) ||
          (fullName?.[0]?.toUpperCase() ?? '?');
        const roleText =
          typeof found.rol !== 'undefined' ? `Rol ${String(found.rol)}` : '';
        if (!cancelled)
          setOverride({ fullName, roleText, initials, avatarUrl: undefined });
      } catch {
        if (!cancelled) setOverride(undefined);
      }
    }

    // Priority 1: idAcount
    if (idAcount) {
      resolveById(idAcount);
      return () => {
        cancelled = true;
      };
    }

    // Priority 2: explicit name/role/avatar
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
      // No overrides provided
      setOverride(undefined);
    }

    return () => {
      cancelled = true;
    };
  }, [idAcount, nameAcount, roleAcount, avatarAcount]);

  const { initials, fullName, roleText, avatarUrl } = useMemo(() => {
    // Priority: override -> store user -> undefined labels
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
      const roleText =
        (storeUser?.Role && String(storeUser?.Role)) ||
        (typeof storeUser?.rol !== 'undefined'
          ? `Rol ${storeUser?.rol}`
          : 'Sin rol');
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
