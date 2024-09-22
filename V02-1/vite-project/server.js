// const express = require('express');
// const path = require('path');

// const app = express();
// const PORT = 3000;

// // 设置静态文件目录
// app.use(express.static(path.join(__dirname, 'public'), {
//     setHeaders: (res, filePath) => {
//         if (filePath.endsWith('.js')) {
//             res.set('Content-Type', 'application/javascript');
//         }
//         if (filePath.endsWith('.jsx')) {
//             res.set('Content-Type', 'text/jsx');
//         }
//         // 其他 MIME 类型可以在这里设置
//     }
// }));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
