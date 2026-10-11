export interface EmailContent {
  organizationName: string;
  heading: string;
  intro: string;
  message?: string | null;
  messageTitle?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footer: string;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const paragraphs = (value: string) =>
  escapeHtml(value).replace(/\r?\n/g, '<br />');

export const renderEmail = (content: EmailContent) => {
  const message = content.message?.trim();
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#0b2149;padding:18px 24px;color:#ffffff;font-size:15px;font-weight:600;">
                ${escapeHtml(content.organizationName)}
                <span style="color:#9fc3ff;font-weight:400;"> · Resolvo</span>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 24px 8px;">
                <h1 style="margin:0 0 10px;font-size:21px;line-height:1.3;color:#0b2149;">${escapeHtml(content.heading)}</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.55;">${paragraphs(content.intro)}</p>
                ${
                  message
                    ? `<div style="margin:0 0 18px;padding:14px 16px;background:#eef3ff;border-radius:10px;font-size:14px;line-height:1.55;">
                  ${content.messageTitle ? `<div style="font-weight:600;color:#0b2149;margin-bottom:6px;">${escapeHtml(content.messageTitle)}</div>` : ''}
                  ${paragraphs(message)}
                </div>`
                    : ''
                }
                ${
                  content.ctaUrl && content.ctaLabel
                    ? `<p style="margin:0 0 22px;">
                  <a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;background:#1a4fd6;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px;">${escapeHtml(content.ctaLabel)}</a>
                </p>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px 22px;font-size:12px;color:#6b7280;border-top:1px solid #eef0f4;">
                ${paragraphs(content.footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    content.heading,
    '',
    content.intro,
    ...(message ? ['', content.messageTitle ?? '', message] : []),
    ...(content.ctaUrl ? ['', `${content.ctaLabel}: ${content.ctaUrl}`] : []),
    '',
    '—',
    content.footer,
  ]
    .filter((line, index, lines) => !(line === '' && lines[index - 1] === ''))
    .join('\n');

  return { html, text };
};
