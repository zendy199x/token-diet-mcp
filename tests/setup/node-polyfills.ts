// Node 18 does not expose global File by default; some transitive deps (e.g. undici)
// access it during module initialization.
if (globalThis.File === undefined) {
  class File extends Blob {
    name: string;
    lastModified: number;

    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
      super(bits, options);
      this.name = name;
      this.lastModified = options?.lastModified ?? Date.now();
    }
  }

  globalThis.File = File as unknown as typeof globalThis.File;
}
