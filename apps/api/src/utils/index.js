import path from 'path';
import { fileURLToPath } from 'url';

export const dirname = (url) => {
  const filename = fileURLToPath(url);
  const dirname = path.dirname(filename);
  return dirname;
};