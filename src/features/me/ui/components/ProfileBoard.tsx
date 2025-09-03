import { Button, Stack, Tile } from '@carbon/react';
import { useTranslations } from 'next-intl';

import type { AuthUser } from '@idoeasy/contracts';

import { UserAvatarForm } from '@/shared/components/Forms';
import { useModalContext } from '@/shared/contexts/ModalContext';

import { ChangePasswordModal } from './Modals/ChangePasswordModal';
import { PreferencesModal } from './Modals/PreferencesModal';
import { UpdateUserInfosModal } from './Modals/UpdateUserInfosModal';

type ProfileUserBoardProps = {
  currentUser?: AuthUser;
};

export function ProfileBoard({ currentUser }: ProfileUserBoardProps) {
  const t = useTranslations('profile');

  const { openModal, closeModal } = useModalContext();

  return (
    <>
      <Stack className="cds--profile-page">
        <Tile className="cds--header-tile">
          <Stack
            gap={4}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: '1.5rem',
              alignItems: 'center',
            }}
          >
            <UserAvatarForm />
            {/* <Link href="#" onClick={() => {}}>
              {t('actions.updateAvatar')}
            </Link> */}
          </Stack>

          <p className="cds--type-heading-03">{currentUser?.name}</p>
          <p className="cds--type-heading-02">{currentUser?.role?.name}</p>
        </Tile>

        <Tile style={{ padding: '2rem' }}>
          <Stack gap={4}>
            <h5 className="cds--type-heading-02">{t('actions.title')}</h5>
            <Button
              kind="primary"
              style={{ flex: 1, width: '100%' }}
              onClick={() =>
                openModal(
                  <UpdateUserInfosModal
                    currentUser={currentUser!}
                    onClosed={closeModal}
                    key="updateUserInfosModal"
                  />,
                )
              }
            >
              {t('actions.updateUserDetails')}
            </Button>
            <Button
              kind="secondary"
              style={{ flex: 1, width: '100%' }}
              onClick={() => openModal(<ChangePasswordModal onClosed={closeModal} />)}
            >
              {t('actions.changePassword')}
            </Button>
            <Button
              kind="tertiary"
              style={{ flex: 1, width: '100%' }}
              onClick={() => openModal(<PreferencesModal onClosed={closeModal} />)}
            >
              {t('actions.updatePreferences')}
            </Button>
          </Stack>
        </Tile>
      </Stack>
    </>
  );
}
