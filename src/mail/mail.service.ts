import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    // const resetLink = `http://yourapp.com/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="https://www.instagram.com/shafi_calvin/">Reset Password</a></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendRegistrationEMail(to: string, lastName: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Welcome to my blog posts',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MUGABO Shafi Danny's blog posts</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 20px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  padding: 20px 0;
                  background-color: #007bff;
                  color: #ffffff;
              }
              .header h1 {
                  margin: 0;
              }
              .content {
                  padding: 20px;
              }
              .content h2 {
                  color: #333333;
              }
              .content p {
                  color: #555555;
              }
              .button {
                  display: block;
                  width: 200px;
                  margin: 20px auto;
                  padding: 10px;
                  text-align: center;
                  background-color: #007bff;
                  border-radius: 5px;
                  cursor: pointer;
                  text-decoration: none;
              }
              .button span{
                color: #ffffff;
                  text-decoration: none;
              }
  
              .footer {
                  text-align: center;
                  padding: 20px;
                  background-color: #f4f4f4;
                  color: #555555;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to my blog posts</h1>
              </div>
              <div class="content">
              <h2>Hello ${lastName},</h2>
              <p>Thank you for registering with us! We're excited to welcome you to our community at Mugabo Shafi Danny's Blog.</p> 
              <p>At Mugabo Shafi Danny's Blog, we're dedicated to bringing you insightful and engaging content on topics ranging from technology to personal development.</p> 
              <p>To get started, click the button below to explore our latest posts and discover valuable insights:</p> 
              <a href="https://www.instagram.com/shafi_calvin/" class="button"><span>Explore Our Blog</span></a> 
              <p>If you have any questions or suggestions, feel free to reach out to us. We're here to assist you!</p> 
              <p>Enjoy your journey with us!</p> <p>Best regards,<br>Mugabo Shafi Danny's Blog Team</p>
              </div>
              <div class="footer">
                  <p>&copy; 2024 MUGABO Shafi Danny. All rights reserved.</p>
                  <p><a class='email' href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
              </div>
          </div>
      </body>
      </html>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendNewCommentEmail(
    firstName: string,
    postTitle: string,
    commentText: string,
    to: string,
  ) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Comment Alert',
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Comment on Your Post</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #333333;
        }
        .content p {
            color: #555555;
        }
        .button {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 10px;
            text-align: center;
            background-color: #007bff;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
        }
        .button span {
            color: #ffffff;
            text-decoration: none;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #555555;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Comment on Your Post</h1>
        </div>
        <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Good news! Someone has just commented on your post titled <strong>"${postTitle}"</strong>.</p>
            <p>Here's what they said:</p>
            <blockquote style="font-style: italic; color: #333;">"${commentText}"</blockquote>
            <p>We encourage you to check out the comment and continue the conversation.</p>
            <a href="https://www.instagram.com/shafi_calvin/" class="button"><span>View Comment</span></a>
            <p>Thank you for being an active member of our blog community!</p>
            <p>Best regards,<br>Mugabo Shafi Danny's Blog Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 MUGABO Shafi Danny. All rights reserved.</p>
            <p><a class='email' href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
        </div>
    </div>
</body>
</html>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendScheduledMail(username: string, date_time: Date, to: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Task alert',
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #333333;
        }
        .content p {
            color: #555555;
        }
        .button {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 10px;
            text-align: center;
            background-color: #007bff;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
        }
        .button span {
            color: #ffffff;
            text-decoration: none;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #555555;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reminder</h1>
        </div>
        <div class="content">
            <h2>Hello ${username},</h2>
            <p>Today is ${date_time}.</p>
            <p>Thank you for your attention to this matter.</p>
            <p>Best regards,<br>MUGABO Shafi Danny</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 MUGABO Shafi Danny. All rights reserved.</p>
            <p><a class='email' href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
        </div>
    </div>
</body>
</html>

      `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendDailyReportEmail(
    firstName: string,
    postsCount: number,
    commentsCount: number,
    commentsReceived: number,
    CommentWithMostReplies: string,
    to: string,
    pdfPath: string,
  ) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Blog system daily report 📝📊🚨',
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Blog Activity Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #007bff;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #333333;
        }
        .content p {
            color: #555555;
        }
        .stats {
            margin: 20px 0;
            background-color: #f9f9f9;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .stats p {
            margin: 10px 0;
            font-size: 16px;
            color: #333;
        }
        .button {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 10px;
            text-align: center;
            background-color: #007bff;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
        }
        .button span {
            color: #ffffff;
            text-decoration: none;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #555555;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Daily Blog Activity Report</h1>
        </div>
        <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Here's a summary of your activity on our blog platform today:</p>
            
            <div class="stats">
                <p><strong>Posts Created:</strong> ${postsCount}</p>
                <p><strong>Comments you commented:</strong> ${commentsCount}</p>
                <p><strong>Received Comments:</strong> ${commentsReceived}</p>
                <p><strong>Comment with most replies:</strong> ${CommentWithMostReplies}</p>
            </div>

            <p>Keep up the great work! Here are a few suggestions for tomorrow:</p>
            <ul>
                <li>Engage with your commenters by replying to their comments.</li>
                <li>Check out trending posts in your niche for inspiration.</li>
                <li>Post more frequently to increase engagement.</li>
            </ul>

            <a href="https://www.instagram.com/shafi_calvin/" class="button"><span>View Your Dashboard</span></a>
            <p>Thank you for being an active member of our blog community. Stay inspired and keep creating amazing content!</p>
            <p>Best regards,<br>Mugabo Shafi Danny's Blog Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 MUGABO Shafi Danny. All rights reserved.</p>
            <p><a class='email' href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
        </div>
    </div>
</body>
</html>

      `,
      attachments: [
        {
          filename: `${firstName} daily-report.pdf`,
          path: pdfPath,
        },
      ],
    };
    await this.transporter.sendMail(mailOptions);
  }
}
