export class HtmlEmails {
  async DailyReportHtmlEmail(
    username: string,
    postCount: number,
    commentCount: number,
    receivedCommentsCount: number,
    commentWithMostReplies: string,
    profilePhoto: string,
  ): Promise<any> {
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Daily Report</title>
      <style>
        /* A4 Paper Size Styling */
        @page {
          size: A4;
          margin: 0;
        }
    
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
    
        .report-container {
          width: 100%;
          height: 100%;
          padding: 40px;
          box-sizing: border-box;
          border: 2px solid #ddd;
          margin: 0;
        }
    
        /* Header Styling */
        .header {
          text-align: center;
          padding-bottom: 30px;
          border-bottom: 2px solid #ddd;
        }
    
        .profile-photo {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
        }
    
        h1 {
          font-size: 28px;
          color: #2c3e50;
          margin-bottom: 10px;
        }
    
        h2 {
          font-size: 22px;
          color: #34495e;
          margin-bottom: 20px;
        }
    
        .user-info {
          text-align: center;
          margin-top: 20px;
        }
    
        /* Statistics Section */
        .statistics {
          margin-top: 40px;
          padding: 20px;
          background-color: #f4f4f4;
          border-radius: 10px;
        }
    
        .statistics h2 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          color: #2980b9;
        }
    
        .statistics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          justify-items: center;
          margin: 0 auto;
          max-width: 600px;
        }
    
        .stat-item {
          background-color: #fff;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
    
        .stat-item p {
          font-size: 18px;
          margin: 5px 0;
          color: #555;
        }
    
        .stat-item strong {
          font-size: 20px;
          color: #16a085;
        }
    
        /* Footer */
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 14px;
          color: #7f8c8d;
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <img class="profile-photo" src="${profilePhoto}" alt="Profile Photo">
          <h1>Daily Report</h1>
          <div class="user-info">
            <h2>${username}</h2>
          </div>
        </div>
    
        <div class="statistics">
          <h2>Statistics Overview</h2>
          <div class="statistics-grid">
            <div class="stat-item">
              <p>Total Posts</p>
              <strong>${postCount}</strong>
            </div>
            <div class="stat-item">
              <p>Total Comments</p>
              <strong>${commentCount}</strong>
            </div>
            <div class="stat-item">
              <p>Received Comments</p>
              <strong>${receivedCommentsCount}</strong>
            </div>
            <div class="stat-item">
              <p>Most Replied Comment</p>
              <strong>${commentWithMostReplies}</strong>
            </div>
          </div>
        </div>
    
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} by MUGABO Shafi Danny</p>
        </div>
      </div>
    </body>
    </html>
     `;
     return html;
  }
}
