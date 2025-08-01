import tkinter as tk
from tkinter import messagebox, simpledialog, filedialog
import json
import os

# --- DataFileManager for multi-file support ---
class DataFileManager:
    def __init__(self, initial_file=None):
        self.file = initial_file or "maps.json"
    def load(self):
        if not os.path.exists(self.file):
            return []
        with open(self.file, "r", encoding="utf-8") as f:
            return json.load(f)
    def save(self, data):
        with open(self.file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    def set_file(self, file):
        self.file = file

class JSONEditor(tk.Tk):
    def __init__(self):
        super().__init__()
        self.file_manager = DataFileManager()
        self.data = self.file_manager.load()
        self.selected = None
        self.title(f"Media Collection JSON Editor - {os.path.basename(self.file_manager.file)}")
        self.geometry("1400x800")

        # Menu for file switching
        menubar = tk.Menu(self)
        filemenu = tk.Menu(menubar, tearoff=0)
        filemenu.add_command(label="Open...", command=self.open_file)
        filemenu.add_command(label="New File", command=self.new_file)
        menubar.add_cascade(label="File", menu=filemenu)
        self.config(menu=menubar)

        # Listbox
        self.listbox = tk.Listbox(self, width=35)
        self.listbox.pack(side=tk.LEFT, fill=tk.Y, padx=5, pady=5)
        self.listbox.bind("<<ListboxSelect>>", self.on_select)

        # Form
        self.form_frame = tk.Frame(self)
        self.form_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)


        self.fields = [
            "id", "title", "category", "type", "src",
            "label", "labelType", "mapCreator", "location",
            "download", "videoSrc", "pin"
        ]
        self.entries = {}
        row = 0
        for field in self.fields:
            tk.Label(self.form_frame, text=field).grid(row=row, column=0, sticky="e")
            if field == "id":
                entry = tk.Entry(self.form_frame, width=20, state="readonly")
            elif field == "category":
                entry = tk.StringVar()
                dropdown = tk.OptionMenu(self.form_frame, entry, "maps", "clothing", "vehicles", "others")
                dropdown.config(width=38)
                dropdown.grid(row=row, column=1, sticky="w")
                self.entries[field] = entry
                row += 1
                continue
            elif field == "type":
                entry = tk.StringVar()
                dropdown = tk.OptionMenu(self.form_frame, entry, "image", "video")
                dropdown.config(width=38)
                dropdown.grid(row=row, column=1, sticky="w")
                self.entries[field] = entry
                row += 1
                continue
            elif field == "label":
                entry = tk.StringVar()
                dropdown = tk.OptionMenu(self.form_frame, entry, "PAID", "FREE", "CUSTOM")
                dropdown.config(width=38)
                dropdown.grid(row=row, column=1, sticky="w")
                self.entries[field] = entry
                row += 1
                continue
            elif field == "location":
                entry = tk.Entry(self.form_frame, width=60)
                entry.insert(0, "vec3(x, y, z)")
            else:
                entry = tk.Entry(self.form_frame, width=60)
            entry.grid(row=row, column=1, sticky="w")
            self.entries[field] = entry
            row += 1

        # Multi-line for description/info
        for field in ["description", "info"]:
            tk.Label(self.form_frame, text=field).grid(row=row, column=0, sticky="ne")
            text = tk.Text(self.form_frame, width=45, height=3)
            text.grid(row=row, column=1, sticky="w")
            self.entries[field] = text
            row += 1

        # Tag/attribute management
        for field in ["tags", "attributes"]:
            tk.Label(self.form_frame, text=field).grid(row=row, column=0, sticky="ne")
            frame = tk.Frame(self.form_frame)
            frame.grid(row=row, column=1, sticky="w")
            listbox = tk.Listbox(frame, height=3, width=40, selectmode=tk.SINGLE)
            listbox.pack(side=tk.LEFT)
            btns = tk.Frame(frame)
            btns.pack(side=tk.LEFT, padx=2)
            tk.Button(btns, text="+", width=2, command=lambda f=field: self.add_tag_attr(f)).pack()
            tk.Button(btns, text="-", width=2, command=lambda f=field: self.remove_tag_attr(f)).pack()
            self.entries[field] = listbox
            row += 1

        # Media preview
        self.preview_label = tk.Label(self.form_frame, text="Media Preview:")
        self.preview_label.grid(row=row, column=0, sticky="ne")
        self.preview = tk.Label(self.form_frame, text="(No preview)", width=45, height=5, bg="#eee")
        self.preview.grid(row=row, column=1, sticky="w")
        row += 1

        # Search/filter
        search_frame = tk.Frame(self)
        search_frame.pack(fill=tk.X, padx=5, pady=2)
        tk.Label(search_frame, text="Search:").pack(side=tk.LEFT)
        self.search_var = tk.StringVar()
        self.search_var.trace_add('write', self.do_search)
        tk.Entry(search_frame, textvariable=self.search_var, width=30).pack(side=tk.LEFT)
        tk.Button(search_frame, text="Clear", command=lambda: self.search_var.set("")).pack(side=tk.LEFT)

        # Undo/redo
        self.undo_stack = []
        self.redo_stack = []


        # Buttons (only one set)
        btn_frame = tk.Frame(self.form_frame)
        btn_frame.grid(row=row, column=0, columnspan=2, pady=10)
        tk.Button(btn_frame, text="Add New", command=self.add_new).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Save", command=self.save_entry).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Delete", command=self.delete_entry).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Duplicate", command=self.duplicate_entry).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Undo", command=self.undo).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Redo", command=self.redo).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Import", command=self.import_json).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Export", command=self.export_json).pack(side=tk.LEFT, padx=2)
        tk.Button(btn_frame, text="Reload", command=self.reload_data).pack(side=tk.LEFT, padx=2)

        self.refresh_list()

    def refresh_list(self, filtered=None):
        self.listbox.delete(0, tk.END)
        data = filtered if filtered is not None else self.data
        for item in data:
            self.listbox.insert(tk.END, item.get("title", "Untitled"))
        self.filtered = data

    def on_select(self, event):
        idx = self.listbox.curselection()
        if not idx:
            return
        idx = idx[0]
        self.selected = idx
        item = self.filtered[idx] if hasattr(self, 'filtered') and self.filtered is not self.data else self.data[idx]
        for field in self.fields:
            if field in ["category", "type", "label"]:
                val = item.get(field, "")
                if isinstance(self.entries[field], tk.StringVar):
                    self.entries[field].set(val)
            else:
                self.entries[field].config(state="normal")
                self.entries[field].delete(0, tk.END)
                if field == "id":
                    self.entries[field].insert(0, str(item.get(field, "")))
                    self.entries[field].config(state="readonly")
                elif field == "mapCreator":
                    val = item.get(field, "")
                    if isinstance(val, list):
                        val = ", ".join(val)
                    self.entries[field].insert(0, val)
                elif field == "location":
                    self.entries[field].insert(0, item.get(field, ""))
                else:
                    self.entries[field].insert(0, item.get(field, ""))
        for field in ["description", "info"]:
            self.entries[field].delete("1.0", tk.END)
            self.entries[field].insert("1.0", item.get(field, ""))
        for field in ["tags", "attributes"]:
            self.entries[field].delete(0, tk.END)
            for v in item.get(field, []):
                self.entries[field].insert(tk.END, v)
        # Media preview
        src = item.get("src", "")
        if src:
            if src.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                try:
                    from urllib.request import urlopen
                    from PIL import Image, ImageTk
                    import io
                    with urlopen(src) as u:
                        raw = u.read()
                    im = Image.open(io.BytesIO(raw)).resize((180, 100))
                    imtk = ImageTk.PhotoImage(im)
                    self.preview.configure(image=imtk, text="")
                    self.preview.image = imtk
                except Exception:
                    self.preview.configure(image="", text="(Image preview failed)")
                    self.preview.image = None
            else:
                self.preview.configure(image="", text="(Video/Other: " + src + ")")
                self.preview.image = None
        else:
            self.preview.configure(image="", text="(No preview)")
            self.preview.image = None

    def save_entry(self):
        if self.selected is None:
            messagebox.showwarning("No selection", "Select an entry to save or use 'Add New'.")
            return
        # Validation
        if not self.entries["title"].get().strip():
            messagebox.showerror("Validation", "Title is required.")
            return
        item = {}
        for field in self.fields:
            if field == "id":
                # Always keep id as int if possible
                try:
                    item[field] = int(self.entries[field].get())
                except Exception:
                    item[field] = self.entries[field].get()
            elif field in ["category", "type", "label"]:
                item[field] = self.entries[field].get()
            elif field == "mapCreator":
                # Always save as string
                item[field] = str(self.entries[field].get()).strip()
            elif field == "location":
                item[field] = self.entries[field].get().strip()
            else:
                item[field] = self.entries[field].get()
        for field in ["description", "info"]:
            item[field] = self.entries[field].get("1.0", tk.END).strip()
        for field in ["tags", "attributes"]:
            item[field] = [self.entries[field].get(idx) for idx in range(self.entries[field].size())]
        # Auto-embed videoSrc if src is a YouTube link and videoSrc is empty or not an embed
        def youtube_to_embed(url):
            import re
            # Match normal YouTube URLs with possible extra params
            m = re.match(r"https?://(?:www\.)?youtube\.com/watch\?v=([\w-]+)", url)
            if m:
                return f"https://www.youtube.com/embed/{m.group(1)}"
            # Match youtu.be short links
            m = re.match(r"https?://youtu\.be/([\w-]+)", url)
            if m:
                return f"https://www.youtube.com/embed/{m.group(1)}"
            # Try to extract v= param from any YouTube URL
            m = re.search(r"[?&]v=([\w-]+)", url)
            if m:
                return f"https://www.youtube.com/embed/{m.group(1)}"
            # Already embed
            if "youtube.com/embed/" in url:
                return url
            return ""
        # Only auto-set videoSrc if it's empty or not already an embed
        if (not item.get("videoSrc") or not str(item.get("videoSrc")).startswith("https://www.youtube.com/embed/")):
            if item.get("src", "").startswith("http") and ("youtube.com" in item["src"] or "youtu.be" in item["src"]):
                embed = youtube_to_embed(item["src"])
                if embed:
                    item["videoSrc"] = embed
        # URL validation
        if item["src"] and not (item["src"].startswith("http://") or item["src"].startswith("https://")):
            messagebox.showerror("Validation", "src should be a valid URL.")
            return
        # Undo stack
        self.undo_stack.append(json.dumps(self.data, ensure_ascii=False))
        self.redo_stack.clear()
        # Save
        idx = self.selected if (not hasattr(self, 'filtered') or self.filtered is self.data) else self.data.index(self.filtered[self.selected])
        self.data[idx] = item
        self.file_manager.save(self.data)
        self.refresh_list()
        messagebox.showinfo("Saved", "Entry saved.")

    def add_new(self):
        # All possible fields for a map entry
        all_fields = [
            "id", "title", "category", "type", "src", "label", "labelType", "mapCreator", "location",
            "description", "info", "tags", "attributes", "download", "videoSrc", "pin"
        ]
        item = {field: "" for field in all_fields}
        # Set default for list fields
        item["tags"] = []
        item["attributes"] = []
        # Auto-increment id, always treat as int
        def to_int(val):
            try:
                return int(val)
            except Exception:
                return 0
        max_id = max([to_int(i.get("id", 0)) for i in self.data], default=0)
        item["id"] = max_id + 1
        # Auto-embed videoSrc if src is a YouTube link
        def youtube_to_embed(url):
            import re
            m = re.match(r"https?://(?:www\.)?youtube\.com/watch\?v=([\w-]+)", url)
            if m:
                return f"https://www.youtube.com/embed/{m.group(1)}"
            m = re.match(r"https?://youtu\.be/([\w-]+)", url)
            if m:
                return f"https://www.youtube.com/embed/{m.group(1)}"
            if "youtube.com/embed/" in url:
                return url
            return ""
        if item.get("src", "").startswith("http") and ("youtube.com" in item["src"] or "youtu.be" in item["src"]):
            embed = youtube_to_embed(item["src"])
            if embed:
                item["videoSrc"] = embed
        self.undo_stack.append(json.dumps(self.data, ensure_ascii=False))
        self.redo_stack.clear()
        self.data.append(item)
        self.refresh_list()
        self.listbox.select_set(tk.END)
        self.on_select(None)

    def delete_entry(self):
        if self.selected is None:
            return
        idx = self.selected if (not hasattr(self, 'filtered') or self.filtered is self.data) else self.data.index(self.filtered[self.selected])
        if messagebox.askyesno("Delete", "Delete this entry?"):
            self.undo_stack.append(json.dumps(self.data, ensure_ascii=False))
            self.redo_stack.clear()
            del self.data[idx]
            self.file_manager.save(self.data)
            self.selected = None
            self.refresh_list()
            for entry in self.entries.values():
                if isinstance(entry, tk.Entry):
                    entry.delete(0, tk.END)
                elif isinstance(entry, tk.Text):
                    entry.delete("1.0", tk.END)
                elif isinstance(entry, tk.Listbox):
                    entry.delete(0, tk.END)
    def duplicate_entry(self):
        if self.selected is None:
            return
        # Always get the correct index in self.data
        idx = self.selected
        if hasattr(self, 'filtered') and self.filtered is not self.data:
            # Find the item in the main data list
            item_to_copy = self.filtered[self.selected]
            try:
                idx = self.data.index(item_to_copy)
            except ValueError:
                return
        else:
            item_to_copy = self.data[idx]
        import copy
        item = copy.deepcopy(item_to_copy)
        item["title"] = str(item.get("title", "")) + " (Copy)"
        # Assign new id
        def to_int(val):
            try:
                return int(val)
            except Exception:
                return 0
        max_id = max([to_int(i.get("id", 0)) for i in self.data], default=0)
        item["id"] = max_id + 1
        self.undo_stack.append(json.dumps(self.data, ensure_ascii=False))
        self.redo_stack.clear()
        self.data.append(item)
        self.file_manager.save(self.data)
        self.refresh_list()
        self.listbox.select_set(tk.END)
        self.on_select(None)
    def undo(self):
        if not self.undo_stack:
            return
        self.redo_stack.append(json.dumps(self.data, ensure_ascii=False))
        prev = self.undo_stack.pop()
        self.data = json.loads(prev)
        self.file_manager.save(self.data)
        self.selected = None
        self.refresh_list()
        for entry in self.entries.values():
            if isinstance(entry, tk.Entry):
                entry.delete(0, tk.END)
            elif isinstance(entry, tk.Text):
                entry.delete("1.0", tk.END)
            elif isinstance(entry, tk.Listbox):
                entry.delete(0, tk.END)

    def redo(self):
        if not self.redo_stack:
            return
        self.undo_stack.append(json.dumps(self.data, ensure_ascii=False))
        next_ = self.redo_stack.pop()
        self.data = json.loads(next_)
        self.file_manager.save(self.data)
        self.selected = None
        self.refresh_list()
        for entry in self.entries.values():
            if isinstance(entry, tk.Entry):
                entry.delete(0, tk.END)
            elif isinstance(entry, tk.Text):
                entry.delete("1.0", tk.END)
            elif isinstance(entry, tk.Listbox):
                entry.delete(0, tk.END)

    def import_json(self):
        path = filedialog.askopenfilename(filetypes=[("JSON Files", "*.json")])
        if not path:
            return
        with open(path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        self.file_manager.save(self.data)
        self.selected = None
        self.refresh_list()

    def export_json(self):
        path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON Files", "*.json")])
        if not path:
            return
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)

    def add_tag_attr(self, field):
        val = simpledialog.askstring("Add {}".format(field), "Enter value(s) (comma-separated for multiple):")
        if val:
            for v in [x.strip() for x in val.split(",") if x.strip()]:
                self.entries[field].insert(tk.END, v)

    def remove_tag_attr(self, field):
        sel = self.entries[field].curselection()
        if sel:
            self.entries[field].delete(sel[0])

    def do_search(self, *args):
        q = self.search_var.get().lower()
        if not q:
            self.refresh_list()
            return
        filtered = [item for item in self.data if q in item.get("title", "").lower() or q in item.get("category", "").lower() or any(q in tag.lower() for tag in item.get("tags", []))]
        self.refresh_list(filtered)

    def reload_data(self):
        self.data = self.file_manager.load()
        self.selected = None
        self.refresh_list()
        for entry in self.entries.values():
            entry.delete(0, tk.END)

    def update_title(self):
        self.title(f"Media Collection JSON Editor - {os.path.basename(self.file_manager.file)}")

    def open_file(self):
        path = filedialog.askopenfilename(filetypes=[("JSON Files", "*.json")])
        if not path:
            return
        self.file_manager.set_file(path)
        self.data = self.file_manager.load()
        self.selected = None
        self.refresh_list()
        self.update_title()
        for entry in self.entries.values():
            if isinstance(entry, tk.Entry):
                entry.delete(0, tk.END)
            elif isinstance(entry, tk.Text):
                entry.delete("1.0", tk.END)
            elif isinstance(entry, tk.Listbox):
                entry.delete(0, tk.END)

    def new_file(self):
        path = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON Files", "*.json")])
        if not path:
            return
        self.file_manager.set_file(path)
        self.data = []
        self.selected = None
        self.refresh_list()
        self.update_title()
        for entry in self.entries.values():
            if isinstance(entry, tk.Entry):
                entry.delete(0, tk.END)
            elif isinstance(entry, tk.Text):
                entry.delete("1.0", tk.END)
            elif isinstance(entry, tk.Listbox):
                entry.delete(0, tk.END)

if __name__ == "__main__":
    app = JSONEditor()
    app.mainloop()