import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

function htmlPlugin() {
  return {
    name: 'relative-paths',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(/(href|src)="\/(.*?)"/g, '$1="./$2"')
                  .replace(/import\("\/(.*?)"\)/g, 'import("./$1")');
    }
  };
}

export default defineConfig({
  plugins: [sveltekit(), htmlPlugin()]
});