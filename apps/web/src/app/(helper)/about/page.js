
import React from 'react';
import { Users, Target, Eye, GitCommit, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <div className="text-center py-16 md:py-24 px-4 bg-card text-card-foreground shadow-sm">
        <div className="max-w-4xl mx-auto">
          <Target className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">关于 NodeBBS 社区</h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            一个为开发者、创造者和技术爱好者打造的，充满活力、开放、互助的家园。
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold tracking-tight mb-4">我们的故事</h2>
            <p className="text-lg text-muted-foreground mb-4">
              NodeBBS 诞生于一个简单的想法：创建一个没有干扰、专注于深度技术交流的平台。创始团队由一群对技术充满热情的资深开发者组成，我们厌倦了在社交媒体的喧嚣中寻找有价值的信息。
            </p>
            <p className="text-lg text-muted-foreground">
              我们梦想着一个地方，无论你是刚入门的新手还是行业内的专家，都能在这里找到归属感，自由地分享知识、碰撞思想，并与志同道合的人一起成长。
            </p>
          </div>
          <div className="order-1 md:order-2 text-center">
            <GitCommit className="mx-auto h-48 w-48 text-muted" />
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="bg-card text-card-foreground py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">我们的核心价值观</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-6">
              <Eye className="mx-auto h-12 w-12 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">专注与深度</h3>
              <p className="mt-2 text-muted-foreground">
                我们鼓励有深度、经过思考的讨论，而非肤浅的言论。质量永远优先于数量。
              </p>
            </div>
            <div className="p-6">
              <Users className="mx-auto h-12 w-12 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">开放与包容</h3>
              <p className="mt-2 text-muted-foreground">
                我们欢迎来自不同背景和技术水平的每一个人。尊重和友善是社区的基石。
              </p>
            </div>
            <div className="p-6">
              <Heart className="mx-auto h-12 w-12 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">社区驱动</h3>
              <p className="mt-2 text-muted-foreground">
                社区的未来由成员共同塑造。我们倾听每一个声音，并鼓励社区共建。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Join Us Section */}
      <div className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold">成为我们的一员</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            无论您是想提出一个问题，分享一个项目，还是帮助他人，这里都有您的位置。立即加入，与我们一同构建下一个伟大的技术社区。
          </p>
          <div className="mt-8">
            <a
              href="/register"
              className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300"
            >
              立即注册
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
