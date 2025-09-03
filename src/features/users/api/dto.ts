import type { User } from '@idoeasy/contracts';

import type { StatusResponse } from '@/shared/api';

export interface UserResponse {
  data: User;
  status: StatusResponse;
}
