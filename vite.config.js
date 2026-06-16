import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Grava log de carregamento do arquivo de configuração para depuração local
try {
  fs.writeFileSync(path.join(__dirname, 'log-api.txt'), `[${new Date().toISOString()}] Configuração do Vite carregada!\n`, 'utf-8');
} catch (e) {
  console.error('Falha ao gravar log de carregamento do config:', e);
}

export default defineConfig({
  server: {
    port: 5173
  },
  plugins: [
    {
      name: 'local-api-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Grava todo request recebido no log para diagnosticar o tráfego da API local
          try {
            fs.appendFileSync(path.join(__dirname, 'log-api.txt'), `[${new Date().toISOString()}] Request recebido: ${req.method} ${req.url}\n`, 'utf-8');
          } catch (e) {
            console.error('Falha ao gravar log de request:', e);
          }

          // Intercepta a chamada de API local de forma flexível (aceita query strings ou barras extras)
          if (req.url.startsWith('/api/criar-aula') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const { slug, title, language, subfolder, order, summary, subjectTitle, content } = data;

                if (!slug || !title || !language) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Campos slug, título e linguagem são obrigatórios.' }));
                  return;
                }

                const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
                const aulasDir = path.join(__dirname, 'aulas');
                const filePath = path.join(aulasDir, `${safeSlug}.md`);

                const frontmatterLines = [
                  '---',
                  `id: ${safeSlug}`,
                  `title: "${title.replace(/"/g, '\\"')}"`,
                  `language: ${language}`,
                ];

                if (subfolder && subfolder.trim() !== '') {
                  frontmatterLines.push(`subfolder: "${subfolder.trim().replace(/"/g, '\\"')}"`);
                }

                if (order !== undefined && order !== '') {
                  frontmatterLines.push(`order: ${parseFloat(order)}`);
                }

                if (summary && summary.trim() !== '') {
                  frontmatterLines.push(`summary: "${summary.trim().replace(/"/g, '\\"')}"`);
                }

                if (subjectTitle && subjectTitle.trim() !== '') {
                  frontmatterLines.push(`subjectTitle: "${subjectTitle.trim().replace(/"/g, '\\"')}"`);
                }

                frontmatterLines.push('---');
                
                const fullMarkdown = frontmatterLines.join('\n') + '\n' + (content || '');

                if (!fs.existsSync(aulasDir)) {
                  fs.mkdirSync(aulasDir, { recursive: true });
                }
                fs.writeFileSync(filePath, fullMarkdown, 'utf-8');

                const compileScriptPath = path.resolve(__dirname, '../../scripts/compile-aulas.mjs');
                const projectRootDir = path.resolve(__dirname, '../../');
                exec(`node "${compileScriptPath}"`, { cwd: projectRootDir }, (err, stdout, stderr) => {
                  if (err) {
                    fs.appendFileSync(path.join(__dirname, 'log-api.txt'), `[${new Date().toISOString()}] Erro ao compilar: ${err.message}\n`, 'utf-8');
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Erro ao compilar as aulas.', details: err.message }));
                    return;
                  }

                  fs.appendFileSync(path.join(__dirname, 'log-api.txt'), `[${new Date().toISOString()}] Aula '${safeSlug}' compilada com sucesso!\n`, 'utf-8');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, message: `Aula '${safeSlug}.md' salva e compilada com sucesso!` }));
                });

              } catch (err) {
                fs.appendFileSync(path.join(__dirname, 'log-api.txt'), `[${new Date().toISOString()}] Erro no processamento: ${err.message}\n`, 'utf-8');
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Erro interno no servidor.', details: err.message }));
              }
            });
          } else if (req.url.startsWith('/api/apagar-aula') && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const { slug } = data;

                if (!slug) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Campo slug é obrigatório para exclusão.' }));
                  return;
                }

                const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
                const aulasDir = path.join(__dirname, 'aulas');
                const filePath = path.join(aulasDir, `${safeSlug}.md`);

                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                } else {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: `Aula '${safeSlug}.md' não encontrada.` }));
                  return;
                }

                const compileScriptPath = path.resolve(__dirname, '../../scripts/compile-aulas.mjs');
                const projectRootDir = path.resolve(__dirname, '../../');
                exec(`node "${compileScriptPath}"`, { cwd: projectRootDir }, (err, stdout, stderr) => {
                  if (err) {
                    fs.appendFileSync(path.join(__dirname, 'log-api.txt'), `[${new Date().toISOString()}] Erro ao compilar pós-deleção: ${err.message}\n`, 'utf-8');
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Erro ao compilar as aulas após exclusão.', details: err.message }));
                    return;
                  }

                  fs.appendFileSync(path.join(__dirname, 'log-api.txt'), `[${new Date().toISOString()}] Aula '${safeSlug}' excluída e compilada com sucesso!\n`, 'utf-8');
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, message: `Aula '${safeSlug}.md' excluída com sucesso!` }));
                });

              } catch (err) {
                fs.appendFileSync(path.join(__dirname, 'log-api.txt'), `[${new Date().toISOString()}] Erro no processamento de exclusão: ${err.message}\n`, 'utf-8');
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Erro interno no servidor.', details: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ]
});
