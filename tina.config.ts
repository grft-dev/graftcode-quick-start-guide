import { defineConfig } from "tinacms";

export default defineConfig({
  schema: {
    collections: [
      {
        name: "docs",
        label: "Documentation",
        path: ".",
        format: "md",
        match: {
          include: "*.md",
        },
        fields: [
          {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true,
          },
          {
            type: "number",
            label: "Order",
            name: "order",
            required: true,
          },
          {
            type: "string",
            label: "Description",
            name: "description",
            required: true,
          },
          {
            type: "rich-text",
            label: "Body",
            name: "body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
