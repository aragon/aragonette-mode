import { uploadToPinata } from "@/utils/ipfs";
import { useMutation } from "@tanstack/react-query";

export function usePinJSONtoIPFS() {
  return useMutation<string, Error, any>({
    mutationFn: async (content: any) => {
      if (!content) {
        throw new Error("Content is required for IPFS upload.");
      }
      try {
        return await uploadToPinata(JSON.stringify(content));
      } catch (error) {
        console.error("Failed to upload to IPFS", error);
        throw error;
      }
    },
    retry: 3,
  });
}
