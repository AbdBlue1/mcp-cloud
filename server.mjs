import { MCPServer } from "@modelcontextprotocol/sdk";
import fs from "fs";
import { exec } from "child_process";

const PROJECTS_DIR = './projects';

const server = new MCPServer({
  name: "cloud-mcp",
  version: "1.0.0",
  description: "Claude MCP server on Render/iOS",
});

// Tool: Run code
server.tool("run_code", async ({ language, code }) => {
  return new Promise(resolve => {
    const cmd = language === "python" ? "python3" : "node";
    exec(`${cmd} - <<'EOF'\n${code}\nEOF`, (err, stdout, stderr) => {
      resolve({ output: stdout || stderr || String(err) });
    });
  });
});

// Tool: Read file
server.tool("read_file", async ({ path }) => {
  const fullPath = `${PROJECTS_DIR}/${path}`;
  if (!fs.existsSync(fullPath)) return { content: null, error: "File does not exist" };
  return { content: fs.readFileSync(fullPath, 'utf8') };
});

// Tool: Write file
server.tool("write_file", async ({ path, content }) => {
  const fullPath = `${PROJECTS_DIR}/${path}`;
  fs.mkdirSync(fullPath.split('/').slice(0,-1).join('/'), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  return { status: "saved" };
});

// Start MCP server
server.start();