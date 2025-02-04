import httpServer from './app';
import {PORT} from './config/env';

httpServer.listen(PORT, () => {
  console.info(`Server is running at http://localhost:${PORT}`);
});
