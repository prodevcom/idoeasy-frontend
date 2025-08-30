import { Tile } from '@carbon/react';

import type { AuthUser } from '@entech/contracts';

import { ProfileDetailsAuditDataTable } from './DataTables/AuditDataTable';

type ProfileDetailsProps = {
  currentUser: AuthUser;
};

export function ProfileDetails(_: ProfileDetailsProps) {
  return (
    <Tile className="cds--details-page">
      <ProfileDetailsAuditDataTable />
    </Tile>
  );
}
