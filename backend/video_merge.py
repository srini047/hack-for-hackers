import moviepy
import tkinter as tk
from tkinter import filedialog, messagebox


def open_file_dialog():
    file_paths = filedialog.askopenfilenames(
        title="Select video files",
        filetypes=[
            ("Video files", "*.mp4 *.mkv *.mov"),
            ("MP4 files", "*.mp4"),
            ("MKV files", "*.mkv"),
            ("MOV files", "*.mov"),
        ]
    )
    for file_path in file_paths:
        listbox.insert(tk.END, file_path)


def remove_selected_files():
    selected_indices = listbox.curselection()
    for index in reversed(selected_indices):
        listbox.delete(index)


def merge_videos():
    file_paths = listbox.get(0, tk.END)

    if not file_paths:
        messagebox.showerror("Error", "No videos selected!")
        return

    try:
        video_clips = [moviepy.VideoFileClip(video) for video in file_paths]

        final_video = moviepy.concatenate_videoclips(
            video_clips,
            method="compose"  # required for mixed formats/resolutions
        )

        final_video.write_videofile(
            "htf_hacker_house_demo.mp4",
            codec="libx264",
            audio_codec="aac"
        )

        messagebox.showinfo("Success", "Videos merged successfully!")

    except Exception as e:
        messagebox.showerror("Error", str(e))


root = tk.Tk()
root.title("Video Merger")

listbox = tk.Listbox(root, selectmode=tk.MULTIPLE, width=80)
listbox.pack(pady=10)

tk.Button(root, text="Add Videos", command=open_file_dialog).pack(pady=5)
tk.Button(root, text="Remove Selected", command=remove_selected_files).pack(pady=5)
tk.Button(root, text="Merge Videos", command=merge_videos).pack(pady=5)

root.mainloop()

