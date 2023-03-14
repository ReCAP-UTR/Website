import { Cite } from "@citation-js/core";
import { GatsbyNode } from "gatsby";
import { createFilePath } from "gatsby-source-filesystem";
require("@citation-js/plugin-bibtex");

export const createPages: GatsbyNode["createPages"] = async ({ actions }) => {
  const { createRedirect } = actions;

  // Always omit the trailing slash from the source URL, but include it in the target URL.
  const redirects = {
    "/2022-tmg-workshop": "/workshops/tmg-2022/",
    "/workshops/2022/tmg": "/workshops/tmg-2022/",
  };

  Object.entries(redirects).forEach(([fromPath, toPath]) => {
    createRedirect({
      fromPath,
      toPath,
      isPermanent: true,
    });
  });
};

export const onCreateNode: GatsbyNode["onCreateNode"] = async ({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
  getNode,
}) => {
  const { createNode, createParentChildLink, createNodeField } = actions;

  if (node.extension === `bib`) {
    const content = await loadNodeContent(node);
    const parsedContent = new Cite(content, {
      generateGraph: false,
      forceType: "@biblatex/text",
      maxChainLength: 100,
    }).data;

    parsedContent
      .map((entry) => {
        return {
          ...entry,
          id: createNodeId(`${node.id} ${entry.id} >>> Citation`),
          children: [],
          parent: node.id,
          internal: {
            contentDigest: createContentDigest(entry),
            type: `Citation`,
          },
        };
      })
      .forEach((data) => {
        createNode(data);
        createParentChildLink({ parent: node, child: data });
      });
  } else if (node.internal.type === "MarkdownRemark") {
    createNodeField({
      node,
      name: "slug",
      value: createFilePath({ node, getNode }),
    });
  }
};
