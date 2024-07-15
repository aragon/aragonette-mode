import Arweave from "arweave";

// for local: export const ArweaveService = Arweave.init({});
export const ArweaveService = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});
