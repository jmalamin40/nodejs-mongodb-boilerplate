import { generateTestForFile } from './generators/test-generator';
import { join } from 'path';

const sourceFiles = [
  {
    source: '../services/auth.service.ts',
    output: './auth.service.test.ts'
  },
  {
    source: '../services/user.service.ts',
    output: './user.service.test.ts'
  }
];

sourceFiles.forEach(file => {
  const sourcePath = join(__dirname, file.source);
  const outputPath = join(__dirname, file.output);
  generateTestForFile(sourcePath, outputPath);
  console.log(`Generated test file: ${file.output}`);
});