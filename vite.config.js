import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins:[react()],
  build:{
    target:'es2019',
    rollupOptions:{
      output:{
        // React alada chunk: deploy er por shudhu app code abar download hoy, React cache theke ashe
        manualChunks:{react:['react','react-dom','react-router-dom']}
      }
    }
  }
});