import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

class TestGenerator {
  private sourceFile: ts.SourceFile;
  private className: string = '';
  private methods: string[] = [];

  constructor(filePath: string) {
    const content = readFileSync(filePath, 'utf-8');
    this.sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    this.parseFile();
  }

  private parseFile() {
    ts.forEachChild(this.sourceFile, node => {
      if (ts.isClassDeclaration(node) && node.name) {
        this.className = node.name.text;
        node.members.forEach(member => {
          if (ts.isMethodDeclaration(member) && member.name) {
            this.methods.push(member.name.getText(this.sourceFile));
          }
        });
      }
    });
  }

  generateTest(): string {
    const imports = `import { ${this.className} } from '../${this.className.toLowerCase()}';
import { createMock } from 'ts-auto-mock';

`;

    const testCases = this.methods.map(method => `
  describe('${method}', () => {
    let ${this.className.toLowerCase()}: ${this.className};

    beforeEach(() => {
      ${this.className.toLowerCase()} = createMock<${this.className}>();
    });

    it('should execute successfully', async () => {
      // Arrange
      // TODO: Add test setup

      // Act
      // const result = await ${this.className.toLowerCase()}.${method}();

      // Assert
      // TODO: Add assertions
      expect(true).toBeTruthy();
    });

    it('should handle errors appropriately', async () => {
      // Arrange
      // TODO: Add error scenario setup

      // Act & Assert
      // await expect(${this.className.toLowerCase()}.${method}()).rejects.toThrow();
    });
  });`).join('\n');

    return `${imports}
describe('${this.className}', () => {
  ${testCases}
});
`;
  }

  saveTest(outputPath: string) {
    const testContent = this.generateTest();
    writeFileSync(outputPath, testContent);
  }
}

export const generateTestForFile = (sourcePath: string, outputPath: string) => {
  const generator = new TestGenerator(sourcePath);
  generator.saveTest(outputPath);
};