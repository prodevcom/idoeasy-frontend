import type { User } from '@entech/contracts';

import type { StatusResponse } from '@/shared/api';

export interface UserResponse {
  data: User;
  status: StatusResponse;
}
