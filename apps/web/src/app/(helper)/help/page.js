
import React from 'react';
import { HelpCircle, BookUser, Edit, KeyRound, Shield, Mail } from 'lucide-react';

const FaqItem = ({ icon, question, answer }) => (
  <div className="bg-card text-card-foreground rounded-lg shadow-md p-6 transition-shadow duration-300 hover:shadow-lg">
    <div className="flex items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div className="ml-5">
        <h3 className="text-xl font-semibold">{question}</h3>
        <p className="mt-2 text-muted-foreground text-base leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  </div>
);

const HelpPage = () => {
  const faqs = [
    {
      question: '如何创建新主题？',
      answer: '要创建新主题，请登录后点击页面右上角的“创建主题”按钮。您需要选择一个合适的分类，填写引人注目的标题和详细内容，然后点击“发布”。',
      icon: <Edit className="w-6 h-6" />,
    },
    {
      question: '如何回复他人的主题？',
      answer: '在您想要回复的主题页面下方，您会看到一个富文本编辑器。在编辑器中输入您的见解或问题，然后点击“回复”按钮即可参与讨论。',
      icon: <BookUser className="w-6 h-6" />,
    },
    {
      question: '如何重置我的密码？',
      answer: '如果您忘记了密码，可以在登录页面点击“忘记密码？”链接。按照提示输入您的注册邮箱，系统会向您发送一封包含密码重置指令的邮件。',
      icon: <KeyRound className="w-6 h-6" />,
    },
    {
      question: '社区的基本准则是什么？',
      answer: '我们致力于维护一个友好、尊重和专业的交流环境。请确保您的言论具有建设性，避免人身攻击和发布垃圾广告。更多详情请参阅我们的 <a href="/terms" class="text-primary hover:underline">服务条款</a>。',
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  return (
    <div className="bg-background text-foreground py-12 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">帮助中心</h1>
          <p className="mt-4 text-lg text-muted-foreground">在这里找到常见问题的答案。</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <FaqItem key={index} icon={faq.icon} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center bg-card text-card-foreground p-8 rounded-lg shadow-md">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-2xl font-bold">没有找到您要的答案？</h2>
            <p className="mt-2 text-muted-foreground">
                如果常见问题未能解决您的问题，请随时联系我们。
            </p>
            <div className="mt-6">
                <a 
                    href="mailto:support@nodebbs.com"
                    className="inline-block bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300"
                >
                    联系支持团队
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
