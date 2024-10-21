import axios from 'axios';
import type { SignUpInput, SignUpOutput } from 'aws-amplify/auth';
import type { AxiosRequestConfig } from 'axios';

export const createRequestConfig = <D = unknown>(
    path: string,
    data?: D,
    rest?: Partial<AxiosRequestConfig<D>>
  ): AxiosRequestConfig<D> => {
    return {
      method: rest?.method ?? 'POST',
      url: '/api' + path,
      headers: {
        'Content-Type': 'application/json',
      },
      data,
      ...rest,
    };
  };

const signUp = async (data: SignUpInput): Promise<SignUpOutput> => {
  return await axios
    .request(createRequestConfig('/auth/signUp', data))
    .then((res) => res.data as SignUpOutput);
};

export default signUp;