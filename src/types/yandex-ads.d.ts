
interface Window {
  yaContextCb?: Array<() => void>;
  Ya?: {
    Context?: {
      AdvManager?: {
        render: (params: {
          blockId: string;
          type: string;
          platform: string;
          renderTo?: string;
        }) => void;
      };
    };
  };
}
