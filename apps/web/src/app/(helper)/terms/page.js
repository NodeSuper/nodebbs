
import React from 'react';
import { FileText, Shield, UserCheck, ThumbsDown, Globe } from 'lucide-react';

const Section = ({ title, icon, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5 flex items-center">
      {icon}
      <span className="border-b-2 border-primary pb-1">{title}</span>
    </h2>
    <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
      {children}
    </div>
  </section>
);

const TermsOfServicePage = () => {
  return (
    <div className="bg-card text-card-foreground py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">服务条款</h1>
          <p className="mt-4 text-lg text-muted-foreground">欢迎来到 NodeBBS！请在使用前仔细阅读以下条款。</p>
          <p className="mt-2 text-sm text-muted-foreground/80">最后更新日期：2025年10月30日</p>
        </div>

        <Section title="1. 接受条款" icon={<UserCheck className="w-8 h-8 mr-3 text-primary" />}>
          <p>通过访问或使用 NodeBBS 网站及其提供的任何服务（统称为“服务”），即表示您同意并接受本服务条款的约束。如果您不同意这些条款，您将无权使用我们的服务。</p>
        </Section>

        <Section title="2. 用户责任与行为准则" icon={<Shield className="w-8 h-8 mr-3 text-primary" />}>
          <p>您对您在我们服务上发布的所有内容（包括帖子、评论、图片等，“用户内容”）负有全部责任。您同意，您不会利用本服务从事以下活动：</p>
          <ul>
            <li>发布任何非法的、诽谤的、骚扰的、辱骂的、欺诈的、淫秽或其他令人反感的内容。</li>
            <li>侵犯他人的知识产权，包括但不限于版权、商标权和专利权。</li>
            <li>发布未经请求的商业广告（“垃圾邮件”）、连锁信或任何形式的诱导性内容。</li>
            <li>冒充任何个人或实体，或以其他方式歪曲您与某人或某实体的关系。</li>
            <li>传播病毒、蠕虫、木马或任何其他旨在破坏、中断或限制计算机软硬件功能的恶意代码。</li>
          </ul>
          <p>我们保留审查、拒绝、删除或移动任何我们单方面认为违反本条款或社区精神的内容的权利，但我们没有义务必须这样做。</p>
        </Section>

        <Section title="3. 内容所有权和许可" icon={<Globe className="w-8 h-8 mr-3 text-primary" />}>
          <p>您保留您所创建和发布的用户内容的所有权。但是，通过在 NodeBBS 上发布内容，您授予我们一项全球性的、非独家的、免版税的、可再许可的许可，允许我们托管、使用、分发、运行、复制、公开展示、翻译和创作您的内容的衍生作品，仅用于运营、开发和改进我们的服务。</p>
        </Section>

        <Section title="4. 服务终止" icon={<ThumbsDown className="w-8 h-8 mr-3 text-primary" />}>
          <p>如果您严重或屡次违反本条款，我们保留随时暂停或永久终止您访问我们服务的权利，恕不另行通知。您也可以随时通过联系我们来请求删除您的账户。</p>
        </Section>

        <Section title="5. 免责声明" icon={<FileText className="w-8 h-8 mr-3 text-primary" />}>
          <p>本服务按“现状”和“现有”基础提供。NodeBBS 不作任何明示或暗示的保证，包括但不限于对适销性、特定用途适用性和非侵权性的暗示保证。我们不保证服务将是安全的、不间断的或无错误的。</p>
        </Section>

        <Section title="6. 联系我们" icon={<UserCheck className="w-8 h-8 mr-3 text-primary" />}>
          <p>如果您对这些服务条款有任何疑问，请通过 <a href="mailto:contact@nodebbs.com" className="text-primary hover:underline">contact@nodebbs.com</a> 与我们联系。</p>
        </Section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
