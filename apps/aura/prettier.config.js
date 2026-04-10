/** @type {import("prettier").Config} */
const prettierConfig = {
  plugins: ['prettier-plugin-tailwindcss'],
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  indent_style: 'space',
  indent_size: 2,
  end_of_line: 'lf',
  tailwindConfig: './tailwind.config.ts',
};

export default prettierConfig;
