import type { JWT } from 'next-auth/jwt';
import type {
  DEFAULT_USER,
  USER_TABLE_PARTITION_ID,
} from './constants';

type RootUserProps = typeof DEFAULT_USER;
export type UserProps<K extends keyof RootUserProps = keyof RootUserProps> =
  Partial<{
    [P in K]: RootUserProps[P];
  }>;
export type UserWithEmailProps = Partial<RootUserProps> & {
  [USER_TABLE_PARTITION_ID]: string;
};

export type UserToken = Partial<Omit<JWT, 'email'>> & {
  email: string;
};