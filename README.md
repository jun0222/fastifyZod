# 参考 URL

- [zod を使って JSON.parse したオブジェクトを validation して型安全にしたい](https://qiita.com/YudaiTsukamoto/items/37ee62d3a7ff6e2d52f9)
- [Fastify で作る API に Zod でスキーマバリデーションをかけながら型定義と実用レベルの OpenAPI 仕様を自動生成する](https://dev.classmethod.jp/articles/fastify-zod-openapi/)
- [Zod で真の TypeScript first を手にする](https://zenn.dev/ynakamura/articles/65d58863563fbc)
- [TypeScript のゾッとする話 ~ Zod の紹介 ~](https://zenn.dev/uttk/articles/bd264fa884e026)
- [zod を実際のプロジェクトで使う時にどうするか考えた](https://qiita.com/punkshiraishi/items/581680537e688bb9ada0)

# 概要

[ここ](https://qiita.com/YudaiTsukamoto/items/37ee62d3a7ff6e2d52f9)にある通り リクエストの json は any 型 なので、  
any 型を防ぎ不正な値を防ぐバリデーションする必要。

```ts
const hoge = {};
hoge.nonProperty;
// => undefined
```

とかも JavaScript の runtime では undefined が返ってくるだけなので、  
もし DB に not null がなかったら危険かも？？  
など特に JavaScript で入力値をしっかりバリデーションするのは難しい。

なので zod で runtime で型のチェックを走らせつつ、  
email 形式か？などよくあるバリデーションも一緒に行う。

# 実装の進め方

[zod を使って JSON.parse したオブジェクトを validation して型安全にしたい](https://qiita.com/YudaiTsukamoto/items/37ee62d3a7ff6e2d52f9) と以下実行サンプルを参考にし、  
重複管理にならない様になど気を付ける。

# 実行サンプル

## 型や値の実装

```ts
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
```

## バリデーション実行部分

```ts
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
```
