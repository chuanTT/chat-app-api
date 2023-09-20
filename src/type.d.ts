declare namespace Express {
  interface Request {
    getUrl: () => string
    getUrlPublic: () => string
    getDirRoot: (key?: string) => string
    successOke: (obj: { msg: string; data?: any }) => any
    errorFuc: (obj: { msg: string; data?: any; code?: number }) => any
    data: any
    token?: string
    BASE_URL?: string
  }
}

declare namespace NodeJS {
  export interface Global {
    socketServer: any
  }
}

declare const global: NodeJS.Global & typeof globalThis
