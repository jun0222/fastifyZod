import { MyJsonSchema } from "fastify-zod";

export const bindExamples = (
  schemas: MyJsonSchema[],
  examples: { [id: string]: object }
) => {
  if (!schemas || schemas.length === 0) return;

  const properties = schemas[0].properties;

  for (const $id in properties) {
    const property = properties[$id];
    const example = examples[`${$id}Example`];

    property.example = example;
  }
};
