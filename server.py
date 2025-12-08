# # from http.server import BaseHTTPRequestHandler, HTTPServer
# # import subprocess
# # import time
# # import os

# # REPO_PATH = r"D:\work's space\October\tdhaemoi-backend"

# # def run_cmd(cmd, cwd=REPO_PATH, shell=False):
# #     """Run a command and return (returncode, stdout, stderr)."""
# #     proc = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True, shell=shell)
# #     return proc.returncode, proc.stdout.strip(), proc.stderr.strip()

# # def start_background(cmd_list, cwd=REPO_PATH, shell=True):
# #     """Start a detached background process (Windows-friendly)."""
# #     # shell=True required on Windows for npm/npx to resolve correctly
# #     return subprocess.Popen(cmd_list, cwd=cwd, shell=shell)

# # class WebhookHandler(BaseHTTPRequestHandler):
# #     def do_POST(self):
# #         try:
# #             self.log_message("Pulling latest changes...")
# #             rc, out, err = run_cmd(["git", "pull"])
# #             self.log_message("GIT stdout: %s", out)
# #             if err:
# #                 self.log_message("GIT stderr: %s", err)

# #             # 2) Rebuild (create build/index.js) — this fixes MODULE_NOT_FOUND
# #             self.log_message("Running build (npm run build)...")
# #             rc, out, err = run_cmd(["npm", "run", "build"], shell=True)
# #             self.log_message("BUILD stdout: %s", out)
# #             if err:
# #                 self.log_message("BUILD stderr: %s", err)

# #             # 3) Start nodemon (dev). First kill any running node.exe to ensure a clean start.
# #             self.log_message("Killing existing node processes (if any)...")
# #             # taskkill will print an error if node.exe not found — that's fine
# #             subprocess.run(["taskkill", "/f", "/im", "node.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# #             self.log_message("Starting nodemon (npm run dev)...")
# #             # Start nodemon (this is your "dev" script: nodemon --exec ts-node index.ts)
# #             nodemon_proc = start_background("npm run dev", cwd=REPO_PATH, shell=True)

# #             # Give a moment for nodemon/node to spin up
# #             time.sleep(2)

# #             # 4) Run prisma db push
# #             self.log_message("Running Prisma migration (npx prisma db push)...")
# #             rc, out, err = run_cmd(["npx", "prisma", "db", "push"], shell=True)
# #             self.log_message("PRISMA stdout: %s", out)
# #             if err:
# #                 self.log_message("PRISMA stderr: %s", err)

# #             # 5) Restart nodemon so it picks up any generated client/files
# #             self.log_message("Restarting nodemon to pick up changes...")
# #             subprocess.run(["taskkill", "/f", "/im", "node.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
# #             # small pause
# #             time.sleep(1)
# #             # nodemon_proc = start_background("npm run dev", cwd=REPO_PATH, shell=True)

# #             self.send_response(200)
# #             self.end_headers()
# #             self.wfile.write(b"OK: pulled, built, started nodemon, prisma pushed, nodemon restarted\n")

# #         except Exception as e:
# #             self.send_response(500)
# #             self.end_headers()
# #             self.wfile.write(str(e).encode())

# # def run():
# #     server = HTTPServer(("0.0.0.0", 3091), WebhookHandler)
# #     print("Server running on port 3091...")
# #     server.serve_forever()

# # if __name__ == "__main__":
# #     run()


# import pyautogui
# import time
# import random

# def type_line(line):
#     """Type one line with human-like speed"""
#     for char in line:
#         pyautogui.write(char)
#         time.sleep(random.uniform(0.01, 0.06))

#     pyautogui.press("enter")
#     time.sleep(random.uniform(0.05, 0.15))


# def human_type_formatted(text):
#     """Type text line-by-line (preserves indentation and formatting)"""
#     lines = text.split("\n")
#     for line in lines:
#         type_line(line)


# # -------------------------------
# # PUT YOUR CODE HERE
# # -------------------------------
# code = r"""
# export const managePartnerSettings = async (req: Request, res: Response) => {
#   try {
#     const { id } = req.user;
#     const { orthotech, opannrit } = req.body;

#     if (orthotech !== undefined && typeof orthotech !== 'boolean') {
#       return res.status(400).json({
#         success: false,
#         message: "orthotech must be a boolean value",
#       });
#     }
#     if (opannrit !== undefined && typeof opannrit !== 'boolean') {
#       return res.status(400).json({
#         success: false,
#         message: "opannrit must be a boolean value",
#       });
#     }
    
#     if (orthotech === undefined && opannrit === undefined) {
#       return res.status(400).json({
#         success: false,
#         message: "At least one setting (orthotech or opannrit) is required",
#       });
#     }

#     const partner = await prisma.user.findUnique({
#       where: { id },
#     });
    
#     if (!partner) {
#       return res.status(404).json({
#         success: false,
#         message: "Partner not found",
#       });
#     }
    
#     if (partner.role !== "PARTNER") {
#       return res.status(400).json({
#         success: false,
#         message: "You are not authorized to manage partner settings",
#       });
#     }

#     const partnersSettingsModel = (prisma as any).partners_settings;
#     if (!partnersSettingsModel) {
#       return res.status(500).json({
#         success: false,
#         message: "Partner settings model not available",
#       });
#     }

#     const existingSettings = await partnersSettingsModel.findUnique({
#       where: { partnerId: id },
#     });

#     let partnerSettings;
#     if (existingSettings) {
#       partnerSettings = await partnersSettingsModel.update({
#         where: { id: existingSettings.id },
#         data: {
#           ...(orthotech !== undefined && { orthotech }),
#           ...(opannrit !== undefined && { opannrit }),
#         },
#       });
#     } else {
#       partnerSettings = await partnersSettingsModel.create({
#         data: {
#           partnerId: id,
#           orthotech: orthotech ?? false,
#           opannrit: opannrit ?? false,
#         },
#       });
#     }

#     return res.status(200).json({
#       success: true,
#       message: "Partner settings saved successfully",
#       data: partnerSettings,
#     });
#   } catch (error: any) {
#     return res.status(500).json({
#       success: false,
#       message: "Something went wrong",
#       error: error?.message,
#     });
#   }
# };

# export const getPartnerSettings = async (req: Request, res: Response) => {
#   try {
#     const { id } = req.user;
    
#     const partner = await prisma.user.findUnique({
#       where: { id },
#     });
    
#     if (!partner) {
#       return res.status(404).json({
#         success: false,
#         message: "Partner not found",
#       });
#     }
    
#     if (partner.role !== "PARTNER") {
#       return res.status(400).json({
#         success: false,
#         message: "You are not authorized to view partner settings",
#       });
#     }

#     const partnersSettingsModel = (prisma as any).partners_settings;
#     if (!partnersSettingsModel) {
#       return res.status(500).json({
#         success: false,
#         message: "Settings model not available",
#       });
#     }

#     const partnerSettings = await partnersSettingsModel.findUnique({
#       where: { partnerId: id },
#     });

#     if (!partnerSettings) {
#       return res.status(200).json({
#         success: true,
#         message: "Partner settings not found",
#         data: {
#           orthotech: false,
#           opannrit: false,
#         },
#       });
#     }

#     return res.status(200).json({
#       success: true,
#       message: "Partner settings fetched successfully",
#       data: partnerSettings,
#     });
#   } catch (error: any) {
#     return res.status(500).json({
#       success: false,
#       message: "Something went wrong",
#       error: error?.message,
#     });
#   }
# };
# """

# # -------------------------------

# print("Typing starts in 3 seconds... move to VS Code now!")
# time.sleep(3)

# human_type_formatted(code)

import os
import time
import random

TARGET_FILE = "server.js"

def human_delay():
    """Random human-like delay with variations"""
    # small character delays
    delay = random.uniform(0.02, 0.25)

    # sometimes slow down like thinking
    if random.random() < 0.12:
        delay += random.uniform(0.2, 0.6)

    time.sleep(delay)

def type_human(text, file):
    """Type text character-by-character with human rhythm"""
    for ch in text:
        file.write(ch)
        file.flush()
        human_delay()

def type_line(line, file):
    """Type a full line with pauses"""
    type_human(line, file)

    # natural pause after completing a line
    time.sleep(random.uniform(0.15, 0.70))

    file.write("\n")
    file.flush()

def write_to_server_js(content):
    if not os.path.exists(TARGET_FILE):
        print(f"{TARGET_FILE} not found!")
        return
    
    print(f"Typing into {TARGET_FILE}...\n")

    with open(TARGET_FILE, "a", encoding="utf-8") as file:
        for line in content.split("\n"):
            type_line(line, file)

    print("\n✔ Finished typing (super human mode)")
    

if __name__ == "__main__":
    code = """
import express from 'express';
const router = express.Router();

// Mock database
let posts = [];

/**
 * Create a new post
 */
router.post('/posts', (req, res) => {
    const { title, content, author } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: "Title & content are required" });
    }

    const newPost = {
        id: posts.length + 1,
        title,
        content,
        author: author || "Anonymous",
        createdAt: new Date()
    };

    posts.push(newPost);

    return res.status(201).json({
        message: "Post created successfully",
        data: newPost
    });
});

/**
 * Get all posts
 */
router.get('/posts', (req, res) => {
    return res.status(200).json({
        message: "All posts",
        data: posts
    });
});

/**
 * Get single post
 */
router.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === Number(req.params.id));

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    return res.json({
        message: "Post fetched",
        data: post
    });
});

/**
 * Update a post
 */
router.put('/posts/:id', (req, res) => {
    const id = Number(req.params.id);
    const post = posts.find(p => p.id === id);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;

    return res.json({
        message: "Post updated successfully",
        data: post
    });
});

/**
 * Delete post
 */
router.delete('/posts/:id', (req, res) => {
    const id = Number(req.params.id);
    posts = posts.filter(p => p.id !== id);

    return res.json({ message: "Post deleted" });
});

export default router;
""".strip("\n")

    write_to_server_js(code)
