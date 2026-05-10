# @monetr/notify

A React notification/toast package with a notistack-compatible API. Drop-in for the subset of notistack used inside
`@monetr/monetr` (`SnackbarProvider`, `useSnackbar`, `enqueueSnackbar`).

The visual design and stacking/drag interactions are derived from a Claude artifact (stacked toasts, hover-to-expand,
hover-pause, pointer drag-to-dismiss, progress rail). The build/test/release tooling is inherited from
[`@monetr/vaul`](https://github.com/monetr/vaul).

## Why

- Tiny eager bundle, lazy-loaded renderer. The hook + provider are ~2 KB gz; the toast UI + animations live in a
  code-split chunk that downloads on first `enqueueSnackbar`.
- Direction-aware drag-to-dismiss across all six anchor positions.
- `iconVariant` slot for replacing the type pip with a real icon.
- Theming via CSS custom properties, no runtime style props.

## Install

```sh
pnpm add @monetr/notify
```

## Usage

```tsx
import { SnackbarProvider, useSnackbar } from '@monetr/notify';

function Root() {
  return (
    <SnackbarProvider maxSnack={5} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <App />
    </SnackbarProvider>
  );
}

function SaveButton() {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <button
      onClick={() =>
        enqueueSnackbar('Saved', { variant: 'success', disableWindowBlurListener: true })
      }
    >
      Save
    </button>
  );
}
```

## License

[EPL-2.0](./LICENSE).
