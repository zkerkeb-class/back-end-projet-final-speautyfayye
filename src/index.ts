import app from './app';
import {PORT} from './config/env';

app.listen(PORT, () => {
  console.info(`Server is running at http://localhost:${PORT}`);
});
