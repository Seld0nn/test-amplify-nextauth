'use client'

import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './amplifyconfiguration';

Amplify.configure(amplifyConfig, { ssr: true });


export default function ConfigureAmplifyClientSide() {
    return null;
}