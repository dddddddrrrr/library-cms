import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "文学小说",
    description: "包括各类小说、散文、诗歌等文学作品",
    children: [
      { name: "当代小说", description: "现当代文学作品" },
      { name: "古典文学", description: "中国古典文学作品" },
      { name: "外国文学", description: "外国文学作品译本" },
      { name: "科幻小说", description: "科幻类小说作品" },
    ],
  },
  {
    name: "科技计算机",
    description: "计算机科学与技术相关书籍",
    children: [
      { name: "编程语言", description: "各类编程语言教程" },
      { name: "算法设计", description: "数据结构与算法" },
      { name: "人工智能", description: "AI与机器学习" },
    ],
  },
];

const books = [
  {
    title: "三体",
    author: "刘慈欣",
    isbn: "9787536692930",
    description: "科幻小说，描述人类文明与三体文明的首次接触。",
    cover: "https://img3.doubanio.com/view/subject/l/public/s2768378.jpg",
    price: 23.0,
    stock: 100,
    status: "AVAILABLE",
    targetCategory: "科幻小说",
    publisher: "重庆出版社",
    publishDate: new Date("2008-01-01"),
  },
  {
    title: "JavaScript高级程序设计",
    author: "Nicholas C. Zakas",
    isbn: "9787115275790",
    description: "JavaScript经典教程，深入理解JavaScript特性。",
    cover: "https://img9.doubanio.com/view/subject/l/public/s8958650.jpg",
    price: 99.0,
    stock: 50,
    status: "AVAILABLE",
    targetCategory: "编程语言",
    publisher: "人民邮电出版社",
    publishDate: new Date("2012-03-01"),
  },
  {
    title: "百年孤独",
    author: "加西亚·马尔克斯",
    isbn: "9787544253994",
    description: "魔幻现实主义文学代表作",
    cover: "https://img2.doubanio.com/view/subject/l/public/s6384944.jpg",
    price: 39.5,
    stock: 80,
    status: "AVAILABLE",
    targetCategory: "外国文学",
    publisher: "南海出版公司",
    publishDate: new Date("2011-06-01"),
  },
  {
    title: "算法导论",
    author: "科尔曼",
    isbn: "9787111407010",
    description: "计算机科学领域的经典教材",
    cover: "https://img1.doubanio.com/view/subject/l/public/s25648004.jpg",
    price: 128.0,
    stock: 30,
    status: "AVAILABLE",
    targetCategory: "算法设计",
    publisher: "机械工业出版社",
    publishDate: new Date("2013-01-01"),
  },
  {
    title: "深入理解计算机系统",
    author: "Randal E. Bryant",
    isbn: "9787111544937",
    description: "计算机系统底层原理解析",
    cover: "https://img9.doubanio.com/view/subject/l/public/s29195878.jpg",
    price: 139.0,
    stock: 40,
    status: "AVAILABLE",
    targetCategory: "编程语言",
    publisher: "机械工业出版社",
    publishDate: new Date("2016-05-01"),
  },
  {
    title: "红楼梦",
    author: "曹雪芹",
    isbn: "9787020002207",
    description: "中国古典文学巅峰之作",
    cover: "https://img1.doubanio.com/view/subject/l/public/s1070959.jpg",
    price: 59.7,
    stock: 150,
    status: "AVAILABLE",
    targetCategory: "古典文学",
    publisher: "人民文学出版社",
    publishDate: new Date("1996-12-01"),
  },
  {
    title: "机器学习实战",
    author: "Peter Harrington",
    isbn: "9787115317957",
    description: "机器学习入门经典教材",
    cover: "https://img9.doubanio.com/view/subject/l/public/s27814883.jpg",
    price: 69.0,
    stock: 60,
    status: "AVAILABLE",
    targetCategory: "人工智能",
    publisher: "人民邮电出版社",
    publishDate: new Date("2013-06-01"),
  },
  {
    title: "平凡的世界",
    author: "路遥",
    isbn: "9787530212004",
    description: "茅盾文学奖获奖作品",
    cover: "https://img3.doubanio.com/view/subject/l/public/s28114032.jpg",
    price: 64.0,
    stock: 90,
    status: "AVAILABLE",
    targetCategory: "当代小说",
    publisher: "北京十月文艺出版社",
    publishDate: new Date("2012-03-01"),
  },
  {
    title: "Python编程：从入门到实践",
    author: "Eric Matthes",
    isbn: "9787115428028",
    description: "Python入门佳作",
    cover: "https://img3.doubanio.com/view/subject/l/public/s29677478.jpg",
    price: 89.0,
    stock: 70,
    status: "AVAILABLE",
    targetCategory: "编程语言",
    publisher: "人民邮电出版社",
    publishDate: new Date("2016-07-01"),
  },
  {
    title: "活着",
    author: "余华",
    isbn: "9787506365437",
    description: "生命的苦难与伟大",
    cover: "https://img2.doubanio.com/view/subject/l/public/s29053580.jpg",
    price: 45.0,
    stock: 110,
    status: "AVAILABLE",
    targetCategory: "当代小说",
    publisher: "作家出版社",
    publishDate: new Date("2012-08-01"),
  },
  // 可以继续添加更多图书...
];

// 添加示例章节内容
const generateChapters = (bookId: string) => {
  const chapters = [
    {
      title: "第一章 序章",
      content: `这是第一章的内容。
      
在这个世界里，一切都显得那么神秘而有趣。阳光透过树叶的缝隙洒在地上，形成斑驳的光影。微风轻轻吹过，带来远方的气息。

这是一个关于探索和发现的故事，关于勇气和智慧的故事。每个人都在寻找属于自己的答案，而这个旅程才刚刚开始。

我们的主人公站在这个世界的边缘，准备开始一段不可思议的冒险。`,
      order: 1,
      wordCount: 150,
      isPreview: true,
    },
    {
      title: "第二章 启程",
      content: `这是第二章的内容。
      
故事从一个平凡的早晨开始。阳光明媚，鸟儿在枝头歌唱，一切都是那么的美好。但是谁也不知道，这个平凡的日子将会成为改变一切的开始。

主人公收拾好行囊，带着满心的期待和些许的忐忑，踏上了这段未知的旅程。路的尽头会有什么？没人知道。但正是这种未知，让人充满了向往。

在这个世界里，每一步都可能带来惊喜，每一个转角都可能遇见奇迹。`,
      order: 2,
      wordCount: 200,
      isPreview: true,
    },
    {
      title: "第三章 发现",
      content: `这是第三章的内容。
      
在经历了一系列的冒险之后，我们的主人公终于来到了一个神秘的地方。这里的一切都是那么的不同，仿佛进入了另一个世界。

古老的建筑矗立在眼前，诉说着悠久的历史。墙上的壁画描绘着神秘的图案，似乎在暗示着什么重要的信息。

但是真相究竟是什么？这些谜题又意味着什么？答案或许就藏在下一个转角。`,
      order: 3,
      wordCount: 180,
      isPreview: false,
    },
  ];

  return chapters.map((chapter) => ({
    ...chapter,
    bookId,
  }));
};

async function main() {
  console.log("开始导入数据...");

  // 清理现有数据（按照正确的顺序）
  await prisma.readingRecord.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.like.deleteMany();
  await prisma.view.deleteMany();
  await prisma.review.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();

  console.log("已清理现有数据");

  // 导入分类
  for (const category of categories) {
    const parentCategory = await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
      },
    });

    if (category.children) {
      for (const child of category.children) {
        await prisma.category.create({
          data: {
            name: child.name,
            description: child.description,
            parentId: parentCategory.id,
          },
        });
      }
    }
  }

  console.log("分类数据导入完成");

  // 导入图书和章节
  for (const book of books) {
    const { targetCategory, ...bookData } = book;
    const category = await prisma.category.findFirst({
      where: { name: targetCategory },
    });

    if (!category) {
      console.log(`未找到分类: ${targetCategory}`);
      continue;
    }

    // 创建图书
    const createdBook = await prisma.book.create({
      data: {
        ...bookData,
        categoryId: category.id,
        status: "AVAILABLE",
      },
    });

    // 为每本书创建章节
    const chapters = generateChapters(createdBook.id);
    for (const chapter of chapters) {
      await prisma.chapter.create({
        data: chapter,
      });
    }
  }

  console.log("图书和章节数据导入完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
