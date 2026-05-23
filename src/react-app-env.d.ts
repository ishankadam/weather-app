/// <reference types="react-scripts" />
/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_KEY: string;
    readonly REACT_APP_API_URL: string;
  }
}
