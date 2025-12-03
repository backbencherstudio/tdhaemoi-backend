from http.server import BaseHTTPRequestHandler, HTTPServer
import subprocess
import time
import os

REPO_PATH = r"D:\work's space\October\tdhaemoi-backend"

def run_cmd(cmd, cwd=REPO_PATH, shell=False):
    """Run a command and return (returncode, stdout, stderr)."""
    proc = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True, shell=shell)
    return proc.returncode, proc.stdout.strip(), proc.stderr.strip()

def start_background(cmd_list, cwd=REPO_PATH, shell=True):
    """Start a detached background process (Windows-friendly)."""
    # shell=True required on Windows for npm/npx to resolve correctly
    return subprocess.Popen(cmd_list, cwd=cwd, shell=shell)

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            self.log_message("Pulling latest changes...")
            rc, out, err = run_cmd(["git", "pull"])
            self.log_message("GIT stdout: %s", out)
            if err:
                self.log_message("GIT stderr: %s", err)

            # 2) Rebuild (create build/index.js) — this fixes MODULE_NOT_FOUND
            self.log_message("Running build (npm run build)...")
            rc, out, err = run_cmd(["npm", "run", "build"], shell=True)
            self.log_message("BUILD stdout: %s", out)
            if err:
                self.log_message("BUILD stderr: %s", err)

            # 3) Start nodemon (dev). First kill any running node.exe to ensure a clean start.
            self.log_message("Killing existing node processes (if any)...")
            # taskkill will print an error if node.exe not found — that's fine
            subprocess.run(["taskkill", "/f", "/im", "node.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            self.log_message("Starting nodemon (npm run dev)...")
            # Start nodemon (this is your "dev" script: nodemon --exec ts-node index.ts)
            nodemon_proc = start_background("npm run dev", cwd=REPO_PATH, shell=True)

            # Give a moment for nodemon/node to spin up
            time.sleep(2)

            # 4) Run prisma db push
            self.log_message("Running Prisma migration (npx prisma db push)...")
            rc, out, err = run_cmd(["npx", "prisma", "db", "push"], shell=True)
            self.log_message("PRISMA stdout: %s", out)
            if err:
                self.log_message("PRISMA stderr: %s", err)

            # 5) Restart nodemon so it picks up any generated client/files
            self.log_message("Restarting nodemon to pick up changes...")
            subprocess.run(["taskkill", "/f", "/im", "node.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            # small pause
            time.sleep(1)
            # nodemon_proc = start_background("npm run dev", cwd=REPO_PATH, shell=True)

            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"OK: pulled, built, started nodemon, prisma pushed, nodemon restarted\n")

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())

def run():
    server = HTTPServer(("0.0.0.0", 3091), WebhookHandler)
    print("Server running on port 3091...")
    server.serve_forever()

if __name__ == "__main__":
    run()
