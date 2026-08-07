import base from '@snacks/eslint-config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default [...base, ...nextVitals, ...nextTs];
