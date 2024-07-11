import { type IFetchParagraphPostIdQueryParams, type IFetchParagraphPostIdsQueryParams } from "./types";

export type ParagraphPostIdsQueryResponse = {
  data: {
    transactions: {
      pageInfo: {
        hasNextPage: boolean;
      };
      edges: {
        cursor: string;
        node: {
          id: string;
        };
      }[];
    };
  };
};

export const getParagraphPostIdsQuery = ({
  publicationSlug,
  limit = 100,
  cursor,
  categories = [],
}: IFetchParagraphPostIdsQueryParams) => `
query GetParagraphPosts {
  transactions(tags:[
     {
      name:"AppName",
      values:["Paragraph"],
    },
    {
      name:"PublicationSlug",
      values:["${publicationSlug}"]
    },
    ${categories.length > 0 ? `{ name: "Category", values: ${categories.map((c) => `"${c}"`)} },` : ""}
  ], sort: HEIGHT_DESC, ${cursor ? `after: "${cursor}"` : ""}, first: ${limit}) {
     pageInfo {
      hasNextPage
    }
    edges {
      cursor
      node {
        id
      }
    }
  }
}
`;

export type ParagraphPostIdBySlugQueryResponse = {
  data: {
    transactions: {
      edges: {
        node: {
          id: string;
        };
      }[];
    };
  };
};

export const getParagraphPostIdBySlugQuery = ({
  publicationSlug,
  postSlug,
  categories = [],
}: IFetchParagraphPostIdQueryParams) => `
query GetParagraphPosts {
  transactions(tags:[
    {
      name:"AppName",
      values:["Paragraph"],
    },
    {
      name:"PublicationSlug",
      values:["${publicationSlug}"]
    },
    {
      name:"PostSlug",
      values:["${postSlug}"],
    },
    ${categories.length > 0 ? `{ name: "Category", values: ${categories.map((c) => `"${c}"`)} },` : ""}
  ]) {
    edges {
      node {
        id
      }
    }
  }
}
`;
