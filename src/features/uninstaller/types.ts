// types.ts
export type AppInfo = {
    name: string;
    path: string;
  };
  
  export type RelatedFile = {
    path: string;
    type: "file" | "directory";
    size: number;
  };