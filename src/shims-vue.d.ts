/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'epic-spinners/dist/es/index.js' {
  import type { DefineComponent } from 'vue'
  export const HollowDotsSpinner: DefineComponent<{}, {}, any>
}
