import { v4 as uuidv4 } from "uuid";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateProductInput,
  GetProductParamsInput,
  ProductType,
} from "./product.schema";

export const createProductHandler = async (
  request: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply
) => {
  // 登録時に生成する項目を生成
  const id = uuidv4();
  const createdAt = new Date();
  const updatedAt = new Date();

  // 実際はここで登録処理を行う
  console.log("Product created.");

  reply.code(201).send({
    id,
    title: request.body.title,
    price: request.body.price,
    content: request.body.content,
    type: request.body.type,
    salesStartsAt: request.body.salesStartsAt,
    salesEndsAt: request.body.salesEndsAt,
    createdAt,
    updatedAt,
  });
};

export const getProductHandler = async (
  request: FastifyRequest<{ Params: GetProductParamsInput }>,
  reply: FastifyReply
) => {
  const id = request.params.id;

  // リポジトリからの取得処理を行う
  console.log(`Fetching product( ${id} )...`);

  reply.code(200).send({
    id,
    title: "super product",
    price: 1000,
    content: "some content",
    type: ProductType.game,
    salesStartsAt: new Date(),
    salesEndsAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};
