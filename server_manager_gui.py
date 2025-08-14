import sys
import subprocess
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import os
import time
from datetime import datetime
import glob
from typing import Optional
import queue
import json
import shutil

# Utility functions for Windows compatibility
def find_executable(name):
    """Find executable in PATH, with Windows-specific extensions"""
    if sys.platform == 'win32':
        # Try common Windows extensions
        extensions = ['.exe', '.cmd', '.bat', '']
        for ext in extensions:
            exe_name = name + ext
            path = shutil.which(exe_name)
            if path:
                return path
    else:
        return shutil.which(name)
    return None

def run_command_safe(cmd, **kwargs):
    """Run command with better Windows compatibility"""
    try:
        if isinstance(cmd, str):
            # For shell commands, use shell=True on Windows
            return subprocess.run(cmd, shell=True, **kwargs)
        else:
            # For command lists, find the executable first
            if sys.platform == 'win32' and cmd:
                exe_path = find_executable(cmd[0])
                if exe_path:
                    cmd[0] = exe_path
            return subprocess.run(cmd, **kwargs)
    except FileNotFoundError as e:
        raise FileNotFoundError(f"Command not found: {cmd[0] if isinstance(cmd, list) else cmd}")

# Function to install a package if not available
def install_if_missing(package_name):
    try:
        subprocess.check_output([sys.executable, '-m', 'pip', 'show', package_name], 
                               stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        print(f"Installing {package_name}...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package_name])
            print(f"Successfully installed {package_name}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Failed to install {package_name}: {e}")
            return False

# Try to install customtkinter, but fall back to regular tkinter if it fails
USE_CUSTOM_TK = False
if install_if_missing('customtkinter'):
    try:
        import customtkinter as ctk
        USE_CUSTOM_TK = True
        print("Using CustomTkinter for modern UI")
    except ImportError:
        print("CustomTkinter not available, using standard tkinter")
        USE_CUSTOM_TK = False
else:
    print("Could not install CustomTkinter, using standard tkinter")

class ServerManagerGUI:
    def __init__(self):
        if USE_CUSTOM_TK:
            self.root = ctk.CTk()
            ctk.set_appearance_mode("dark")
            ctk.set_default_color_theme("blue")
        else:
            self.root = tk.Tk()
            self.root.configure(bg='#2b2b2b')
        
        self.root.title("Bingo Server Manager - SQLite Edition")
        self.root.geometry("1400x900")
        self.root.minsize(1200, 700)
        
        # Variables
        self.server_process: Optional[subprocess.Popen] = None
        self.docker_process: Optional[subprocess.Popen] = None
        self.output_queue = queue.Queue()
        self.is_server_running = False
        self.is_postgres_running = False
        
        self.create_gui()
        self.setup_auto_refresh()
        self.check_environment_status()

    def create_frame(self, parent, **kwargs):
        if USE_CUSTOM_TK:
            return ctk.CTkFrame(parent, **kwargs)
        else:
            frame_kwargs = {k: v for k, v in kwargs.items() if k in ['width', 'height']}
            return tk.Frame(parent, bg='#404040', **frame_kwargs)

    def create_button(self, parent, text, command, color=None, **kwargs):
        if USE_CUSTOM_TK:
            btn_kwargs = {'text': text, 'command': command}
            if color == 'green':
                btn_kwargs.update({'fg_color': 'green', 'hover_color': 'dark green'})
            elif color == 'red':
                btn_kwargs.update({'fg_color': 'red', 'hover_color': 'dark red'})
            btn_kwargs.update(kwargs)
            return ctk.CTkButton(parent, **btn_kwargs)
        else:
            btn_color = '#2E8B57' if color == 'green' else '#DC143C' if color == 'red' else '#4169E1'
            btn_kwargs = {
                'text': text, 'command': command, 'bg': btn_color, 'fg': 'white',
                'relief': 'flat', 'font': ('Arial', 10, 'bold')
            }
            btn_kwargs.update(kwargs)
            return tk.Button(parent, **btn_kwargs)

    def create_label(self, parent, text, **kwargs):
        if USE_CUSTOM_TK:
            return ctk.CTkLabel(parent, text=text, **kwargs)
        else:
            return tk.Label(parent, text=text, bg='#404040', fg='white', font=('Arial', 12), **kwargs)

    def create_gui(self):
        # Create main container with three columns
        main_container = self.create_frame(self.root)
        main_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Left Column (Database & Environment Control)
        left_column = self.create_frame(main_container, width=300)
        left_column.pack(side=tk.LEFT, fill=tk.Y, padx=5, pady=5)
        left_column.pack_propagate(False)

        # Environment Status Panel
        env_panel = self.create_frame(left_column)
        env_panel.pack(fill=tk.X, padx=5, pady=5)

        env_label = self.create_label(env_panel, "🔧 Environment Status")
        env_label.pack(pady=5)

        # Status indicators with progress bars
        self.env_status_frame = self.create_frame(env_panel)
        self.env_status_frame.pack(fill=tk.X, padx=5, pady=5)

        # Node.js Status
        self.node_frame = self.create_frame(self.env_status_frame)
        self.node_frame.pack(fill=tk.X, pady=2)
        self.node_status = self.create_label(self.node_frame, "⚙️ Node.js: Checking...")
        self.node_status.pack(side=tk.LEFT, pady=2)
        self.node_version = self.create_label(self.node_frame, "", font=('Consolas', 9))
        self.node_version.pack(side=tk.RIGHT, pady=2)

        # npm Status
        self.npm_frame = self.create_frame(self.env_status_frame)
        self.npm_frame.pack(fill=tk.X, pady=2)
        self.npm_status = self.create_label(self.npm_frame, "📦 npm: Checking...")
        self.npm_status.pack(side=tk.LEFT, pady=2)
        self.npm_version = self.create_label(self.npm_frame, "", font=('Consolas', 9))
        self.npm_version.pack(side=tk.RIGHT, pady=2)

        # SQLite Status
        self.sqlite_frame = self.create_frame(self.env_status_frame)
        self.sqlite_frame.pack(fill=tk.X, pady=2)
        self.sqlite_status = self.create_label(self.sqlite_frame, "🗄️ SQLite: Checking...")
        self.sqlite_status.pack(side=tk.LEFT, pady=2)
        self.sqlite_version = self.create_label(self.sqlite_frame, "", font=('Consolas', 9))
        self.sqlite_version.pack(side=tk.RIGHT, pady=2)
        # Alias old Postgres label names to SQLite ones for compatibility
        self.postgres_status = self.sqlite_status
        self.postgres_version = self.sqlite_version

        # Environment File Status
        self.env_frame = self.create_frame(self.env_status_frame)
        self.env_frame.pack(fill=tk.X, pady=2)
        self.env_file_status = self.create_label(self.env_frame, "📄 .env: Checking...")
        self.env_file_status.pack(side=tk.LEFT, pady=2)
        self.env_mode = self.create_label(self.env_frame, "", font=('Consolas', 9))
        self.env_mode.pack(side=tk.RIGHT, pady=2)

        # Progress Bar
        self.progress_frame = self.create_frame(env_panel)
        self.progress_frame.pack(fill=tk.X, padx=5, pady=5)
        self.progress_label = self.create_label(self.progress_frame, "")
        self.progress_label.pack(fill=tk.X, pady=(0, 2))
        self.progress_bar = ttk.Progressbar(self.progress_frame, mode='determinate', length=200)
        self.progress_bar.pack(fill=tk.X)

        # Current Operation Status
        self.operation_frame = self.create_frame(env_panel)
        self.operation_frame.pack(fill=tk.X, padx=5, pady=5)
        self.operation_status = self.create_label(self.operation_frame, "Ready", font=('Arial', 10))
        self.operation_status.pack(fill=tk.X)

        # Database Control Panel
        db_panel = self.create_frame(left_column)
        db_panel.pack(fill=tk.X, padx=5, pady=5)

        db_label = self.create_label(db_panel, "🗄️ SQLite Database Controls")
        db_label.pack(pady=5)

        self.migrate_btn = self.create_button(db_panel, "Initialize/Update Database", self.run_migrations)
        self.migrate_btn.pack(fill=tk.X, padx=5, pady=2)

        self.seed_btn = self.create_button(db_panel, "Seed Test Data", self.seed_database)
        self.seed_btn.pack(fill=tk.X, padx=5, pady=2)

        self.backup_btn = self.create_button(db_panel, "Backup Database", self.backup_database)
        self.backup_btn.pack(fill=tk.X, padx=5, pady=2)

        self.reset_db_btn = self.create_button(db_panel, "Reset Database", self.reset_database, 'red')
        self.reset_db_btn.pack(fill=tk.X, padx=5, pady=2)

        # Environment Setup Panel
        setup_panel = self.create_frame(left_column)
        setup_panel.pack(fill=tk.X, padx=5, pady=5)

        setup_label = self.create_label(setup_panel, "⚙️ Setup Tools")
        setup_label.pack(pady=5)

        self.create_env_btn = self.create_button(setup_panel, "Create .env File", self.create_env_file)
        self.create_env_btn.pack(fill=tk.X, padx=5, pady=2)

        self.check_deps_btn = self.create_button(setup_panel, "Check Dependencies", self.check_dependencies)
        self.check_deps_btn.pack(fill=tk.X, padx=5, pady=2)

        self.full_setup_btn = self.create_button(setup_panel, "Full Environment Setup", self.full_setup, 'green')
        self.full_setup_btn.pack(fill=tk.X, padx=5, pady=2)
        
        self.mock_mode_btn = self.create_button(setup_panel, "Start in Mock DB Mode", self.start_mock_mode)
        self.mock_mode_btn.pack(fill=tk.X, padx=5, pady=2)

        # Middle Column (Server Control and Console)
        middle_column = self.create_frame(main_container)
        middle_column.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Server Control Panel
        control_panel = self.create_frame(middle_column)
        control_panel.pack(fill=tk.X, padx=5, pady=5)

        server_label = self.create_label(control_panel, "🚀 Server Controls")
        server_label.pack(pady=5)

        # Server Control Buttons
        server_buttons = self.create_frame(control_panel)
        server_buttons.pack(fill=tk.X, padx=5, pady=5)

        self.start_btn = self.create_button(server_buttons, "Start Server", self.start_server, 'green')
        self.start_btn.pack(side=tk.LEFT, padx=5, pady=5)

        self.stop_btn = self.create_button(server_buttons, "Stop Server", self.stop_server, 'red', state="disabled")
        self.stop_btn.pack(side=tk.LEFT, padx=5, pady=5)

        self.restart_btn = self.create_button(server_buttons, "Restart Server", self.restart_server, state="disabled")
        self.restart_btn.pack(side=tk.LEFT, padx=5, pady=5)

        # Console Output
        console_frame = self.create_frame(middle_column)
        console_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        console_label = self.create_label(console_frame, "📟 Live Console Output")
        console_label.pack(pady=5)

        from tkinter import scrolledtext
        self.console_output = scrolledtext.ScrolledText(
            console_frame,
            wrap=tk.WORD,
            background='black',
            foreground='white',
            font=('Consolas', 10)
        )
        self.console_output.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Right Column (Log Management)
        right_column = self.create_frame(main_container, width=350)
        right_column.pack(side=tk.RIGHT, fill=tk.Y, padx=5, pady=5)
        right_column.pack_propagate(False)

        # Log Management Panel
        log_panel = self.create_frame(right_column)
        log_panel.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        log_label = self.create_label(log_panel, "📋 Log Management")
        log_label.pack(pady=5)

        # Log Actions
        log_actions = self.create_frame(log_panel)
        log_actions.pack(fill=tk.X, padx=5, pady=5)

        refresh_btn = self.create_button(log_actions, "Refresh Logs", self.refresh_logs)
        refresh_btn.pack(side=tk.LEFT, padx=5)

        clear_btn = self.create_button(log_actions, "Clear All Logs", self.clear_logs, 'red')
        clear_btn.pack(side=tk.LEFT, padx=5)

        # Log List
        self.log_list = tk.Listbox(
            log_panel,
            background='black',
            foreground='white',
            selectmode=tk.SINGLE,
            font=('Consolas', 10)
        )
        self.log_list.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.log_list.bind('<Double-Button-1>', self.view_log)

        # Log Content Preview
        preview_label = self.create_label(log_panel, "Log Preview")
        preview_label.pack(pady=5)

        self.log_preview = scrolledtext.ScrolledText(
            log_panel,
            wrap=tk.WORD,
            height=10,
            background='black',
            foreground='white',
            font=('Consolas', 10)
        )
        self.log_preview.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Initial log refresh
        self.refresh_logs()

    def setup_auto_refresh(self):
        def check_queue():
            while True:
                try:
                    line = self.output_queue.get_nowait()
                    self.console_output.insert(tk.END, line)
                    self.console_output.see(tk.END)
                except queue.Empty:
                    break
            self.root.after(100, check_queue)
        
        self.root.after(100, check_queue)

    def output_reader(self, pipe, queue):
        try:
            while True:
                line = pipe.readline()
                if not line:
                    break
                queue.put(line.rstrip() + '\n')  # Normalize line endings
        except Exception as e:
            queue.put(f"Console reader stopped: {str(e)}\n")
        finally:
            try:
                pipe.close()
            except:
                pass

    def start_server(self):
        if not self.is_server_running:
            try:
                # Clear console and update status
                self.console_output.delete(1.0, tk.END)
                self.operation_status.configure(text="🚀 Starting Server")
                self.progress_bar["value"] = 0
                self.progress_label.configure(text="Pre-flight checks...")
                self.root.update()
                
                # Pre-flight checks
                self.console_output.insert(tk.END, "🔍 Running pre-flight checks...\n")
                self.console_output.see(tk.END)
                
                # Check Node.js and npm
                npm_path = find_executable('npm')
                if not npm_path:
                    self.console_output.insert(tk.END, "❌ npm not found. Please install Node.js first.\n")
                    self.operation_status.configure(text="❌ Start Failed")
                    self.progress_label.configure(text="npm not found")
                    messagebox.showerror("Environment Error", "npm not found!\n\nPlease install Node.js and restart your terminal.")
                    return
                
                self.progress_bar["value"] = 20
                self.progress_label.configure(text="Checking environment...")
                self.root.update()
                
                # Check .env file and determine mode
                if not os.path.exists('.env'):
                    self.console_output.insert(tk.END, "❌ .env file missing! Create it first.\n")
                    self.operation_status.configure(text="❌ Start Failed")
                    self.progress_label.configure(text=".env file missing")
                    messagebox.showerror("Environment Error", ".env file is missing!\n\nUse 'Create .env File' or 'Start in Mock DB Mode'")
                    return
                
                # Read .env to determine mode
                try:
                    with open('.env', 'r') as f:
                        env_content = f.read()
                        is_mock_mode = 'USE_MOCK_DB=true' in env_content
                except:
                    self.console_output.insert(tk.END, "⚠️ Warning: Could not read .env file\n")
                    is_mock_mode = False
                
                self.progress_bar["value"] = 40
                self.root.update()
                
                # Check SQLite database
                self.progress_label.configure(text="Checking SQLite database...")
                data_dir = os.path.join(os.getcwd(), 'data')
                if not os.path.exists(data_dir):
                    os.makedirs(data_dir)
                    self.console_output.insert(tk.END, "✅ Created data directory\n")
                else:
                    self.console_output.insert(tk.END, "✅ SQLite database ready\n")
                
                self.progress_bar["value"] = 60
                self.progress_label.configure(text="Starting Node.js server...")
                self.root.update()
                
                # Start the server
                self.console_output.insert(tk.END, f"🚀 Starting server in {'Mock DB' if is_mock_mode else 'SQLite'} mode...\n")
                self.console_output.see(tk.END)
                
                # Find npm executable and start server
                self.server_process = subprocess.Popen(
                    f'"{npm_path}" run dev',
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,  # Combine stderr with stdout
                    stdin=subprocess.PIPE,     # Provide stdin to prevent EPIPE
                    bufsize=0,                 # Unbuffered
                    universal_newlines=True,
                    encoding='utf-8',          # Explicit UTF-8 encoding
                    errors='replace',          # Replace invalid characters
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
                )

                # Start output reader
                threading.Thread(target=self.output_reader, 
                               args=(self.server_process.stdout, self.output_queue), 
                               daemon=True).start()

                self.is_server_running = True
                self.update_button_states()
                
                self.progress_bar["value"] = 100
                self.operation_status.configure(text="✅ Server Running")
                self.progress_label.configure(text="SQLite Mode")
                self.console_output.insert(tk.END, "✅ Server process started. Waiting for initialization...\n")
                self.console_output.insert(tk.END, "💡 Running with SQLite database\n")
                
            except Exception as e:
                self.operation_status.configure(text="❌ Start Failed")
                self.progress_label.configure(text=str(e)[:50])
                messagebox.showerror("Error", f"Failed to start server: {str(e)}")

    def stop_server(self):
        if self.server_process and self.is_server_running:
            try:
                self.console_output.insert(tk.END, "Stopping server...\n")
                self.console_output.see(tk.END)
                
                # On Windows, we need to terminate the process group
                if sys.platform == 'win32':
                    subprocess.run(['taskkill', '/F', '/T', '/PID', str(self.server_process.pid)], 
                                 capture_output=True)
                else:
                    self.server_process.terminate()
                    try:
                        self.server_process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        self.server_process.kill()
                        self.server_process.wait()
                
                self.is_server_running = False
                self.server_process = None
                self.update_button_states()
                self.console_output.insert(tk.END, "Server stopped.\n")
                self.console_output.see(tk.END)
                
            except Exception as e:
                self.console_output.insert(tk.END, f"Error stopping server: {str(e)}\n")
                messagebox.showerror("Error", f"Failed to stop server: {str(e)}")

    def restart_server(self):
        self.stop_server()
        time.sleep(2)  # Wait for ports to be released
        self.start_server()

    def update_button_states(self):
        if self.is_server_running:
            if USE_CUSTOM_TK:
                self.start_btn.configure(state="disabled")
                self.stop_btn.configure(state="normal")
                self.restart_btn.configure(state="normal")
            else:
                self.start_btn.configure(state="disabled")
                self.stop_btn.configure(state="normal")
                self.restart_btn.configure(state="normal")
        else:
            if USE_CUSTOM_TK:
                self.start_btn.configure(state="normal")
                self.stop_btn.configure(state="disabled")
                self.restart_btn.configure(state="disabled")
            else:
                self.start_btn.configure(state="normal")
                self.stop_btn.configure(state="disabled")
                self.restart_btn.configure(state="disabled")

    def refresh_logs(self):
        self.log_list.delete(0, tk.END)
        log_files = glob.glob("debugging/*.log")
        for log_file in sorted(log_files, reverse=True):
            self.log_list.insert(tk.END, os.path.basename(log_file))

    def clear_logs(self):
        if messagebox.askyesno("Confirm", "Are you sure you want to delete all log files?"):
            try:
                log_files = glob.glob("debugging/*.log")
                for log_file in log_files:
                    os.remove(log_file)
                self.refresh_logs()
                self.log_preview.delete(1.0, tk.END)
                messagebox.showinfo("Success", "All log files have been deleted.")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to delete log files: {str(e)}")

    def view_log(self, event):
        selection = self.log_list.curselection()
        if selection:
            log_name = self.log_list.get(selection[0])
            try:
                with open(f"debugging/{log_name}", 'r') as f:
                    content = f.read()
                    self.log_preview.delete(1.0, tk.END)
                    self.log_preview.insert(tk.END, content)
            except Exception as e:
                messagebox.showerror("Error", f"Failed to read log file: {str(e)}")

    def check_environment_status(self):
        """Check the status of various environment components"""
        # Check Node.js and npm
        node_path = find_executable('node')
        npm_path = find_executable('npm')
        
        if node_path:
            try:
                result = run_command_safe([node_path, '--version'], capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    self.node_status.configure(text="⚙️ Node.js: ✅")
                    self.node_version.configure(text=result.stdout.strip())
                else:
                    self.node_status.configure(text="⚙️ Node.js: ❌")
                    self.node_version.configure(text="Error running")
            except:
                self.node_status.configure(text="⚙️ Node.js: ❌")
                self.node_version.configure(text="Error checking")
        else:
            self.node_status.configure(text="⚙️ Node.js: ❌")
            self.node_version.configure(text="Not installed")
        
        if npm_path:
            try:
                result = run_command_safe([npm_path, '--version'], capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    self.npm_status.configure(text="📦 npm: ✅")
                    self.npm_version.configure(text=f"v{result.stdout.strip()}")
                else:
                    self.npm_status.configure(text="📦 npm: ❌")
                    self.npm_version.configure(text="Error running")
            except:
                self.npm_status.configure(text="📦 npm: ❌")
                self.npm_version.configure(text="Error checking")
        else:
            self.npm_status.configure(text="📦 npm: ❌")
            self.npm_version.configure(text="Not found")

        # Check SQLite database
        self.check_sqlite_status()
        
        # Update SQLite status in main panel
        data_dir = os.path.join(os.getcwd(), 'data')
        db_path = os.path.join(data_dir, 'bingo.db')
        if os.path.exists(db_path):
            size = os.path.getsize(db_path) / 1024
            self.sqlite_status.configure(text="🗄️ SQLite: ✅")
            self.sqlite_version.configure(text=f"{size:.1f}KB")
        else:
            self.sqlite_status.configure(text="🗄️ SQLite: ⚠️")
            self.sqlite_version.configure(text="Not initialized")
        
        # Check .env file
        if os.path.exists('.env'):
            self.env_file_status.configure(text="📄 .env: ✅")
            self.env_mode.configure(text="SQLite Mode")
        else:
            self.env_file_status.configure(text="📄 .env: ❌")
            self.env_mode.configure(text="Not configured")

    def check_sqlite_status(self):
        """Check SQLite database status"""
        try:
            data_dir = os.path.join(os.getcwd(), 'data')
            db_path = os.path.join(data_dir, 'bingo.db')
            
            if os.path.exists(db_path):
                size = os.path.getsize(db_path) / 1024  # Convert to KB
                modified = datetime.fromtimestamp(os.path.getmtime(db_path)).strftime('%Y-%m-%d %H:%M')
                self.postgres_status.configure(text="🗄️ SQLite: ✅ Ready")
                self.postgres_version.configure(text=f"{size:.1f}KB, {modified}")
            else:
                self.postgres_status.configure(text="🗄️ SQLite: ⚠️ Not initialized")
                self.postgres_version.configure(text="Run initialization")
                
        except Exception as e:
            self.postgres_status.configure(text="🗄️ SQLite: ❌ Error")
            self.postgres_version.configure(text=str(e)[:30])

    def check_database_status(self):
        """Check database connection status"""
        if os.path.exists('.env'):
            try:
                npm_path = find_executable('npm')
                if not npm_path:
                    self.postgres_status.configure(text="🗄️ Database: ❓ npm not found")
                    self.postgres_version.configure(text="Node.js required")
                    return
                    
                # Simple connection test using npm script
                result = run_command_safe([npm_path, 'run', 'db:check'], 
                                        capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    self.postgres_status.configure(text="🗄️ Database: ✅ Connected")
                    self.postgres_version.configure(text="Ready")
                else:
                    self.postgres_status.configure(text="🗄️ Database: ❌ Connection failed")
                    self.postgres_version.configure(text="Check settings")
            except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
                self.postgres_status.configure(text="🗄️ Database: ❓ Cannot check")
                self.postgres_version.configure(text="Status unknown")
        else:
            self.postgres_status.configure(text="🗄️ Database: ❌ No .env")
            self.postgres_version.configure(text="Create .env first")

    def start_postgres(self):
        """Start PostgreSQL using Docker Compose"""
        try:
            self.console_output.insert(tk.END, "🐳 Starting PostgreSQL container...\n")
            self.console_output.see(tk.END)
            
            docker_path = find_executable('docker')
            if not docker_path:
                self.console_output.insert(tk.END, "❌ Docker not found. Please install Docker Desktop.\n")
                self.console_output.insert(tk.END, "💡 Download from: https://www.docker.com/products/docker-desktop\n")
                return
            
            result = run_command_safe([docker_path, 'compose', 'up', '-d'], 
                                    capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                self.console_output.insert(tk.END, "✅ PostgreSQL started successfully\n")
                self.console_output.insert(tk.END, result.stdout + "\n")
                self.is_postgres_running = True
                self.check_postgres_status()
                time.sleep(2)  # Wait for PostgreSQL to be ready
                self.check_database_status()
            else:
                self.console_output.insert(tk.END, f"❌ Failed to start PostgreSQL:\n{result.stderr}\n")
                
        except subprocess.TimeoutExpired:
            self.console_output.insert(tk.END, "⏰ PostgreSQL startup timed out\n")
        except FileNotFoundError as e:
            self.console_output.insert(tk.END, f"❌ Docker not found: {str(e)}\n")
            self.console_output.insert(tk.END, "💡 Please install Docker Desktop first.\n")
        except Exception as e:
            self.console_output.insert(tk.END, f"❌ Error starting PostgreSQL: {str(e)}\n")
        
        self.console_output.see(tk.END)

    def stop_postgres(self):
        """Stop PostgreSQL container"""
        try:
            self.console_output.insert(tk.END, "🛑 Stopping PostgreSQL container...\n")
            self.console_output.see(tk.END)
            
            result = subprocess.run(['docker', 'compose', 'down'], 
                                  capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                self.console_output.insert(tk.END, "✅ PostgreSQL stopped successfully\n")
                self.is_postgres_running = False
                self.check_postgres_status()
            else:
                self.console_output.insert(tk.END, f"❌ Failed to stop PostgreSQL:\n{result.stderr}\n")
                
        except Exception as e:
            self.console_output.insert(tk.END, f"❌ Error stopping PostgreSQL: {str(e)}\n")
        
        self.console_output.see(tk.END)

    def run_migrations(self):
        """Run database migrations"""
        try:
            self.console_output.insert(tk.END, "🔄 Running database migrations...\n")
            self.console_output.see(tk.END)
            
            npm_path = find_executable('npm')
            if not npm_path:
                self.console_output.insert(tk.END, "❌ npm not found. Node.js installation may be incomplete.\n")
                self.console_output.insert(tk.END, "💡 Try restarting your terminal or reinstalling Node.js\n")
                return
            
            # First install dependencies if needed
            if not os.path.exists('node_modules'):
                self.console_output.insert(tk.END, "📦 Installing dependencies first...\n")
                install_result = run_command_safe([npm_path, 'install'], 
                                                capture_output=True, text=True, timeout=120)
                if install_result.returncode != 0:
                    self.console_output.insert(tk.END, f"❌ Failed to install dependencies:\n{install_result.stderr}\n")
                    return
                self.console_output.insert(tk.END, "✅ Dependencies installed\n")
            
            result = run_command_safe([npm_path, 'run', 'db:push'], 
                                    capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                self.console_output.insert(tk.END, "✅ Migrations completed successfully\n")
                if result.stdout.strip():
                    self.console_output.insert(tk.END, result.stdout + "\n")
                self.check_environment_status()  # Refresh status
            else:
                self.console_output.insert(tk.END, f"❌ Migration failed:\n")
                if result.stderr.strip():
                    self.console_output.insert(tk.END, f"Error: {result.stderr}\n")
                if result.stdout.strip():
                    self.console_output.insert(tk.END, f"Output: {result.stdout}\n")
                self.console_output.insert(tk.END, "💡 Try running 'npm install' first or check your Node.js installation\n")
                
        except subprocess.TimeoutExpired:
            self.console_output.insert(tk.END, "⏰ Migration timed out\n")
        except FileNotFoundError as e:
            self.console_output.insert(tk.END, f"❌ Command not found: {str(e)}\n")
        except Exception as e:
            self.console_output.insert(tk.END, f"❌ Error running migrations: {str(e)}\n")
        
        self.console_output.see(tk.END)

    def seed_database(self):
        """Seed the database with initial data"""
        try:
            self.console_output.insert(tk.END, "🌱 Seeding database with initial data...\n")
            self.console_output.see(tk.END)
            
            npm_path = find_executable('npm')
            if not npm_path:
                self.console_output.insert(tk.END, "❌ npm not found. Node.js installation may be incomplete.\n")
                self.console_output.insert(tk.END, "💡 Try restarting your terminal or reinstalling Node.js\n")
                return
            
            result = run_command_safe([npm_path, 'run', 'db:seed'], 
                                    capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                self.console_output.insert(tk.END, "✅ Database seeded successfully\n")
                if result.stdout.strip():
                    self.console_output.insert(tk.END, result.stdout + "\n")
            else:
                self.console_output.insert(tk.END, f"❌ Seeding failed:\n")
                if result.stderr.strip():
                    self.console_output.insert(tk.END, f"Error: {result.stderr}\n")
                if result.stdout.strip():
                    self.console_output.insert(tk.END, f"Output: {result.stdout}\n")
                
        except FileNotFoundError as e:
            self.console_output.insert(tk.END, f"❌ Command not found: {str(e)}\n")
        except Exception as e:
            self.console_output.insert(tk.END, f"❌ Error seeding database: {str(e)}\n")
        
        self.console_output.see(tk.END)

    def backup_database(self):
        """Backup the SQLite database"""
        try:
            data_dir = os.path.join(os.getcwd(), 'data')
            db_path = os.path.join(data_dir, 'bingo.db')
            
            if not os.path.exists(db_path):
                messagebox.showerror("Backup Error", "Database file not found!\nInitialize the database first.")
                return
            
            # Create backups directory if it doesn't exist
            backup_dir = os.path.join(data_dir, 'backups')
            if not os.path.exists(backup_dir):
                os.makedirs(backup_dir)
            
            # Create backup filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_path = os.path.join(backup_dir, f'bingo_backup_{timestamp}.db')
            
            # Copy database file
            import shutil
            shutil.copy2(db_path, backup_path)
            
            size_kb = os.path.getsize(backup_path) / 1024
            self.console_output.insert(tk.END, f"✅ Database backed up successfully!\n")
            self.console_output.insert(tk.END, f"📁 Location: {backup_path}\n")
            self.console_output.insert(tk.END, f"📊 Size: {size_kb:.1f}KB\n")
            
            messagebox.showinfo("Backup Complete", 
                              f"Database backed up successfully!\nSize: {size_kb:.1f}KB\nLocation: {backup_path}")
            
        except Exception as e:
            self.console_output.insert(tk.END, f"❌ Backup failed: {str(e)}\n")
            messagebox.showerror("Backup Error", f"Failed to backup database:\n{str(e)}")
        
        self.console_output.see(tk.END)
    
    def reset_database(self):
        """Reset the SQLite database"""
        if messagebox.askyesno("Confirm Reset", 
                             "⚠️ This will DELETE ALL DATA in the database.\n\n" +
                             "A backup will be created first.\n\n" +
                             "Are you sure you want to continue?"):
            try:
                self.console_output.insert(tk.END, "🔄 Resetting database...\n")
                self.console_output.see(tk.END)
                
                # Stop server first if running
                if self.is_server_running:
                    self.console_output.insert(tk.END, "🛑 Stopping server first...\n")
                    self.stop_server()
                    time.sleep(2)
                
                # Create backup first
                self.backup_database()
                
                # Delete database file
                data_dir = os.path.join(os.getcwd(), 'data')
                db_path = os.path.join(data_dir, 'bingo.db')
                if os.path.exists(db_path):
                    os.remove(db_path)
                
                # Run migrations to recreate database
                self.run_migrations()
                time.sleep(1)
                
                # Seed with fresh data
                self.seed_database()
                
                self.console_output.insert(tk.END, "✅ Database reset completed!\n")
                messagebox.showinfo("Reset Complete", "Database has been reset and reinitialized with fresh data.")
                
            except Exception as e:
                self.console_output.insert(tk.END, f"❌ Error resetting database: {str(e)}\n")
                messagebox.showerror("Reset Error", f"Failed to reset database:\n{str(e)}")
            
            self.console_output.see(tk.END)

    def create_env_file(self):
        """Create a .env file with SQLite settings"""
        if os.path.exists('.env'):
            if not messagebox.askyesno("File Exists", ".env file already exists.\n\nDo you want to overwrite it?"):
                return
        
        try:
            # Generate a random JWT secret
            import secrets
            jwt_secret = secrets.token_hex(32)
            
            env_content = f"""# Server Configuration
PORT=5000
JWT_SECRET={jwt_secret}

# Development Settings
NODE_ENV=development

# Database Settings
DB_TYPE=sqlite
"""
            
            with open('.env', 'w') as f:
                f.write(env_content)
            
            # Create data directory if it doesn't exist
            data_dir = os.path.join(os.getcwd(), 'data')
            if not os.path.exists(data_dir):
                os.makedirs(data_dir)
            
            self.console_output.insert(tk.END, "✅ Environment configured for SQLite\n")
            self.console_output.insert(tk.END, "📁 Database location: ./data/bingo.db\n")
            self.console_output.insert(tk.END, "🔑 New JWT secret generated\n")
            self.check_environment_status()
            
            messagebox.showinfo("Setup Complete", 
                              "Environment configured for SQLite!\n\n" +
                              "Next steps:\n" +
                              "1. Click 'Initialize/Update Database'\n" +
                              "2. Click 'Seed Test Data'\n" +
                              "3. Start the server")
            
        except Exception as e:
            self.console_output.insert(tk.END, f"❌ Error creating .env file: {str(e)}\n")
            messagebox.showerror("Error", f"Failed to create .env file: {str(e)}")
        
        self.console_output.see(tk.END)

    def check_dependencies(self):
        """Check if all required dependencies are installed"""
        try:
            self.operation_status.configure(text="🔍 Checking Dependencies...")
            self.progress_bar["value"] = 0
            self.progress_label.configure(text="Starting dependency check...")
            self.root.update()
            
            total_checks = 6  # Node.js, npm, Docker, Docker Compose, package.json, node_modules
            current_check = 0
            
            def update_progress(step_name):
                nonlocal current_check
                current_check += 1
                self.progress_bar["value"] = (current_check / total_checks) * 100
                self.progress_label.configure(text=f"Checking {step_name}...")
                self.root.update()
            
            # Check Node.js
            update_progress("Node.js")
            node_path = find_executable('node')
            if node_path:
                try:
                    result = run_command_safe([node_path, '--version'], capture_output=True, text=True, timeout=5)
                    if result.returncode == 0:
                        version = result.stdout.strip()
                        self.node_status.configure(text="⚙️ Node.js: ✅")
                        self.node_version.configure(text=f"{version}")
                        self.console_output.insert(tk.END, f"✅ Node.js: {version} (at {node_path})\n")
                    else:
                        self.node_status.configure(text="⚙️ Node.js: ❌ Error")
                        self.node_version.configure(text="Not working")
                except:
                    self.node_status.configure(text="⚙️ Node.js: ❌ Error")
                    self.node_version.configure(text="Runtime error")
            else:
                self.node_status.configure(text="⚙️ Node.js: ❌ Missing")
                self.node_version.configure(text="Download required")
                self.console_output.insert(tk.END, "❌ Node.js: Not found in PATH\n")
                self.console_output.insert(tk.END, "💡 Download from: https://nodejs.org/\n")
            
            # Check npm
            update_progress("npm")
            npm_path = find_executable('npm')
            if npm_path:
                try:
                    result = run_command_safe([npm_path, '--version'], capture_output=True, text=True, timeout=5)
                    if result.returncode == 0:
                        version = result.stdout.strip()
                        self.npm_status.configure(text="📦 npm: ✅")
                        self.npm_version.configure(text=f"v{version}")
                        self.console_output.insert(tk.END, f"✅ npm: {version} (at {npm_path})\n")
                    else:
                        self.npm_status.configure(text="📦 npm: ❌ Error")
                        self.npm_version.configure(text="Not working")
                except:
                    self.npm_status.configure(text="📦 npm: ❌ Error")
                    self.npm_version.configure(text="Runtime error")
            else:
                self.npm_status.configure(text="📦 npm: ❌ Missing")
                self.npm_version.configure(text="Restart terminal")
                self.console_output.insert(tk.END, "❌ npm: Not found in PATH\n")
                self.console_output.insert(tk.END, "💡 npm comes with Node.js - try restarting terminal\n")
            
            # Check SQLite
            update_progress("SQLite Database")
            data_dir = os.path.join(os.getcwd(), 'data')
            db_path = os.path.join(data_dir, 'bingo.db')
            if os.path.exists(db_path):
                size = os.path.getsize(db_path) / 1024
                modified = datetime.fromtimestamp(os.path.getmtime(db_path)).strftime('%Y-%m-%d %H:%M')
                self.sqlite_status.configure(text="🗄️ SQLite: ✅")
                self.sqlite_version.configure(text=f"{size:.1f}KB")
                self.postgres_status.configure(text="🗄️ Database: ✅ Ready")
                self.postgres_version.configure(text=f"{size:.1f}KB, {modified}")
                self.console_output.insert(tk.END, f"✅ SQLite Database: {size:.1f}KB (last modified: {modified})\n")
            else:
                self.sqlite_status.configure(text="🗄️ SQLite: ⚠️")
                self.sqlite_version.configure(text="Not initialized")
                self.postgres_status.configure(text="🗄️ Database: ⚠️ Not initialized")
                self.postgres_version.configure(text="Run initialization")
                self.console_output.insert(tk.END, "⚠️ SQLite Database: Not initialized (run migrations first)\n")
            
            # Check package.json
            update_progress("package.json")
            if os.path.exists('package.json'):
                self.console_output.insert(tk.END, "✅ package.json: Found\n")
            else:
                self.console_output.insert(tk.END, "❌ package.json: Not found\n")
            
            # Check node_modules
            update_progress("node_modules")
            if os.path.exists('node_modules'):
                self.console_output.insert(tk.END, "✅ node_modules: Found\n")
            else:
                self.console_output.insert(tk.END, "❌ node_modules: Not found (run 'npm install')\n")
            
            # Check .env and determine mode
            if os.path.exists('.env'):
                try:
                    with open('.env', 'r') as f:
                        env_content = f.read()
                        if 'USE_MOCK_DB=true' in env_content:
                            self.env_file_status.configure(text="📄 .env: ✅")
                            self.env_mode.configure(text="Mock DB Mode")
                        else:
                            self.env_file_status.configure(text="📄 .env: ✅")
                            self.env_mode.configure(text="SQLite Mode")
                except:
                    self.env_file_status.configure(text="📄 .env: ⚠️")
                    self.env_mode.configure(text="Read error")
            else:
                self.env_file_status.configure(text="📄 .env: ❌")
                self.env_mode.configure(text="Not found")
            
            # Summary and recommendations
            self.console_output.insert(tk.END, "\n💡 Setup Guide:\n")
            missing_deps = []
            if not node_path:
                missing_deps.append("Node.js (https://nodejs.org/)")
            if node_path and not npm_path:
                missing_deps.append("Restart terminal for npm")
            if not os.path.exists(db_path):
                missing_deps.append("Initialize database (click 'Initialize/Update Database')")
            
            if missing_deps:
                self.operation_status.configure(text="⚠️ Setup Required")
                self.console_output.insert(tk.END, "Required actions:\n")
                for i, dep in enumerate(missing_deps, 1):
                    self.console_output.insert(tk.END, f"{i}. {dep}\n")
            else:
                self.operation_status.configure(text="✅ Environment Ready")
            
            self.progress_bar["value"] = 100
            self.progress_label.configure(text="Dependency check complete")
                
        except Exception as e:
            self.console_output.insert(tk.END, f"❌ Error checking dependencies: {str(e)}\n")
            self.operation_status.configure(text="❌ Check Failed")
            self.progress_label.configure(text="Error during dependency check")
        
        self.console_output.see(tk.END)
        self.root.update()

    def full_setup(self):
        """Perform a complete environment setup"""
        if messagebox.askyesno("Full Setup", 
                             "This will set up the SQLite environment:\n\n" +
                             "1️⃣ Create .env file\n" +
                             "2️⃣ Install npm dependencies\n" +
                             "3️⃣ Initialize SQLite database\n" +
                             "4️⃣ Run database migrations\n" +
                             "5️⃣ Seed initial data\n\n" +
                             "✅ No Docker required!\n\n" +
                             "Continue?"):
            
            self.operation_status.configure(text="🚀 Starting Full Setup")
            self.progress_bar["value"] = 0
            self.progress_label.configure(text="Initializing setup...")
            self.console_output.insert(tk.END, "🚀 Starting full environment setup...\n")
            self.console_output.see(tk.END)
            self.root.update()
            
            total_steps = 5
            current_step = 0
            
            def update_progress(step_name, progress_text):
                nonlocal current_step
                current_step += 1
                self.progress_bar["value"] = (current_step / total_steps) * 100
                self.operation_status.configure(text=f"Step {current_step}/{total_steps}: {step_name}")
                self.progress_label.configure(text=progress_text)
                self.root.update()
            
            try:
                # Step 1: Create .env file
                update_progress("Environment File", "Creating .env configuration...")
                if not os.path.exists('.env'):
                    self.create_env_file()
                    time.sleep(1)
                else:
                    self.console_output.insert(tk.END, "✅ Using existing .env file\n")
                
                # Step 2: Install dependencies
                update_progress("Dependencies", "Installing npm packages...")
                npm_path = find_executable('npm')
                if not npm_path:
                    self.console_output.insert(tk.END, "❌ npm not found. Please install Node.js first.\n")
                    self.operation_status.configure(text="❌ Setup Failed")
                    self.progress_label.configure(text="npm not found - install Node.js")
                    return
                    
                try:
                    self.console_output.insert(tk.END, "📦 Installing npm dependencies...\n")
                    self.console_output.see(tk.END)
                    
                    result = run_command_safe([npm_path, 'install'], 
                                            capture_output=True, text=True, timeout=120)
                    
                    if result.returncode == 0:
                        self.console_output.insert(tk.END, "✅ Dependencies installed\n")
                    else:
                        self.console_output.insert(tk.END, f"❌ npm install failed:\n{result.stderr}\n")
                        self.operation_status.configure(text="❌ Setup Failed")
                        self.progress_label.configure(text="npm install failed")
                        return
                        
                except Exception as e:
                    self.console_output.insert(tk.END, f"❌ Error installing dependencies: {str(e)}\n")
                    self.operation_status.configure(text="❌ Setup Failed")
                    self.progress_label.configure(text="Dependency installation error")
                    return
                
                # Step 3: Initialize SQLite Database
                update_progress("SQLite Database", "Creating database directory...")
                data_dir = os.path.join(os.getcwd(), 'data')
                if not os.path.exists(data_dir):
                    os.makedirs(data_dir)
                    self.console_output.insert(tk.END, "✅ Created data directory\n")
                else:
                    self.console_output.insert(tk.END, "✅ Data directory exists\n")
                
                # Step 4: Run migrations
                update_progress("Database Schema", "Running migrations...")
                self.run_migrations()
                time.sleep(2)
                
                # Step 5: Seed database
                update_progress("Initial Data", "Seeding database...")
                self.seed_database()
                
                # Success!
                self.operation_status.configure(text="✅ Setup Complete")
                self.progress_label.configure(text="Environment ready!")
                self.console_output.insert(tk.END, "\n🎉 Full setup completed successfully!\n")
                self.console_output.insert(tk.END, "💡 You can now start the server with SQLite.\n")
                self.console_output.see(tk.END)
                
                # Refresh status
                self.check_environment_status()
                
            except Exception as e:
                self.console_output.insert(tk.END, f"❌ Setup error: {str(e)}\n")
                self.operation_status.configure(text="❌ Setup Failed")
                self.progress_label.configure(text=f"Error: {str(e)[:50]}...")
                self.console_output.see(tk.END)

    def start_mock_mode(self):
        """Start the server in mock database mode (no SQLite required)"""
        if messagebox.askyesno("Mock Database Mode", 
                             "This will start the server using the in-memory mock database.\n\n" +
                             "✅ No SQLite file required\n" +
                             "⚠️ Data will be lost when server restarts\n" +
                             "🎯 Good for development and testing\n\n" +
                             "Continue?"):
            
            self.console_output.insert(tk.END, "🔧 Setting up Mock Database Mode...\n")
            self.console_output.see(tk.END)
            
            # Create .env file with mock database enabled
            try:
                env_content = """DATABASE_URL=postgresql://user:password@host:port/db
USE_MOCK_DB=true

PORT=5000
JWT_SECRET=9e16c58f0c0f120a9179dba6227b4c4688ca3435a1e0e2c1c43d2e959ef2c4b0

# Development Settings
NODE_ENV=development
"""
                
                with open('.env', 'w') as f:
                    f.write(env_content)
                
                self.console_output.insert(tk.END, "✅ .env file configured for Mock Database Mode\n")
                self.console_output.insert(tk.END, "🔧 USE_MOCK_DB=true set\n")
                
            except Exception as e:
                self.console_output.insert(tk.END, f"❌ Error creating .env file: {str(e)}\n")
                return
            
            # Install dependencies if needed
            npm_path = find_executable('npm')
            if npm_path and not os.path.exists('node_modules'):
                try:
                    self.console_output.insert(tk.END, "📦 Installing npm dependencies...\n")
                    self.console_output.see(tk.END)
                    
                    result = run_command_safe([npm_path, 'install'], 
                                            capture_output=True, text=True, timeout=120)
                    
                    if result.returncode == 0:
                        self.console_output.insert(tk.END, "✅ Dependencies installed\n")
                    else:
                        self.console_output.insert(tk.END, f"❌ npm install failed:\n{result.stderr}\n")
                        return
                        
                except Exception as e:
                    self.console_output.insert(tk.END, f"❌ Error installing dependencies: {str(e)}\n")
                    return
            
            # Update status
            self.check_environment_status()
            
            self.console_output.insert(tk.END, "🎉 Mock Database Mode ready! You can now start the server.\n")
            self.console_output.insert(tk.END, "💡 The server will use in-memory database with test data.\n")
            self.console_output.see(tk.END)

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = ServerManagerGUI()
    app.run()