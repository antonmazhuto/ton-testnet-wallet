if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = require('buffer').Buffer;
}
export {};
