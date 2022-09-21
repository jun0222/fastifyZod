import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";
import { bindExamples } from "../../utils/openApiSpec";

// 参考：https://qiita.com/YudaiTsukamoto/items/37ee62d3a7ff6e2d52f9
const User = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof User>;

const Post = z.object({
  id: z.number(),
  title: z.string(),
  user: User,
});

type Post = z.infer<typeof Post>;

const validJson = JSON.stringify({
  id: 1,
  title: "title",
  user: {
    id: 1,
    name: "name",
    email: "email@email.com",
  },
});

const invalidJson = JSON.stringify({
  id: 1,
  title: "title",
  user: {
    id: 1,
    // "name": "name", name should be required
    email: "email@email.com",
  },
});

try {
  const post: Post = Post.parse(JSON.parse('{"id":true, "title":42}'));
  // ↑を実行すると以下のメッセージがcatchのeに入っている
  // issues: [
  //   {
  //     code: 'invalid_type',
  //     expected: 'number',
  //     received: 'boolean',
  //     path: [Array],
  //     message: 'Expected number, received boolean'
  //   },
  //   {
  //     code: 'invalid_type',
  //     expected: 'string',
  //     received: 'number',
  //     path: [Array],
  //     message: 'Expected string, received number'
  //   },
  //   {
  //     code: 'invalid_type',
  //     expected: 'object',
  //     received: 'undefined',
  //     path: [Array],
  //     message: 'Required'
  //   }
  // ],
  const validPost: Post = Post.parse(JSON.parse(validJson));
  console.log(validPost);
  // ↑を実行すると以下のメッセージが入っている（console.logで出力したもの）バリデーションOKなのでcatchのeには何も入っていない。
  // {
  //   id: 1,
  //   title: 'title',
  //   user: { id: 1, name: 'name', email: 'email@email.com' }
  // }
  const invalidPost: Post = Post.parse(JSON.parse(invalidJson));
  // ↑を実行すると以下のメッセージがcatchのeに入っている
  // issues: [
  //   {
  //     code: 'invalid_type',
  //     expected: 'string',
  //     received: 'undefined',
  //     path: [Array],
  //     message: 'Required'
  //   }
  // ],
} catch (e) {
  console.log(e);
}

export const ProductType = {
  book: "book",
  movie: "movie",
  game: "game",
} as const;

const productInput = {
  title: z.string().min(3).max(50).describe("製品登録名"),
  price: z.number().max(900000).default(100).describe("価格"),
  content: z.nullable(z.string()).optional().describe("内容"),
  type: z.nativeEnum(ProductType).describe("製品種別"),
  salesStartsAt: z.date().describe("販売開始日"),
  salesEndsAt: z.date().describe("販売終了日"),
};

const productGenerated = {
  id: z.string().uuid().describe("製品ID"),
  createdAt: z.date().describe("作成日"),
  updatedAt: z.date().describe("更新日"),
};

// Zodスキーマを定義します
const createProductBodySchema = z.object({
  ...productInput,
});

const productResponseSchema = z
  .object({
    ...productInput,
    ...productGenerated,
  })
  .describe("Product response schema");

const getProductParamsSchema = z.object({
  id: productGenerated.id,
});
const getProductQuerySchema = z.object({
  title: z.optional(productInput.title),
  type: z.optional(z.array(productInput.type)),
});

// Zodスキーマから型を生成します
export type CreateProductInput = z.infer<typeof createProductBodySchema>;
export type ProductOutput = z.infer<typeof productResponseSchema>;
export type GetProductParamsInput = z.infer<typeof getProductParamsSchema>;
export type GetProductQueryInput = z.infer<typeof getProductQuerySchema>;

// Exampleを定義します
const exampleProduct: ProductOutput = {
  title: "何らかの製品A",
  price: 10_000,
  content: "素晴らしい製品です",
  type: "game",
  salesStartsAt: new Date("2022-01-01"),
  salesEndsAt: new Date("2022-12-31"),
  id: "c165ad23-2ac3-4d80-80d7-d7b6c3e526bd",
  createdAt: new Date("2022-06-01"),
  updatedAt: new Date("2022-06-01"),
};
const createProductBodySchemaExample: CreateProductInput = {
  title: exampleProduct.title,
  price: exampleProduct.price,
  content: exampleProduct.content,
  type: exampleProduct.type,
  salesStartsAt: exampleProduct.salesStartsAt,
  salesEndsAt: exampleProduct.salesEndsAt,
};
const productResponseSchemaExample: ProductOutput = { ...exampleProduct };
const getProductParamsSchemaExample: GetProductParamsInput = {
  id: exampleProduct.id,
};
const getProductQuerySchemaExample: GetProductQueryInput = {
  title: exampleProduct.title,
  type: [exampleProduct.type],
};
const schemaExamples = {
  createProductBodySchemaExample,
  productResponseSchemaExample,
  getProductParamsSchemaExample,
  getProductQuerySchemaExample,
};

// Zodスキーマを元に、JSONスキーマを生成します
export const { schemas: productSchemas, $ref } = buildJsonSchemas(
  {
    createProductBodySchema,
    productResponseSchema,
    getProductParamsSchema,
    getProductQuerySchema,
  },

  {
    $id: "productSchemas",
  }
);

// 定義したExampleをJSONスキーマに紐付けます
bindExamples(productSchemas, schemaExamples);
