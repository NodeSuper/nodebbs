
import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

const PolicySection = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 border-l-4 border-primary pl-4">
      {title}
    </h2>
    <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
      {children}
    </div>
  </section>
);

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-card text-card-foreground py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">隐私政策</h1>
          <p className="mt-4 text-lg text-muted-foreground">我们承诺保护您的个人信息和隐私安全。</p>
          <p className="mt-2 text-sm text-muted-foreground/80">最后更新日期：2025年10月30日</p>
        </div>

        {/* Summary Box */}
        <div className="bg-background rounded-lg p-6 mb-12 border">
            <h3 className="text-xl font-bold flex items-center text-foreground"><ShieldCheck className="w-6 h-6 mr-2 text-success"/>隐私承诺摘要</h3>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                <li>我们仅收集运营所必需的信息，如您的邮箱和用户名。</li>
                <li>我们绝不与第三方分享或出售您的个人数据用于广告目的。</li>
                <li>您对自己发布的内容拥有完全的所有权和控制权。</li>
                <li>我们采用强加密措施保护您的数据安全。</li>
            </ul>
        </div>

        {/* Policy Content */}
        <PolicySection title="我们收集的信息">
          <p>为了提供和改进服务，我们会收集以下类型的信息：</p>
          <ul>
            <li><strong>账户信息：</strong> 您在注册时提供的用户名、电子邮件地址和加密后的密码。我们不会存储明文密码。</li>
            <li><strong>用户内容：</strong> 您在社区中自愿发布的任何文本、图片、链接或其他材料。</li>
            <li><strong>技术与使用数据：</strong> 我们会自动收集一些技术信息，例如您的 IP 地址、浏览器类型、操作系统、访问时间和引荐来源网址。这些信息用于分析趋势、管理网站和保障安全。</li>
            <li><strong>Cookies：</strong> 我们使用必要的 Cookies 来维持您的登录状态和偏好设置。我们不会使用 Cookies 追踪您的跨网站行为。</li>
          </ul>
        </PolicySection>

        <PolicySection title="信息的使用方式">
          <p>您的信息将用于以下核心目的：</p>
          <ul>
            <li><strong>服务提供与维护：</strong> 确保论坛的正常运行，例如用户认证、内容展示和消息通知。</li>
            <li><strong>安全保障：</strong> 保护我们的服务和用户免受欺诈、滥用和安全威胁。</li>
            <li><strong>沟通与支持：</strong> 回应您的问题和请求，并向您发送重要的服务相关通知。</li>
            <li><strong>服务改进：</strong> 通过分析匿名化和聚合后的数据，来了解用户如何使用我们的服务，从而进行改进。</li>
          </ul>
        </PolicySection>

        <PolicySection title="信息的共享与披露">
          <p>我们严格限制对您个人信息的共享：</p>
          <ul>
            <li><strong>法律要求：</strong> 如果法律、法规或法律程序要求，我们可能会在必要范围内披露您的信息。</li>
            <li><strong>服务提供商：</strong> 我们可能会与可信的第三方服务提供商（如云托管、邮件发送服务）共享运行服务所必需的信息。这些提供商有合同义务保护您的数据，并禁止将其用于其他目的。</li>
            <li><strong>业务转让：</strong> 在公司合并、收购或资产出售的情况下，用户信息可能会作为转移资产的一部分。我们会通过显著通知告知您。</li>
          </ul>
          <p>除上述情况外，我们不会与任何第三方共享您的个人身份信息。</p>
        </PolicySection>

        <PolicySection title="您的权利与选择">
          <p>您对自己的数据拥有控制权：</p>
          <ul>
            <li><strong>访问与更正：</strong> 您可以随时在您的个人资料设置中访问和更新您的账户信息。</li>
            <li><strong>数据删除：</strong> 您可以删除您发布的内容。如果您希望删除整个账户，请联系我们，我们将在验证您的身份后处理您的请求。</li>
            <li><strong>退出通信：</strong> 您可以随时通过邮件中的链接退订非必要的营销通信（如果有）。</li>
          </ul>
        </PolicySection>

        <PolicySection title="联系我们">
          <p>如果您对本隐私政策有任何疑问、意见或疑虑，请随时通过电子邮件与我们联系：<a href="mailto:privacy@nodebbs.com" className="text-primary hover:underline">privacy@nodebbs.com</a>。</p>
        </PolicySection>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
