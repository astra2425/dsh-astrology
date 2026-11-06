/** Build a Node package entry and a browser module-loader client artifact. */
export default [
  {
    entry: ['src/index.ts'],
    format: 'esm',
    platform: 'node',
    target: 'es2024',
    outDir: 'lib',
    clean: true,
    deps: { neverBundle: /^@deepseek-ai\// },
  },
  {
    name: 'dsh-plugin-astrology/client',
    entry: { client: 'src/client/index.ts' },
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    outDir: 'lib',
    dts: false,
    clean: false,
    deps: { neverBundle: /^(?:@deepseek-ai\/|react(?:\/|$))/ },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: 'window.__ModuleLoader__.load({ id: "@dsh-external/dsh-plugin-astrology", factory: (require) => { var module = { exports: {} }; var exports = module.exports;',
      footer: 'return exports; } });',
    },
  },
]
