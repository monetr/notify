import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ActionSnackbar } from '../fixtures/ActionSnackbar';
import { AnchorMatrixSnackbar } from '../fixtures/AnchorMatrixSnackbar';
import { BasicSnackbar } from '../fixtures/BasicSnackbar';
import { BlurListenerSnackbar } from '../fixtures/BlurListenerSnackbar';
import { DragSnackbar } from '../fixtures/DragSnackbar';
import { HoverPauseSnackbar } from '../fixtures/HoverPauseSnackbar';
import { IconVariantSnackbar } from '../fixtures/IconVariantSnackbar';
import { MaxStackSnackbar } from '../fixtures/MaxStackSnackbar';
import { OutsideProviderSnackbar } from '../fixtures/OutsideProviderSnackbar';
import { PersistSnackbar } from '../fixtures/PersistSnackbar';
import { PerToastAnchorSnackbar } from '../fixtures/PerToastAnchorSnackbar';
import { PrefetchSnackbar } from '../fixtures/PrefetchSnackbar';
import { VariantsSnackbar } from '../fixtures/VariantsSnackbar';

import '../fixtures/styles.css';

type Fixture = { label: string; Component: () => JSX.Element };

const fixtures: Record<string, Fixture> = {
  basic: { label: 'Basic', Component: () => <BasicSnackbar /> },
  variants: { label: 'Variants', Component: () => <VariantsSnackbar /> },
  'icon-variant': { label: 'Icon variant', Component: () => <IconVariantSnackbar /> },
  persist: { label: 'Persist', Component: () => <PersistSnackbar /> },
  action: { label: 'Action button', Component: () => <ActionSnackbar /> },
  'hover-pause': { label: 'Hover pause', Component: () => <HoverPauseSnackbar /> },
  'max-stack': { label: 'Max stack', Component: () => <MaxStackSnackbar /> },
  'blur-on': { label: 'Blur listener (default on)', Component: () => <BlurListenerSnackbar /> },
  'blur-off': { label: 'Blur listener disabled', Component: () => <BlurListenerSnackbar disableWindowBlurListener /> },
  anchors: { label: 'Anchor matrix', Component: () => <AnchorMatrixSnackbar /> },
  'per-toast-anchor': { label: 'Per-toast anchor', Component: () => <PerToastAnchorSnackbar /> },
  'drag-bottom-center': {
    label: 'Drag (bottom-center)',
    Component: () => <DragSnackbar anchor={{ vertical: 'bottom', horizontal: 'center' }} />,
  },
  'drag-bottom-left': {
    label: 'Drag (bottom-left)',
    Component: () => <DragSnackbar anchor={{ vertical: 'bottom', horizontal: 'left' }} />,
  },
  'drag-bottom-right': {
    label: 'Drag (bottom-right)',
    Component: () => <DragSnackbar anchor={{ vertical: 'bottom', horizontal: 'right' }} />,
  },
  'drag-top-center': {
    label: 'Drag (top-center)',
    Component: () => <DragSnackbar anchor={{ vertical: 'top', horizontal: 'center' }} />,
  },
  'drag-top-left': {
    label: 'Drag (top-left)',
    Component: () => <DragSnackbar anchor={{ vertical: 'top', horizontal: 'left' }} />,
  },
  'drag-top-right': {
    label: 'Drag (top-right)',
    Component: () => <DragSnackbar anchor={{ vertical: 'top', horizontal: 'right' }} />,
  },
  'prefetch-mount': { label: 'Prefetch (mount)', Component: () => <PrefetchSnackbar prefetch='mount' /> },
  'prefetch-never': { label: 'Prefetch (never)', Component: () => <PrefetchSnackbar prefetch='never' /> },
  'outside-provider': { label: 'Outside provider', Component: () => <OutsideProviderSnackbar /> },
};

function Index() {
  return (
    <div style={{ padding: 32, maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h1 style={{ marginBottom: 8 }}>Notify fixtures</h1>
      <p style={{ color: '#888', marginTop: 0 }}>Click a fixture; edit any file under tests/ for hot reload.</p>
      {Object.entries(fixtures).map(([key, { label }]) => (
        <a
          href={`#${key}`}
          key={key}
          style={{
            padding: '12px 16px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          {label}
        </a>
      ))}
    </div>
  );
}

function BackLink() {
  return (
    <button
      onClick={() => {
        window.location.hash = '';
      }}
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: 99999,
        background: '#000',
        color: '#fff',
        padding: '4px 10px',
        border: 0,
        borderRadius: 4,
        fontSize: 12,
        cursor: 'pointer',
      }}
      type='button'
    >
      &lt;- back
    </button>
  );
}

function App() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash.slice(1));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (!hash) {
    return <Index />;
  }
  const fixture = fixtures[hash];
  if (!fixture) {
    return <Index />;
  }
  const { Component } = fixture;
  return (
    <>
      <BackLink />
      <Component />
    </>
  );
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('No #root element');
}
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
