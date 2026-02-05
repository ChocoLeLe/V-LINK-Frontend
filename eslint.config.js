import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  // 基礎推薦設定
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    // 指定適用範圍
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // 合併瀏覽器、Node.js 與 Quasar 預設變數
        ...globals.browser,
        ...globals.node,
        process: 'readonly', // 允許 Quasar 使用 process.env
        console: 'readonly', // 允許使用 console.log
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'warn',
    },
  },
]
