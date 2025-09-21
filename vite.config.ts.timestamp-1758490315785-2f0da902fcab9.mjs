// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import preact from "file:///home/project/node_modules/@preact/preset-vite/dist/esm/index.mjs";
import path from "path";
import { NodeGlobalsPolyfillPlugin } from "file:///home/project/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import { NodeModulesPolyfillPlugin } from "file:///home/project/node_modules/@esbuild-plugins/node-modules-polyfill/dist/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "react": "preact/compat",
      "react-dom": "preact/compat"
    }
  },
  define: {
    global: "globalThis"
  },
  optimizeDeps: {
    include: ["plotly.js", "react-plotly.js"],
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHByZWFjdCBmcm9tICdAcHJlYWN0L3ByZXNldC12aXRlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4gfSBmcm9tICdAZXNidWlsZC1wbHVnaW5zL25vZGUtZ2xvYmFscy1wb2x5ZmlsbCdcbmltcG9ydCB7IE5vZGVNb2R1bGVzUG9seWZpbGxQbHVnaW4gfSBmcm9tICdAZXNidWlsZC1wbHVnaW5zL25vZGUtbW9kdWxlcy1wb2x5ZmlsbCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3ByZWFjdCgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgJ3JlYWN0JzogJ3ByZWFjdC9jb21wYXQnLFxuICAgICAgJ3JlYWN0LWRvbSc6ICdwcmVhY3QvY29tcGF0J1xuICAgIH1cbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcycsXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsncGxvdGx5LmpzJywgJ3JlYWN0LXBsb3RseS5qcyddLFxuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4oe1xuICAgICAgICAgIGJ1ZmZlcjogdHJ1ZVxuICAgICAgICB9KSxcbiAgICAgICAgTm9kZU1vZHVsZXNQb2x5ZmlsbFBsdWdpbigpXG4gICAgICBdXG4gICAgfVxuICB9XG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxZQUFZO0FBQ25CLE9BQU8sVUFBVTtBQUNqQixTQUFTLGlDQUFpQztBQUMxQyxTQUFTLGlDQUFpQztBQUoxQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsT0FBTyxDQUFDO0FBQUEsRUFDbEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLFNBQVM7QUFBQSxNQUNULGFBQWE7QUFBQSxJQUNmO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxhQUFhLGlCQUFpQjtBQUFBLElBQ3hDLGdCQUFnQjtBQUFBLE1BQ2QsU0FBUztBQUFBLFFBQ1AsMEJBQTBCO0FBQUEsVUFDeEIsUUFBUTtBQUFBLFFBQ1YsQ0FBQztBQUFBLFFBQ0QsMEJBQTBCO0FBQUEsTUFDNUI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
