import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

export default function ApiReference() {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/docs/json`;
  return (
    <ApiReferenceReact
      configuration={{
        url,
        theme: 'alternate',
        customCss: `.scalar-app .h-dvh{height: calc(100dvh - 58px); top: 58px}`,
        defaultHttpClient: {
          targetKey: 'node',
          clientKey: 'fetch',
        },
      }}
    />
  );
}
