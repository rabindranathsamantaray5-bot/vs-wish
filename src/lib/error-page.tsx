export function renderErrorPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Internal Server Error</title>
        <style>
          body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; background: #fff; color: #000; }
          .container { text-align: center; padding: 2rem; }
          h1 { margin: 0; font-size: 2rem; font-weight: 600; }
          p { color: #666; margin-top: 0.5rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Internal Server Error</h1>
          <p>Something went wrong on our end. Please try again later.</p>
        </div>
      </body>
    </html>
  `;
}
