// Модуль отправки email уведомлений
// Использует Nodemailer с SMTP (Yandex/Mail.ru)

import nodemailer from 'nodemailer';

// Конфигурация транспорта
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.yandex.ru',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Базовый шаблон письма
function getEmailTemplate(content: string): string {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'История моей жизни';

  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%); color: #ffffff; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px; }
    .button { display: inline-block; background: #2d3748; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; margin: 16px 0; }
    .button:hover { background: #1a202c; }
    .footer { background: #f7f7f7; padding: 24px 32px; text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eee; }
    .note { background: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; 2026 ${appName}. Все права защищены.</p>
      <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Отправка письма с секретной ссылкой на личный кабинет
export async function sendCabinetLink(
  email: string,
  cabinetToken: string,
  authorName: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const cabinetUrl = `${appUrl}/cabinet/${cabinetToken}`;

  const content = `
    <h2>Здравствуйте, ${authorName}!</h2>
    <p>Ваша история успешно отправлена на модерацию. Мы проверим её в течение 24 часов.</p>

    <div class="note">
      <strong>Важно!</strong> Сохраните эту ссылку — она даёт доступ к вашему личному кабинету, где вы можете редактировать или удалить историю.
    </div>

    <p style="text-align: center;">
      <a href="${cabinetUrl}" class="button">Открыть личный кабинет</a>
    </p>

    <p style="font-size: 14px; color: #666;">
      Или скопируйте ссылку:<br>
      <code style="background: #f0f0f0; padding: 8px 12px; display: inline-block; margin-top: 8px; border-radius: 4px; word-break: break-all;">${cabinetUrl}</code>
    </p>

    <p>После одобрения модератором ваша история появится на карте.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"История моей жизни" <noreply@example.com>',
      to: email,
      subject: 'Ваша история отправлена на модерацию',
      html: getEmailTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    return false;
  }
}

// Уведомление об одобрении истории
export async function sendApprovalNotification(
  email: string,
  authorName: string,
  storyId: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';

  const content = `
    <h2>Отличные новости, ${authorName}!</h2>
    <p>Ваша история прошла модерацию и теперь опубликована на карте.</p>

    <p style="text-align: center;">
      <a href="${appUrl}?story=${storyId}" class="button">Посмотреть на карте</a>
    </p>

    <p>Спасибо, что поделились своей историей с миром!</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"История моей жизни" <noreply@example.com>',
      to: email,
      subject: 'Ваша история опубликована!',
      html: getEmailTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    return false;
  }
}

// Уведомление об отклонении истории
export async function sendRejectionNotification(
  email: string,
  authorName: string,
  reason: string,
  cabinetToken: string
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const cabinetUrl = `${appUrl}/cabinet/${cabinetToken}`;

  const content = `
    <h2>Здравствуйте, ${authorName}.</h2>
    <p>К сожалению, ваша история не прошла модерацию.</p>

    <div class="note">
      <strong>Причина:</strong><br>
      ${reason}
    </div>

    <p>Вы можете отредактировать историю и отправить её на повторную модерацию:</p>

    <p style="text-align: center;">
      <a href="${cabinetUrl}" class="button">Редактировать историю</a>
    </p>

    <p>Если у вас есть вопросы, напишите нам в ответ на это письмо.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"История моей жизни" <noreply@example.com>',
      to: email,
      subject: 'Ваша история требует доработки',
      html: getEmailTemplate(content),
    });
    return true;
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    return false;
  }
}

// Проверка подключения к SMTP
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Ошибка подключения к SMTP:', error);
    return false;
  }
}
